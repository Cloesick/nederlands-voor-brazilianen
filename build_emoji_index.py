"""Merges emojibase pt + nl compact datasets into one bilingual search index.
Source: https://github.com/milesj/emojibase (emojibase-data, CLDR-derived).
Output: data/emoji/index.json = list of [emoji, label_pt, tags_pt, label_nl, tags_nl]
"""
import json, io, os

here = os.path.dirname(os.path.abspath(__file__))
folder = os.path.join(here, "data", "emoji")

def load(name):
    with io.open(os.path.join(folder, name), encoding="utf-8") as f:
        return {e["hexcode"]: e for e in json.load(f)}

pt, nl = load("pt.json"), load("nl.json")
out = []
for hexcode, e in pt.items():
    if "group" not in e:          # skip regional indicators etc.
        continue
    n = nl.get(hexcode)
    if not n:
        continue
    out.append([
        e["unicode"],
        e.get("label", ""), " ".join(e.get("tags", [])),
        n.get("label", ""), " ".join(n.get("tags", [])),
    ])

with io.open(os.path.join(folder, "index.json"), "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
print(f"emoji index: {len(out)} entries, {os.path.getsize(os.path.join(folder,'index.json'))//1024} KB")
