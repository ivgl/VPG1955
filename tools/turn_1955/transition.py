#!/usr/bin/env python3
"""VPI 1955: read-only preflight. No GM decisions and NO HEAD writes.

This module is deliberately incompatible with the old ALT/BOR pilot (1976/1977).
The human judge and administrator approve decisions before an external publisher
may write next-year snapshots or player sheets.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
from pathlib import Path

COUNTRIES = ("USA", "SUN", "GBR", "FRA", "DEU", "JPN",
             "CHN", "EGY", "IND", "ISR", "ITA", "YUG")
ALIASES = {"URS": "SUN", "USSR": "SUN", "FRG": "DEU"}
PHASES = ("PREPARE", "RECEIVING", "LOCKED", "IN_REVIEW", "ADMIN_APPROVED",
          "VERDICTS_PUBLISHED", "APPEALS_OPEN", "APPEALS_REVIEW",
          "FINAL_APPROVED", "COMMITTED", "NEXT_PREPARE")
FINANCIAL_FIELDS = ("gdp_g", "budget_revenue_g", "budget_spend_g",
                    "budget_balance_g", "domestic_debt_g", "external_debt_g",
                    "total_debt_g", "exports_g", "imports_g", "trade_balance_g",
                    "reserves_g")


class PreflightError(ValueError):
    pass


def require(ok, message):
    if not ok:
        raise PreflightError(message)


def canonical_country(code):
    return ALIASES.get(code, code)


def validate_countries(country_ids):
    require(isinstance(country_ids, (list, tuple)) and len(country_ids) == 12,
            "Expected exactly twelve country IDs")
    require(len(set(country_ids)) == 12 and set(country_ids) == set(COUNTRIES),
            "Wrong/duplicate IDs: ALT, BOR and canonical URS/FRG forbidden")


def num(v, label, nonnegative=False):
    require(isinstance(v, (int, float)) and not isinstance(v, bool)
            and math.isfinite(v), f"{label}: invalid number")
    if nonnegative:
        require(v >= 0, f"{label}: negative amount")
    return float(v)


def close(v, expected, label):
    require(abs(v - expected) <= .001, f"{label}: {v} != {expected}")


def validate_economy(cid, d):
    require(isinstance(d, dict), cid + ": economy missing")
    missing = set(FINANCIAL_FIELDS) - set(d)
    require(not missing, cid + f": missing {sorted(missing)}")
    v = {k: num(d[k], cid + ":" + k, k not in ("budget_balance_g",
                                             "trade_balance_g"))
         for k in FINANCIAL_FIELDS}
    require(v["gdp_g"] > 0, cid + ": GDP <= 0")
    close(v["budget_revenue_g"] - v["budget_spend_g"],
          v["budget_balance_g"], cid + ": fiscal balance")
    close(v["domestic_debt_g"] + v["external_debt_g"],
          v["total_debt_g"], cid + ": public debt")
    close(v["exports_g"] - v["imports_g"],
          v["trade_balance_g"], cid + ": trade balance")
    for field in ("sector_shares_pct", "age_shares_pct",
                  "export_category_shares_pct", "import_category_shares_pct"):
        shares = d.get(field)
        if shares is not None:
            require(isinstance(shares, list) and shares, cid + ":" + field)
            close(sum(num(x, field, nonnegative=True) for x in shares),
                  100, cid + ":" + field)
    # Missing population/employment/military information is NOT zero.


def validate_context(d, year=1955):
    require(d.get("schema") == "vpi1955-context-1", "Wrong context schema")
    require(d.get("campaign_id") == "VPI1955_MAIN", "Wrong campaign")
    require(d.get("year") == year, "Wrong context year")
    require(d.get("money_unit") == "G$", "Game currency must be G$")
    validate_countries(d.get("country_ids"))
    require(d.get("roles") == {"primary_judge": "Игорь",
                               "final_authority": "Администратор"},
            "Judge/administrator roles changed")
    sheets = d.get("player_sheets", {})
    require(set(sheets) == set(COUNTRIES), "Not all country sheets present")
    require(all(isinstance(u, str) and u.startswith(
        "https://docs.google.com/spreadsheets/d/") for u in sheets.values()),
        "Missing Google Sheets link")
    for k, v in d.items():
        if k.endswith("_head") or k.endswith("_head_id"):
            require(v is None or "1976" not in str(v) and "1977" not in str(v),
                    "Do not reuse the 1976/1977 HEAD")


def validate_snapshot(d, year=1955):
    require(d.get("campaign_id") == "VPI1955_MAIN", "Wrong state campaign")
    require(d.get("year") == year, "Wrong snapshot year")
    require(isinstance(d.get("countries"), dict), "Countries missing")
    validate_countries(list(d["countries"]))
    for cid, country in d["countries"].items():
        validate_economy(cid, country.get("economy", {}))
    require(isinstance(d.get("world"), dict), "Unified world missing")
    effects = d.get("applied_effect_ids", [])
    require(isinstance(effects, list) and len(effects) == len(set(effects)),
            "Duplicate applied effect ID")


def validate_status(d, year=1955):
    require(d.get("campaign_id") == "VPI1955_MAIN"
            and d.get("turn_year") == year, "Wrong turn status")
    require(d.get("phase") in PHASES, "Unknown phase")
    validate_countries(d.get("required_country_ids"))
    if d["phase"] == "PREPARE":
        require(not d.get("locked_submissions"), "PREPARE has locked posts")
    if d["phase"] == "COMMITTED":
        require(bool(d.get("approved_commit_id")), "COMMITTED without approval")


def validate_head(head, manifest_bytes, manifest, year=1955):
    require(head.get("campaign_id") == "VPI1955_MAIN", "Foreign HEAD")
    require(head.get("year") == year, "Wrong HEAD year")
    require(head.get("manifest_sha256") ==
            hashlib.sha256(manifest_bytes).hexdigest(), "Manifest hash mismatch")
    require(manifest.get("campaign_id") == head["campaign_id"]
            and manifest.get("year") == year
            and manifest.get("release_id") == head.get("release_id"),
            "HEAD/manifest mismatch")
    validate_countries(manifest.get("country_ids"))


def preflight_commit(base, next_state, status, approval, publication):
    """Refuse a 1955->1956 COMMIT unless human and release gates passed.

    External tools must write immutable release files, then Sheets, then HEAD.
    This function never writes files or performs Google Drive API calls.
    """
    validate_snapshot(base, 1955)
    validate_snapshot(next_state, 1956)
    validate_status(status, 1955)
    require(status["phase"] == "FINAL_APPROVED", "Appeals/final approval pending")
    require(approval.get("approved_by_human") is True, "Missing human approval")
    require(approval.get("campaign_id") == "VPI1955_MAIN"
            and approval.get("year") == 1955, "Wrong approval")
    require(approval.get("commit_id")
            and approval.get("commit_id") == status.get("approved_commit_id"),
            "Commit ID not approved")
    approved = approval.get("approved_effect_ids")
    require(isinstance(approved, list)
            and len(approved) == len(set(approved)), "Invalid effect ID list")
    old = set(base["applied_effect_ids"])
    new = set(next_state["applied_effect_ids"])
    require(old.issubset(new) and new - old == set(approved),
            "Unapproved/replayed/missing effect")
    require(publication.get("campaign_id") == "VPI1955_MAIN"
            and publication.get("year") == 1956, "Invalid publication receipt")
    require(set(publication.get("player_sheets_verified", [])) == set(COUNTRIES),
            "All 12 next-year sheets must be verified")
    require(publication.get("archive_1955_preserved") is True
            and publication.get("manifest_verified") is True,
            "Unverified manifest or rewritten prior-year sheets")


def load(path):
    raw = Path(path).read_bytes()
    return json.loads(raw), raw


def main():
    p = argparse.ArgumentParser(description="VPI 1955 safe read-only preflight")
    p.add_argument("command", choices=("start", "verify-release", "precommit"))
    p.add_argument("--context", required=True)
    p.add_argument("--status", required=True)
    p.add_argument("--snapshot")
    p.add_argument("--next-snapshot")
    p.add_argument("--head")
    p.add_argument("--manifest")
    p.add_argument("--approval")
    p.add_argument("--publication")
    a = p.parse_args()
    try:
        context, _ = load(a.context)
        status, _ = load(a.status)
        validate_context(context)
        validate_status(status)
        if a.command in ("verify-release", "precommit"):
            require(a.snapshot, "--snapshot is required")
            snapshot, _ = load(a.snapshot)
            validate_snapshot(snapshot)
        if a.command == "verify-release":
            require(a.head and a.manifest, "HEAD and manifest required")
            head, _ = load(a.head)
            manifest, raw = load(a.manifest)
            validate_head(head, raw, manifest)
        if a.command == "precommit":
            require(a.next_snapshot and a.approval and a.publication,
                    "next snapshot, human approval and publication required")
            nxt, _ = load(a.next_snapshot)
            approval, _ = load(a.approval)
            publication, _ = load(a.publication)
            preflight_commit(snapshot, nxt, status, approval, publication)
    except (PreflightError, OSError, json.JSONDecodeError) as exc:
        p.exit(2, "FAILED: " + str(exc) + "\n")
    print("PASS: " + a.command + " | VPI1955_MAIN | 12 countries | read only")


if __name__ == "__main__":
    main()
