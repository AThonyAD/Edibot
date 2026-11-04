"""Convert a publisher CSV into a candidate submission; never mutate canonical data."""
import argparse
import csv
from datetime import date
import json
from pathlib import Path
import sys

from validate import validate_submission

REQUIRED_HEADERS=('medium','edition','topic','description','publication_date','booking_deadline','materials_deadline')
OPTIONAL_HEADERS=('publisher_item_id','publisher_edition_id','status','updated_at')


def temporal(value):
    if not value: return None
    parsed=date.fromisoformat(value)
    if parsed.isoformat()!=value: raise ValueError(f'Use YYYY-MM-DD dates: {value}')
    return {'start':value,'end':value,'precision':'day','text_raw':value,'normalization':'explicit'}


def convert(path,source_id,received_on,scope='partial_update',reference_year=None):
    date.fromisoformat(received_on)
    with Path(path).open(encoding='utf-8-sig',newline='') as f:
        sample=f.read(8192);f.seek(0)
        try: dialect=csv.Sniffer().sniff(sample,delimiters=',;\t')
        except csv.Error: dialect=csv.excel
        reader=csv.DictReader(f,dialect=dialect)
        headers=reader.fieldnames or []
        if len(headers)!=len(set(headers)): raise ValueError('Duplicate CSV headers')
        missing=set(REQUIRED_HEADERS)-set(headers)
        unknown=set(headers)-set(REQUIRED_HEADERS)-set(OPTIONAL_HEADERS)
        if missing or unknown: raise ValueError(f'Missing headers: {sorted(missing)}; unknown headers: {sorted(unknown)}')
        rows=[]
        for n,raw in enumerate(reader,2):
            if None in raw or any(v is None for v in raw.values()): raise ValueError(f'Row {n}: column count mismatch')
            r={k:v.strip() for k,v in raw.items()}
            if not any(r.values()): continue
            row={k:r.get(k) or None for k in REQUIRED_HEADERS+OPTIONAL_HEADERS}
            row['status']=row['status'] or 'planned'
            try:
                for key in ('publication_date','booking_deadline','materials_deadline'): row[key]=temporal(row[key])
            except ValueError as exc: raise ValueError(f'Row {n}: {exc}') from exc
            rows.append(row)
    result={'schema_version':'1.0.0','source_name':Path(path).name,'source_id':source_id,'received_on':received_on,
        'export_scope':scope,'reference_year':reference_year,'rows':rows}
    errors=validate_submission(result)
    if errors: raise ValueError('\n'.join(errors))
    return result


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('csv',type=Path);p.add_argument('--source-id',required=True)
    p.add_argument('--received-on',required=True,help='Explicit date received, YYYY-MM-DD')
    p.add_argument('--scope',choices=['partial_update','full_plan'],default='partial_update')
    p.add_argument('--reference-year',type=int)
    p.add_argument('--output',type=Path,required=True)
    args=p.parse_args()
    try:
        result=convert(args.csv,args.source_id,args.received_on,args.scope,args.reference_year)
        with args.output.open('x',encoding='utf-8') as f: json.dump(result,f,ensure_ascii=False,indent=2);f.write('\n')
    except (OSError,ValueError) as exc:
        print(str(exc),file=sys.stderr);return 1
    print(f'Prepared {len(result["rows"])} candidate rows; canonical dataset unchanged.')
    return 0


if __name__=='__main__':sys.exit(main())
