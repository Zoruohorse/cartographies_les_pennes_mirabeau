import json
from pathlib import Path
root=Path(__file__).resolve().parent
load=lambda p:json.loads((root/p).read_text(encoding='utf-8'))
a=load('data/actors.json');c=load('data/claims.json');e=load('data/evidence.json');r=load('data/relations.json');s=load('data/sources.json');syn=load('data/synthesis.json');t=load('config/taxonomy.json');m=load('data/meta.json')
assert m['id']=='project_pennes_mirabeau'
A={x['id'] for x in a};E={x['id'] for x in e};S={x['id'] for x in s}
for dataset in (a,c,e,r,s):assert len({x['id'] for x in dataset})==len(dataset),'identifiant dupliqué'
assert m['id'] in A
assert len(a)==65 and len(r)==87 and len(c)==57 and len(e)==58 and len(s)==9
assert sum(x.get('display_in_cards',True) for x in a)==57
assert len(syn['griefs'])==9 and len(syn['vigilance'])==4 and len(syn['sources'])==9
for x in a:assert all(k in t['categories'] for k in x['categories'])
for x in c:assert x['subject_id'] in A and set(x.get('evidence_ids',[])) <= E and x['value'] in t['stances'] and x['certainty'] in t['certainty_levels']
for x in e:assert x.get('source_id') is None or x['source_id'] in S
for x in r:assert x['source_id'] in A and x['target_id'] in A and x['type'] in t['relation_types'] and set(x.get('evidence_ids',[]))<=E
assert len([x for x in c if len(x['evidence_ids'])>1])==1,'la fiche doublonnée doit préserver deux preuves'
print(f"VALIDATION OK: {len(a)} nœuds, {len(r)} relations, {len(c)} fiches, {len(e)} preuves, {len(s)} sources, 3 onglets")
