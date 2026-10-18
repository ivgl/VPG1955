"""Regression checks for the independent 1955 preflight.

These use synthetic data. They do not change any real campaign state.
Run: python -m unittest discover -s tests -p 'test_turn_1955.py' -v
"""
import copy
import hashlib
import json
import sys
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "tools" / "turn_1955"))
import transition as t


def economy():
    return dict(gdp_g=100, budget_revenue_g=30, budget_spend_g=32,
                budget_balance_g=-2, domestic_debt_g=50, external_debt_g=5,
                total_debt_g=55, exports_g=12, imports_g=14,
                trade_balance_g=-2, reserves_g=3, sector_shares_pct=[30, 50, 20],
                age_shares_pct=[25, 65, 10])


def snapshot(year=1955):
    return dict(campaign_id="VPI1955_MAIN", year=year,
                countries={c: {"economy": economy()} for c in t.COUNTRIES},
                world={"treaties": [], "active_processes": [], "events": []},
                applied_effect_ids=[])


def status(phase="PREPARE"):
    return dict(campaign_id="VPI1955_MAIN", turn_year=1955, phase=phase,
                required_country_ids=list(t.COUNTRIES), locked_submissions=[],
                approved_commit_id="1955-R001")


def context():
    return dict(schema="vpi1955-context-1", campaign_id="VPI1955_MAIN",
                year=1955, money_unit="G$", country_ids=list(t.COUNTRIES),
                roles={"primary_judge": "Игорь",
                       "final_authority": "Администратор"},
                player_sheets={c: "https://docs.google.com/spreadsheets/d/demo_" + c
                               for c in t.COUNTRIES})


def approved():
    return dict(approved_by_human=True, campaign_id="VPI1955_MAIN",
                year=1955, commit_id="1955-R001", approved_effect_ids=["E1"])


def published():
    return dict(campaign_id="VPI1955_MAIN", year=1956,
                player_sheets_verified=list(t.COUNTRIES),
                archive_1955_preserved=True, manifest_verified=True)


class TestMigration(unittest.TestCase):
    def test_start(self):
        t.validate_context(context())
        t.validate_status(status())
        t.validate_snapshot(snapshot())

    def test_wrong_1977_year(self):
        d=context(); d["year"]=1977
        with self.assertRaises(t.PreflightError): t.validate_context(d)

    def test_pilot_codes(self):
        d=context(); d["country_ids"][0]="ALT"
        with self.assertRaises(t.PreflightError): t.validate_context(d)

    def test_legacy_alias_mapping(self):
        self.assertEqual(t.canonical_country("URS"), "SUN")
        self.assertEqual(t.canonical_country("FRG"), "DEU")
        with self.assertRaises(t.PreflightError):
            t.validate_countries(["URS" if c=="SUN" else c
                                  for c in t.COUNTRIES])

    def test_bad_budget(self):
        d=snapshot(); d["countries"]["JPN"]["economy"]["budget_spend_g"]=9
        with self.assertRaises(t.PreflightError): t.validate_snapshot(d)

    def test_bad_trade(self):
        d=snapshot(); d["countries"]["ISR"]["economy"]["trade_balance_g"]=4
        with self.assertRaises(t.PreflightError): t.validate_snapshot(d)

    def test_head_manifest(self):
        man=dict(campaign_id="VPI1955_MAIN", year=1955,
                 release_id="1955-START-R1", country_ids=list(t.COUNTRIES))
        raw=json.dumps(man,sort_keys=True).encode("utf-8")
        head=dict(campaign_id="VPI1955_MAIN", year=1955,
                  release_id="1955-START-R1",
                  manifest_sha256=hashlib.sha256(raw).hexdigest())
        t.validate_head(head, raw, man)
        with self.assertRaises(t.PreflightError):
            t.validate_head(head, raw+b" ", man)

    def test_precommit(self):
        base=snapshot(); nxt=snapshot(1956)
        nxt["applied_effect_ids"]=["E1"]
        t.preflight_commit(base,nxt,status("FINAL_APPROVED"),approved(),published())

    def test_unapproved_effect(self):
        base=snapshot(); nxt=snapshot(1956)
        nxt["applied_effect_ids"]=["E2"]
        with self.assertRaises(t.PreflightError):
            t.preflight_commit(base,nxt,status("FINAL_APPROVED"),approved(),published())

    def test_missing_next_year_sheet(self):
        base=snapshot(); nxt=snapshot(1956)
        nxt["applied_effect_ids"]=["E1"]
        bad=published(); bad["player_sheets_verified"].pop()
        with self.assertRaises(t.PreflightError):
            t.preflight_commit(base,nxt,status("FINAL_APPROVED"),approved(),bad)

    def test_no_approval(self):
        base=snapshot(); nxt=snapshot(1956)
        nxt["applied_effect_ids"]=["E1"]
        bad=approved(); bad["approved_by_human"]=False
        with self.assertRaises(t.PreflightError):
            t.preflight_commit(base,nxt,status("FINAL_APPROVED"),bad,published())

    def test_missing_employment_is_not_zero(self):
        d=snapshot(); d["countries"]["SUN"]["economy"]["employment"]=None
        t.validate_snapshot(d)


if __name__ == "__main__":
    unittest.main()
