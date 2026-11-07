import{loadRepository,esc,norm,actorClaim,evidenceHtml}from'./data-loader.js';
import { initEvolution } from './evolution.js';
const d=await loadRepository();let cat='all',stance='all',q='';
const $ = id => document.getElementById(id);
const title = $('title');
const subtitle = $('subtitle');
const notice = $('notice');
const categories = $('categories');
const stances = $('stances');
const count = $('count');
const grid = $('grid');
const search = $('search');
const clearSearch = $('clear-search');
const reset = $('reset');
const dialog = $('dialog');
const detail = $('detail');
const evolutionRoot = $('evolution-root');
const eligible=()=>d.actors.filter(a=>a.id!==d.meta.id&&a.display_in_cards!==false&&actorClaim(d,a.id)?.status==='qualified_source');
const stanceColor=s=>d.taxonomy.stances[s]?.color||'#64748b';
function filters(){const actors=eligible();categories.innerHTML=Object.entries(d.taxonomy.categories).filter(([k])=>k!=='project'&&(k==='all'||eligible().some(a=>a.categories.includes(k)))).map(([k,v])=>`<button class="filter ${cat===k?'active':''}" type="button" data-cat="${esc(k)}" aria-pressed="${cat===k}"><span>${esc(v.label)}</span><b>${k==='all'?actors.length:actors.filter(a=>a.categories.includes(k)).length}</b></button>`).join('');stances.innerHTML=Object.entries(d.taxonomy.stances).map(([k,v])=>`<button class="filter ${stance===k?'active':''}" type="button" data-stance="${esc(k)}" aria-pressed="${stance===k}"><span>${esc(v.label)}</span><b>${k==='all'?eligible().filter(a=>d.claims.some(c=>c.subject_id===a.id)).length:eligible().filter(a=>d.claims.some(c=>c.subject_id===a.id&&c.value===k)).length}</b></button>`).join('')}
function searchable(a,c){return norm([a.name,a.short_name,a.description,...(a.roles||[]).map(r=>r.label),c?.summary,c?.certainty,...(c?.evidence_ids||[]).map(id=>d.evidenceById.get(id)?.text)].join(' '))}
function render(){const all=eligible(),list=all.filter(a=>{const c=actorClaim(d,a.id);return(cat==='all'||a.categories.includes(cat))&&(stance==='all'||c?.value===stance)&&(!q||searchable(a,c).includes(q))});count.textContent=`${list.length} acteur${list.length>1?'s':''} affiché${list.length>1?'s':''} sur ${all.length}`;grid.innerHTML=list.length?list.map(a=>{const c=actorClaim(d,a.id);return `<article class="card" data-id="${esc(a.id)}" tabindex="0" role="button" aria-label="Ouvrir la fiche de ${esc(a.name)}" style="--stance:${stanceColor(c?.value)}"><h3>${esc(a.name)}</h3><div class="role">${esc(a.description)}</div><p class="position">${esc(c?.summary||'Position non renseignée')}</p><div class="footer"><span class="badge">${esc(d.taxonomy.stances[c?.value]?.label||'Non qualifié')}</span><span>Certitude : ${esc(d.taxonomy.certainty_levels[c?.certainty]?.label||'Non qualifiée')}</span></div></article>`}).join(''):'<div class="list-card">Aucun acteur ne correspond à la recherche et aux filtres sélectionnés.</div>'}
function renderGriefs(){const items=d.content?.griefs||[];$('griefs-grid').innerHTML=items.length?items.map(x=>`<article class="grief-card"><h2>${esc(x.icon||'')} ${esc(x.title)}</h2><p>${esc(x.text)}</p>${x.evidence_ids?.length?`<h3>Éléments documentaires</h3>${evidenceHtml(d,x.evidence_ids)}`:''}</article>`).join(''):'<div class="list-card">Aucun axe d’opposition renseigné.</div>'}
function renderVigilance(){const items=d.content?.vigilance||[];$('vigilance-list').innerHTML=items.length?items.map(x=>`<article class="vigilance-item"><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p>${x.evidence_ids?.length?evidenceHtml(d,x.evidence_ids):''}</article>`).join(''):'<p class="muted">Aucun point de vigilance renseigné.</p>'}
function renderSources(){$('sources-list').innerHTML=d.sources.length?d.sources.map(s=>{const meta=[s.publisher,s.source_type,s.published_at].filter(Boolean).map(esc).join(' · '),heading=s.url?`<h3><a class="source-link" target="_blank" rel="noopener" href="${esc(s.url)}">${esc(s.title)}</a></h3>`:`<h3>${esc(s.title)}</h3>`;return `<article class="source-item">${heading}${meta?`<div class="source-meta">${meta}</div>`:''}${s.url?'':'<span class="source-status">URL à compléter</span>'}</article>`}).join(''):'<p class="muted">Aucune source renseignée.</p>'}
function openActor(id){const a=d.actorById.get(id);if(!a)return;const c=actorClaim(d,id),rels=d.relations.filter(r=>r.status==='qualified_source'&&(r.source_id===id||r.target_id===id));detail.innerHTML=`<h2>${esc(a.name)}</h2><p class="role">${esc(a.description)}</p><h3>Position</h3><p>${esc(c?.summary||'Non renseignée')}</p><p><b>Certitude :</b> ${esc(d.taxonomy.certainty_levels[c?.certainty]?.label||'Non qualifiée')}</p><h3>Preuves et sources</h3>${evidenceHtml(d,c?.evidence_ids)}<h3>Relations documentables</h3>${rels.length?rels.map(r=>{const oid=r.source_id===id?r.target_id:r.source_id,o=d.actorById.get(oid);return `<div class="relation"><button type="button" data-open="${esc(o?.id||'')}">${esc(o?.name||'Acteur inconnu')}</button><div><b>${esc(d.taxonomy.relation_types[r.type]?.label||r.type)}</b></div><p>${esc(r.summary)}</p><small>Certitude : ${esc(d.taxonomy.certainty_levels[r.certainty]?.label||r.certainty)} · ${r.evidence_ids.length} preuve(s)</small></div>`}).join(''):'<p class="muted">Aucune relation.</p>'}`;if(!dialog.open)dialog.showModal()}
function switchTab(name,button){document.querySelectorAll('.tab-btn').forEach(b=>{const on=b===button;b.classList.toggle('active',on);b.setAttribute('aria-selected',String(on))});document.querySelectorAll('.tab-content').forEach(x=>x.classList.remove('active'));$(`tab-${name}`)?.classList.add('active')}
document.addEventListener('click',e=>{const c=e.target.closest('[data-cat]'),s=e.target.closest('[data-stance]'),card=e.target.closest('.card'),op=e.target.closest('[data-open]'),tab=e.target.closest('.tab-btn');if(c){cat=c.dataset.cat;filters();render()}if(s){stance=s.dataset.stance;filters();render()}if(card)openActor(card.dataset.id);if(op)openActor(op.dataset.open);if(tab)switchTab(tab.dataset.tab,tab)});
document.addEventListener('keydown',e=>{const card=e.target.closest('.card');if(card&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openActor(card.dataset.id)}});
search.addEventListener('input',e=>{q=norm(e.target.value);clearSearch.classList.toggle('visible',q.length>0);render()});clearSearch.onclick=()=>{q='';search.value='';clearSearch.classList.remove('visible');render();search.focus()};reset.onclick=()=>{cat='all';stance='all';q='';search.value='';clearSearch.classList.remove('visible');filters();render()};document.querySelector('.close').onclick=()=>dialog.close();
filters();
render();
renderGriefs();
renderVigilance();
renderSources();
initEvolution({
  repository: d,
  root: evolutionRoot
});

