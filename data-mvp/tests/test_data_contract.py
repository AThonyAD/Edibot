"""Contract and regression checks for editorial data, not application UI tests."""
from copy import deepcopy
import csv
import json
from pathlib import Path
import sys
import tempfile
import unittest

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tools'))
from validate import read_json, validate_dataset, validate_submission
from import_csv import convert


class DatasetContract(unittest.TestCase):
    @classmethod
    def setUpClass(cls): cls.fixture=read_json(ROOT/'data/dataset.json')
    def setUp(self): self.data=deepcopy(self.fixture)
    def errors(self): return validate_dataset(self.data)['errors']
    def test_reference_pilot_and_direct_counts(self):
        report=validate_dataset(self.data)
        self.assertEqual(report['errors'],[])
        self.assertEqual(report['counts']['editions'],37)
        self.assertEqual(report['counts']['editorial_topics'],47)
        self.assertEqual(len(report['warnings']),2)
    def test_reference_pilot_is_not_falsely_publishable(self):
        self.assertTrue(validate_dataset(self.data,publishable=True)['errors'])
    def test_removed_on_sale_date_is_rejected(self):
        self.data['editions'][0]['on_sale_date']=None
        self.assertTrue(self.errors())
    def test_rate_card_or_vat_status_is_not_in_price_contract(self):
        self.data['page_price_estimates'][0]['vat_status']='included'
        self.assertTrue(self.errors())
    def test_impossible_calendar_date(self):
        self.data['editions'][0]['publication_date']['start']='2026-02-30'
        self.assertTrue(self.errors())
    def test_reversed_interval(self):
        self.data['editions'][0]['publication_date']['end']='2025-01-01'
        self.assertTrue(self.errors())
    def test_dangling_media(self):
        self.data['editorial_topics'][0]['media_title_id']='missing'
        self.assertTrue(self.errors())
    def test_topic_edition_scope(self):
        self.data['editorial_topics'][0]['edition_id']='edition-hrot-01'
        self.assertTrue(self.errors())
    def test_parent_cycles(self):
        self.data['editorial_topics'][0]['parent_topic_id']=self.data['editorial_topics'][0]['id']
        self.assertTrue(self.errors())
    def test_duplicate_identity(self):
        self.data['editions'][1]['id']=self.data['editions'][0]['id']
        self.assertTrue(self.errors())
    def test_unknown_iptc_concept(self):
        self.data['editorial_topics'][0]['iptc_assignments'][0]['concept_uri']='http://cv.iptc.org/newscodes/mediatopic/99999999'
        self.assertTrue(self.errors())
    def test_retired_iptc_concept(self):
        uri=self.data['editorial_topics'][0]['iptc_assignments'][0]['concept_uri']
        next(c for c in self.data['taxonomy']['concepts'] if c['uri']==uri)['retired']=True
        self.assertTrue(self.errors())
    def test_wrong_taxonomy_release(self):
        self.data['editorial_topics'][0]['iptc_assignments'][0]['taxonomy_release']='2025-01-01'
        self.assertTrue(self.errors())
    def test_evidence_page_bound(self):
        self.data['evidence'][0]['page']=999
        self.assertTrue(self.errors())
    def test_missing_source(self):
        self.data['evidence'][0]['source_id']='missing-source'
        self.assertTrue(self.errors())
    def test_evidence_pointer_must_exist(self):
        self.data['evidence'][0]['field_paths']=['/not_a_field']
        self.assertTrue(self.errors())
    def test_evidence_must_belong_to_record(self):
        self.data['editorial_topics'][0]['evidence_ids']=[self.data['evidence'][0]['id']]
        self.assertTrue(self.errors())
    def test_deadline_after_publication_is_review_warning(self):
        self.data['editions'][0]['booking_deadline'].update(start='2026-02-01',end='2026-02-01')
        report=validate_dataset(self.data)
        self.assertEqual(report['errors'],[])
        self.assertTrue(any('deadline after publication' in w for w in report['warnings']))
    def test_historical_dates_do_not_mark_topics_published(self):
        before=deepcopy(self.data)
        validate_dataset(self.data)
        self.assertEqual(self.data,before)
        self.assertTrue(all(t['editorial_status']=='planned' for t in self.data['editorial_topics']))
    def test_unassigned_topic_and_month_precision_are_supported(self):
        topic=self.data['editorial_topics'][0]
        topic['edition_id']=None
        topic['planning_period']={'start':'2026-07-01','end':'2026-08-31','precision':'range',
            'text_raw':'červenec/srpen 2026','normalization':'period_from_label'}
        self.assertEqual(self.errors(),[])
    def test_no_fake_audit_for_publisher_circulation(self):
        self.data['circulation_observations'][0]['audit_status']='audited'
        self.assertTrue(self.errors())
    def test_zero_is_not_missing_price(self):
        self.data['page_price_estimates'][0]['approx_page_price_net']=0
        self.assertEqual(self.errors(),[])
    def test_reviewed_status_cannot_hide_pending_classification(self):
        self.data['editorial_topics'][0]['curation_status']='reviewed'
        self.assertTrue(self.errors())
    def test_unmapped_classification_needs_documented_reason(self):
        topic=next(t for t in self.data['editorial_topics'] if not t['iptc_assignments'])
        topic['classification_status']='reviewed_unmapped'
        self.assertTrue(self.errors())
    def test_cross_year_deadline_preserved(self):
        item=next(r for r in self.data['editions'] if r['id']=='edition-hrot-01')
        self.assertEqual(item['booking_deadline']['start'],'2025-12-19')
        self.assertEqual(item['publication_date']['start'],'2026-01-14')


