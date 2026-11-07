"""Valide la cohérence de la cartographie Cézanne, dont les vues qualifiées."""
import json
from datetime import date
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent

def load(path):
    with (ROOT / path).open(encoding="utf-8") as handle:
        return json.load(handle)

actors = load("data/actors.json")
claims = load("data/claims.json")
evidence = load("data/evidence.json")
relations = load("data/relations.json")
sources = load("data/sources.json")
timeline = load("data/timeline.json")
content = load("data/content.json")
meta = load("data/meta.json")
taxonomy = load("config/taxonomy.json")

def index(label, items):
    result = {item["id"]: item for item in items}
    assert len(result) == len(items), f"Identifiants dupliqués : {label}"
    return result

A = index("acteurs", actors)
C = index("positions", claims)
E = index("preuves", evidence)
R = index("relations", relations)
S = index("sources", sources)
T = index("chronologie", timeline)

assert meta["id"] in A, "Le projet central doit être un acteur"
for actor in actors:
    assert set(actor.get("categories", [])) <= set(taxonomy["categories"]), actor["id"]
for source in sources:
    parsed = urlparse(source.get("url") or "")
    assert parsed.scheme == "https" and parsed.netloc, f"Source non qualifiée : {source['id']}"
for proof in evidence:
    if proof.get("source_id"):
        assert proof["source_id"] in S, f"Référence source inconnue : {proof['id']}"

def has_qualified_proof(item):
    return any(E[ev_id].get("source_id") in S
               for ev_id in item.get("evidence_ids", [])
               if ev_id in E)

for claim in claims:
    assert claim["subject_id"] in A, claim["id"]
    assert claim["value"] in taxonomy["stances"], claim["id"]
    assert claim["certainty"] in taxonomy["certainty_levels"], claim["id"]
    assert set(claim.get("evidence_ids", [])) <= E.keys(), claim["id"]
    if claim.get("status") == "qualified_source":
        assert has_qualified_proof(claim), f"Position sans preuve URL : {claim['id']}"
for rel in relations:
    assert rel["source_id"] in A and rel["target_id"] in A, rel["id"]
    assert rel["type"] in taxonomy["relation_types"], rel["id"]
    assert set(rel.get("evidence_ids", [])) <= E.keys(), rel["id"]
    if rel.get("status") == "qualified_source":
        assert has_qualified_proof(rel), f"Relation sans preuve URL : {rel['id']}"
for event in timeline:
    assert event["actor_id"] in A, event["id"]
    assert set(event.get("source_ids", [])) <= S.keys(), event["id"]
    date.fromisoformat(event["date"])
    assert event["event_type"] == taxonomy["timeline"]["event_type"], event["id"]
for section in ("griefs", "vigilance", "milestones", "fact_sheet"):
    assert isinstance(content.get(section), list), section
    for item in content[section]:
        assert set(item.get("evidence_ids", [])) <= E.keys(), f"{section} / {item}"

qualified_claims = [x for x in claims if x.get("status") == "qualified_source"]
qualified_relations = [x for x in relations if x.get("status") == "qualified_source"]
visible = [x for x in actors if x.get("display_in_cards", True)
           and any(c["subject_id"] == x["id"] for c in qualified_claims)]
print(f"VALIDATION OK : {len(A)} entités, {len(visible)} cartes qualifiées, "
      f"{len(C)} positions ({len(qualified_claims)} qualifiées), "
      f"{len(R)} relations ({len(qualified_relations)} qualifiées), "
      f"{len(E)} preuves, {len(S)} sources URL, {len(T)} événements chronologiques, "
      "5 onglets attendus.")
