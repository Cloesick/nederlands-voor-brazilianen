"""Validates the course data files. Exits non-zero on any error.

Run locally:  python scripts/validate_data.py
Runs in CI:   .github/workflows/validate-data.yml (every push/PR touching data/)

Why: lessons, the daily word and the monthly list are edited by hand AND by
unattended Claude workflows that commit straight to main. A single bad JSON
file or an out-of-range exercise answer breaks the app for every learner, and
nothing else in the repo would notice. Standard library only, no install step.
"""
import glob
import io
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROLES = {"qw", "verb", "noun", "art", "pron", "prep", "adj", "adv", "neg",
         "num", "conj", "part", "punc", "x"}
UNITS = {"A1", "A2", "B1", "B2", "C1", "C2"}
EXERCISE_TYPES = {"mc", "listen", "fill", "order", "match"}

errors = []
warnings = []


def err(path, msg):
    errors.append(f"{os.path.relpath(path, ROOT)}: {msg}")


def warn(path, msg):
    warnings.append(f"{os.path.relpath(path, ROOT)}: {msg}")


def load(path):
    try:
        with io.open(path, encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:  # noqa: BLE001 - report any parse failure
        err(path, f"invalid JSON: {e}")
        return None


def check_tokens(path, where, tokens):
    if not isinstance(tokens, list) or not tokens:
        err(path, f"{where}: must be a non-empty list of {{t, r}} tokens")
        return
    for i, tok in enumerate(tokens):
        if not isinstance(tok, dict) or "t" not in tok or "r" not in tok:
            err(path, f"{where}[{i}]: token needs 't' and 'r'")
        elif tok["r"] not in ROLES:
            err(path, f"{where}[{i}]: unknown role {tok['r']!r} (word {tok['t']!r})")


def check_phrase(path, where, ph):
    check_tokens(path, f"{where}.nl", ph.get("nl"))
    check_tokens(path, f"{where}.pt", ph.get("pt"))


def check_exercise(path, where, ex):
    t = ex.get("type")
    if t not in EXERCISE_TYPES:
        err(path, f"{where}: unknown exercise type {t!r}")
        return
    if not ex.get("explain"):
        warn(path, f"{where} ({t}): missing 'explain'")
    if t in ("mc", "listen"):
        opts = ex.get("options") or []
        ans = ex.get("answer")
        if len(opts) < 2:
            err(path, f"{where} ({t}): needs at least 2 options")
        if not isinstance(ans, int) or not 0 <= ans < len(opts):
            err(path, f"{where} ({t}): answer {ans!r} is not a valid index into {len(opts)} options")
    elif t == "fill":
        if not isinstance(ex.get("answer"), str) or not ex["answer"].strip():
            err(path, f"{where} (fill): answer must be a non-empty string")
    elif t == "order":
        tokens = ex.get("tokens") or []
        if len(tokens) < 2:
            err(path, f"{where} (order): needs at least 2 tokens")
        elif ex.get("answer") != " ".join(tokens):
            err(path, f"{where} (order): answer must equal the tokens joined by spaces "
                      f"(SCHEMA.md): {ex.get('answer')!r} vs {' '.join(tokens)!r}")
    elif t == "match":
        pairs = ex.get("pairs") or []
        if len(pairs) < 2 or any(not isinstance(p, list) or len(p) != 2 for p in pairs):
            err(path, f"{where} (match): pairs must be a list of [nl, pt] pairs (at least 2)")


def check_lessons():
    folder = os.path.join(ROOT, "data", "lessons")
    files = sorted(p for p in glob.glob(os.path.join(folder, "*.json"))
                   if os.path.basename(p) != "index.json")
    lessons = {}
    for path in files:
        L = load(path)
        if L is None:
            continue
        lid = os.path.splitext(os.path.basename(path))[0]
        for key in ("id", "unit", "title", "emoji", "phrases", "vocab", "exercises"):
            if key not in L:
                err(path, f"missing required key {key!r}")
        if L.get("id") != lid:
            err(path, f"id {L.get('id')!r} does not match filename {lid!r}")
        if L.get("unit") not in UNITS:
            err(path, f"unit {L.get('unit')!r} not in {sorted(UNITS)}")
        for i, ph in enumerate(L.get("phrases", [])):
            check_phrase(path, f"phrases[{i}]", ph)
        for i, ex in enumerate(L.get("exercises", [])):
            check_exercise(path, f"exercises[{i}]", ex)
        infographic = L.get("infographic")
        if infographic and not os.path.exists(os.path.join(ROOT, infographic)):
            err(path, f"infographic {infographic!r} does not exist")
        lessons[lid] = L

    index_path = os.path.join(folder, "index.json")
    index = load(index_path)
    if index is None:
        return
    listed = {e.get("id"): e for e in index.get("lessons", [])}
    for lid, L in lessons.items():
        entry = listed.get(lid)
        if entry is None:
            err(index_path, f"lesson {lid!r} exists but is not listed: add it to ORDER in "
                            "build_manifest.py and run `python build_manifest.py`")
            continue
        for key in ("phrases", "exercises", "vocab"):
            if entry.get(key) != len(L.get(key, [])):
                err(index_path, f"{lid}: {key} count {entry.get(key)} is stale (file has "
                                f"{len(L.get(key, []))}); run `python build_manifest.py`")
    for lid in listed:
        if lid not in lessons:
            err(index_path, f"lists {lid!r} but data/lessons/{lid}.json does not exist")


def check_daily():
    folder = os.path.join(ROOT, "data", "daily")
    for path in sorted(glob.glob(os.path.join(folder, "*.json"))):
        D = load(path)
        if D is None:
            continue
        name = os.path.splitext(os.path.basename(path))[0]
        if name != "latest" and D.get("date") != name:
            err(path, f"date {D.get('date')!r} does not match filename")
        word = D.get("word") or {}
        for key in ("nl", "pt", "emoji"):
            if not word.get(key):
                err(path, f"word.{key} is missing")
        if "phrase" not in D:
            err(path, "missing 'phrase'")
        else:
            check_phrase(path, "phrase", D["phrase"])


def check_monthly():
    folder = os.path.join(ROOT, "data", "maandelijst")
    months = set()
    for path in sorted(glob.glob(os.path.join(folder, "*.json"))):
        if os.path.basename(path) == "index.json":
            continue
        M = load(path)
        if M is None:
            continue
        name = os.path.splitext(os.path.basename(path))[0]
        months.add(name)
        if M.get("month") != name:
            err(path, f"month {M.get('month')!r} does not match filename")
        cards = M.get("cards") or []
        if not cards:
            err(path, "has no cards")
        for i, c in enumerate(cards):
            if not c.get("nl") or not c.get("pt"):
                err(path, f"cards[{i}] needs 'nl' and 'pt'")
    index_path = os.path.join(folder, "index.json")
    if os.path.exists(index_path):
        index = load(index_path)
        if index is not None:
            listed = {e.get("month") for e in index}
            for m in sorted(months - listed):
                err(index_path, f"month {m} has a file but is not in the index")
            for m in sorted(listed - months):
                err(index_path, f"lists month {m} but the file does not exist")


def check_all_json_parses():
    for path in glob.glob(os.path.join(ROOT, "data", "**", "*.json"), recursive=True):
        load(path)
    for name in ("manifest.json", "vercel.json", "package.json"):
        load(os.path.join(ROOT, name))


def main():
    check_all_json_parses()
    if not errors:  # the structural checks assume the files parse
        check_lessons()
        check_daily()
        check_monthly()
    for w in warnings:
        print(f"warning: {w}")
    for e in errors:
        print(f"ERROR: {e}")
    # de-duplicate parse errors reported by more than one pass
    print(f"\n{len(set(errors))} error(s), {len(warnings)} warning(s)")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