/* Chronologie sourcée sans modifier l'onglet « Évolution des acteurs ». */
const citeRefs=ids=>{const m=new Map();for(const id of ids||[]){const x=d.evidenceById.get(id),s=x&&d.sourceById.get(x.source_id);if(s&&s.url)m.set(s.id,s)}return [...m.values()].map(s=>'<a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.publisher||s.title)+'</a>').join(' · ')};
const fmtDate=m=>m.period_precision==='year'?m.date.slice(0,4):m.period_precision==='month'?m.date.slice(0,7):m.date;
document.getElementById('chronology-list').innerHTML=(d.content?.milestones||[]).map(m=>'<article class="chrono-card '+(m.status==='forecast'?'future':'')+'"><span class="chrono-date">'+esc(fmtDate(m))+' · '+(m.status==='forecast'?'PRÉVISION':m.status==='reported'?'ÉLÉMENT RAPPORTÉ':'DOCUMENTÉ')+'</span><h3>'+esc(m.title)+'</h3><p>'+esc(m.details)+'</p><small>Sources : '+citeRefs(m.evidence_ids)+'</small></article>').join('');
document.getElementById('fact-sheet').innerHTML=(d.content?.fact_sheet||[]).map(f=>'<article class="chrono-card"><h3>'+esc(f.label)+'</h3><p><strong>'+esc(f.value)+'</strong></p><p>'+esc(f.qualifier)+'</p><small>Sources : '+citeRefs(f.evidence_ids)+'</small></article>').join('');
