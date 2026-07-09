"""Regenerates data/lessons/index.json from the lesson files. Run after adding/editing lessons."""
import json, io, os

ORDER = [
    "a1-01-kennismaken", "a1-02-klanken", "a1-03-de-het", "a1-04-getallen-tijd", "a1-05-familie-huis",
    "a1-06-kleuren-kleding", "a1-07-hobbys-vrije-tijd", "a1-08-weer-kleinpraat",
    "a2-01-v2-vragen", "a2-02-perfectum", "a2-03-winkelen", "a2-04-dokter", "a2-05-vervoer",
    "a2-06-restaurant", "a2-07-richtingen-stad", "a2-08-post-bank-telefoon",
    "b1-01-bijzinnen", "b1-02-scheidbaar", "b1-03-school-creche", "b1-04-gemeente-wonen",
    "b1-05-auto-verkeer", "b1-06-welzijn", "b1-07-uitjes-cultuur",
    "b2-01-solliciteren", "b2-02-bank-wero", "b2-03-klachten",
    "b2-04-debatteren", "b2-05-vastgoed", "b2-06-technologie",
    "c1-01-tussentaal", "c1-02-nieuws-politiek", "c1-03-onderhandelen",
    "c2-01-idiomatiek", "c2-02-schrijfstijl", "c2-03-dialect-humor",
]

here = os.path.dirname(os.path.abspath(__file__))
folder = os.path.join(here, "data", "lessons")
lessons = []
for lid in ORDER:
    path = os.path.join(folder, lid + ".json")
    if not os.path.exists(path):
        print(f"!! missing: {lid}")
        continue
    with io.open(path, encoding="utf-8") as f:
        L = json.load(f)
    lessons.append({
        "id": L["id"], "unit": L["unit"], "title": L["title"], "emoji": L["emoji"],
        "phrases": len(L.get("phrases", [])), "exercises": len(L.get("exercises", [])),
        "vocab": len(L.get("vocab", [])),
    })

out = {"lessons": lessons}
with io.open(os.path.join(folder, "index.json"), "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=1)
print(f"index.json: {len(lessons)} lessons")