class PublisherIntake(unittest.TestCase):
    def test_bom_csv_and_partial_update_default(self):
        before=(ROOT/'data/dataset.json').read_bytes()
        result=convert(ROOT/'examples/publisher-submission.csv','source-test','2026-11-04')
        self.assertEqual(result['export_scope'],'partial_update')
        self.assertEqual(len(result['rows']),1)
        self.assertEqual(validate_submission(result),[])
        self.assertEqual((ROOT/'data/dataset.json').read_bytes(),before)
    def fixture(self,rows,delimiter=','):
        directory=tempfile.TemporaryDirectory();self.addCleanup(directory.cleanup)
        path=Path(directory.name)/'input.csv'
        with path.open('w',encoding='utf-8',newline='') as f:
            csv.writer(f,delimiter=delimiter).writerows(rows)
        return path
    def test_semicolon_csv_with_quoted_description(self):
        path=self.fixture([['medium','edition','topic','description','publication_date','booking_deadline','materials_deadline'],
            ['Titul','1/2027','Téma','Část první; část druhá','2027-01-15','','']],delimiter=';')
        result=convert(path,'source-test','2026-11-04')
        self.assertEqual(result['rows'][0]['description'],'Část první; část druhá')
        self.assertIsNone(result['rows'][0]['booking_deadline'])
    def test_ambiguous_date_is_not_guessed(self):
        path=self.fixture([['medium','edition','topic','description','publication_date','booking_deadline','materials_deadline'],
            ['Titul','','Téma','','1/2/2027','','']])
        with self.assertRaises(ValueError):convert(path,'source-test','2026-11-04')
    def test_duplicate_publisher_item_id(self):
        row=['Titul','','Téma','','','','','publisher-1']
        path=self.fixture([['medium','edition','topic','description','publication_date','booking_deadline','materials_deadline','publisher_item_id'],row,row])
        with self.assertRaises(ValueError):convert(path,'source-test','2026-11-04')
    def test_unknown_header_is_visible(self):
        path=self.fixture([['medium','edition','topic','description','publication_date','booking_deadline','materials_deadline','mystery'],
            ['Titul','','Téma','','','','','x']])
        with self.assertRaises(ValueError):convert(path,'source-test','2026-11-04')
    def test_blank_required_topic_is_rejected(self):
        path=self.fixture([['medium','edition','topic','description','publication_date','booking_deadline','materials_deadline'],
            ['Titul','','','','','','']])
        with self.assertRaises(ValueError):convert(path,'source-test','2026-11-04')
    def test_full_plan_requires_explicit_year(self):
        with self.assertRaises(ValueError):
            convert(ROOT/'examples/publisher-submission.csv','source-test','2026-11-04',scope='full_plan')


if __name__=='__main__':unittest.main()
