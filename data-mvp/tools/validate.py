"""Validate portable EdiBot data without loading or changing the application."""
from __future__ import annotations

import argparse
from collections import Counter
from datetime import date
import json
import math
from pathlib import Path
import sys

from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[1]
COLLECTIONS = (
    'publishers', 'media_titles', 'audience_profiles', 'editions', 'editorial_topics',
    'page_price_estimates', 'circulation_observations', 'sources', 'evidence', 'changes',
    'events', 'sponsorship_offers',
)


def read_json(path):
    def reject_constant(value):
        raise ValueError(f'Non-JSON numeric constant: {value}')
    return json.loads(Path(path).read_text(encoding='utf-8-sig'), parse_constant=reject_constant)


def schema_errors(data, schema_name):
    schema = read_json(ROOT / 'schemas' / schema_name)
    Draft202012Validator.check_schema(schema)
    validator = Draft202012Validator(schema, format_checker=FormatChecker())
    return [f"/{'/'.join(map(str, e.absolute_path))}: {e.message}"
            for e in sorted(validator.iter_errors(data), key=lambda e: str(list(e.absolute_path)))]


def resolve_pointer(record, pointer):
    current = record
    for part in pointer.lstrip('/').split('/'):
        part = part.replace('~1', '/').replace('~0', '~')
        if isinstance(current, list):
            if not part.isdigit(): raise KeyError(part)
            current = current[int(part)]
        else:
            current = current[part]
    return current


def walk_values(value, path=''):
    yield path, value
    if isinstance(value, dict):
        for key, child in value.items(): yield from walk_values(child, path + '/' + key)
    elif isinstance(value, list):
        for i, child in enumerate(value): yield from walk_values(child, path + '/' + str(i))


def validate_submission(data):
    errors = schema_errors(data, 'publisher-submission.schema.json')
    if errors: return errors
    identifiers = set()
    for i, row in enumerate(data['rows']):
        if not row['medium'].strip() or not row['topic'].strip():
            errors.append(f'rows/{i}: medium and topic cannot be whitespace')
        if row['publisher_item_id']:
            key = (row['medium'], row['publisher_item_id'])
            if key in identifiers: errors.append(f'rows/{i}: duplicate publisher_item_id in medium')
            identifiers.add(key)
        for field in ('publication_date', 'booking_deadline', 'materials_deadline'):
            value = row[field]
            if value:
                if value['start'] > value['end']:
                    errors.append(f'rows/{i}/{field}: inverted temporal interval')
                if value['precision']=='day' and value['start']!=value['end']:
                    errors.append(f'rows/{i}/{field}: day precision requires identical boundaries')
    return errors


def validate_dataset(data, publishable=False):
    errors = schema_errors(data, 'dataset.schema.json')
    warnings = []
    if errors: return {'errors': errors, 'warnings': warnings, 'counts': {}}
    index = {name: {r['id']: r for r in data[name]} for name in COLLECTIONS}
    all_ids = [r['id'] for name in COLLECTIONS for r in data[name]]
    for rid, count in Counter(all_ids).items():
        if count > 1: errors.append(f'duplicate record ID: {rid}')

    def require(collection, rid, context, nullable=False):
        if nullable and rid is None: return None
        found = index[collection].get(rid)
        if found is None: errors.append(f'{context}: missing {collection} reference {rid}')
        return found

    for path, value in walk_values(data):
        if isinstance(value, float) and not math.isfinite(value):
            errors.append(path + ': non-finite numeric value')
        if isinstance(value, dict) and {'start','end','precision','normalization','text_raw'} <= value.keys():
            if value['start'] > value['end']: errors.append(path + ': inverted temporal interval')
            if value['precision']=='day' and value['start'] != value['end']:
                errors.append(path + ': day precision requires identical boundaries')

    for name in COLLECTIONS:
        for r in data[name]:
            rid=r['id']
            if 'evidence_ids' in r:
                for eid in r['evidence_ids']:
                    ev=require('evidence',eid,rid)
                    if ev and name!='changes' and (ev['record_id']!=rid or ev['collection']!=name):
                        errors.append(f'{rid}: evidence {eid} belongs to another record')
            if 'curation_status' in r:
                if r['updated_on'] < r['created_on']: errors.append(f'{rid}: updated before creation')
                if r['last_checked_on'] and r['last_checked_on'] > data['as_of']:
                    errors.append(f'{rid}: check date after dataset as_of')
                if r['curation_status']=='reviewed' and not r['evidence_ids']:
                    errors.append(f'{rid}: reviewed record requires evidence')
                if publishable and r['curation_status']!='reviewed':
                    errors.append(f'{rid}: not reviewed for publication')
            if 'media_title_id' in r: require('media_titles',r['media_title_id'],rid)

    for r in data['media_titles']:
        require('publishers',r['publisher_id'],r['id'],nullable=True)
        require('media_titles',r['parent_media_title_id'],r['id'],nullable=True)
        for contact in r['contacts']:
            for eid in contact['evidence_ids']: require('evidence',eid,r['id'])
    for r in data['sources']:
        require('sources',r['parent_source_id'],r['id'],nullable=True)
    for r in data['editions']:
        require('editions',r['parent_edition_id'],r['id'],nullable=True)
        publication=r['publication_date']
        for field in ('booking_deadline','materials_deadline'):
            deadline=r[field]
            if publication and deadline and deadline['start'] > publication['end']:
                warnings.append(f"{r['id']}/{field}: deadline after publication; review source, do not auto-correct")
    for r in data['editorial_topics']:
        edition=require('editions',r['edition_id'],r['id'],nullable=True)
        if edition and edition['media_title_id']!=r['media_title_id']:
            errors.append(f"{r['id']}: topic and edition belong to different media")
        parent=require('editorial_topics',r['parent_topic_id'],r['id'],nullable=True)
        if parent and (parent['media_title_id']!=r['media_title_id'] or parent['edition_id']!=r['edition_id']):
            errors.append(f"{r['id']}: parent topic scope differs")
        if r['classification_status']=='reviewed' and (not r['iptc_assignments'] or any(a['assignment_status']!='reviewed' for a in r['iptc_assignments'])):
            errors.append(f"{r['id']}: reviewed classification requires reviewed assignments")
        if r['classification_status']=='reviewed_unmapped' and r['iptc_assignments']:
            errors.append(f"{r['id']}: reviewed_unmapped must have no assignments")
        if r['classification_status']=='reviewed_unmapped' and not any(
            index['evidence'].get(eid,{}).get('interpretation_note') and
            '/classification_status' in index['evidence'].get(eid,{}).get('field_paths',[])
            for eid in r['evidence_ids']
        ):
            errors.append(f"{r['id']}: reviewed_unmapped requires documented classification reason")
        if r['curation_status']=='reviewed' and r['classification_status']=='pending':
            errors.append(f"{r['id']}: pending classification cannot be reviewed")
        if not r['iptc_assignments']: warnings.append(f"{r['id']}: no IPTC assignment; retain original title")
    for r in data['page_price_estimates']:
        edition=require('editions',r['edition_id'],r['id'],nullable=True)
        if edition and edition['media_title_id']!=r['media_title_id']:
            errors.append(f"{r['id']}: price and edition belong to different media")
    for r in data['circulation_observations']:
        if r['audit_status']=='audited' and r['source_origin']!='abc':
            errors.append(f"{r['id']}: audited observation requires ABC origin in this MVP")
    for r in data['audience_profiles']:
        if r['age_min'] is not None and r['age_max'] is not None and r['age_min']>r['age_max']:
            errors.append(f"{r['id']}: inverted age range")
    for r in data['sponsorship_offers']: require('events',r['event_id'],r['id'])

    concepts={c['uri']:c for c in data['taxonomy']['concepts']}
    if len(concepts)!=len(data['taxonomy']['concepts']): errors.append('duplicate IPTC concept URI')
    require('sources',data['taxonomy']['source_id'],'taxonomy')
    for uri,c in concepts.items():
        if uri.rsplit('/',1)[-1]!=c['code']: errors.append(f'{uri}: concept code mismatch')
        if c['parent_uri'] and c['parent_uri'] not in concepts: errors.append(f'{uri}: missing ancestor')
    for name in ('editorial_topics','events'):
        for r in data[name]:
            seen=set()
            for a in r['iptc_assignments']:
                uri=a['concept_uri']
                if uri in seen: errors.append(f"{r['id']}: duplicate IPTC assignment")
                seen.add(uri)
                if uri not in concepts: errors.append(f"{r['id']}: unknown IPTC concept {uri}")
                elif concepts[uri]['retired']: errors.append(f"{r['id']}: retired IPTC concept {uri}")
                if a['taxonomy_release']!=data['taxonomy']['release']: errors.append(f"{r['id']}: IPTC release mismatch")
                for eid in a['evidence_ids']: require('evidence',eid,r['id'])

    for r in data['evidence']:
        target=require(r['collection'],r['record_id'],r['id'])
        source=require('sources',r['source_id'],r['id'])
        if source and r['page'] is not None and source['page_count'] and r['page']>source['page_count']:
            errors.append(f"{r['id']}: page outside source")
        if target:
            for pointer in r['field_paths']:
                try: resolve_pointer(target,pointer)
                except (KeyError, IndexError, TypeError): errors.append(f"{r['id']}: invalid field pointer {pointer}")
    for r in data['changes']: require(r['collection'],r['record_id'],r['id'])

    def detect_cycles(items, key, label):
        for start in items:
            seen=set();current=start
            while current in items:
                if current in seen:
                    errors.append(f'{label}: parent cycle at {start}');break
                seen.add(current);current=items[current].get(key)
    for name,key in [('media_titles','parent_media_title_id'),('editions','parent_edition_id'),
                     ('editorial_topics','parent_topic_id'),('sources','parent_source_id')]:
        detect_cycles(index[name],key,name)
    detect_cycles(concepts,'parent_uri','IPTC')
    return {'errors':errors,'warnings':warnings,'counts':{name:len(data[name]) for name in COLLECTIONS}}


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('path',nargs='?',default=ROOT/'data/dataset.json')
    parser.add_argument('--submission',action='store_true')
    parser.add_argument('--publishable',action='store_true',help='Require completed curation, not just structurally valid pilot data')
    parser.add_argument('--report',type=Path)
    args=parser.parse_args()
    try:
        data=read_json(args.path)
        report={'errors':validate_submission(data),'warnings':[]} if args.submission else validate_dataset(data,args.publishable)
    except (OSError,ValueError) as exc:
        report={'errors':[str(exc)],'warnings':[]}
    if args.report:
        with args.report.open('x',encoding='utf-8') as f: json.dump(report,f,ensure_ascii=False,indent=2);f.write('\n')
    print(json.dumps(report,ensure_ascii=False,indent=2))
    return 1 if report['errors'] else 0


if __name__=='__main__': sys.exit(main())
