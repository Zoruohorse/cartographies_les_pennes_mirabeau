export async function loadRepository(base = "../../") {
  const paths = {
    meta: "data/meta.json",
    content: "data/content.json",
    actors: "data/actors.json",
    claims: "data/claims.json",
    evidence: "data/evidence.json",
    relations: "data/relations.json",
    sources: "data/sources.json",
    taxonomy: "config/taxonomy.json",
    timeline: "data/timeline.json"
  };

  const entries = await Promise.all(
    Object.entries(paths).map(async ([key, path]) => {
      const response = await fetch(base + path);

      if (!response.ok) {
        throw new Error(`Impossible de charger : ${path}`);
      }

      return [key, await response.json()];
    })
  );

  const d = Object.fromEntries(entries);

  // -----------------------------
  // Acteurs
  // -----------------------------

  d.actorById = new Map(
    d.actors.map(actor => [actor.id, actor])
  );

  // -----------------------------
  // Positions
  // -----------------------------

  d.claimsByActor = new Map();

  d.claims.forEach(claim => {
    if (!d.claimsByActor.has(claim.subject_id)) {
      d.claimsByActor.set(claim.subject_id, []);
    }

    d.claimsByActor.get(claim.subject_id).push(claim);
  });

  // -----------------------------
  // Preuves
  // -----------------------------

  d.evidenceById = new Map(
    d.evidence.map(evidence => [evidence.id, evidence])
  );

  // -----------------------------
  // Sources
  // -----------------------------

  d.sourceById = new Map(
    d.sources.map(source => [source.id, source])
  );

  // -----------------------------
  // Timeline (onglet Évolution)
  // -----------------------------

  d.timelineByActor = new Map();

  (d.timeline || []).forEach(event => {
    if (!d.timelineByActor.has(event.actor_id)) {
      d.timelineByActor.set(event.actor_id, []);
    }

    d.timelineByActor.get(event.actor_id).push(event);
  });

  return d;
}

// ----------------------------------------------------
// Utilitaires
// ----------------------------------------------------

export const esc = value =>
  String(value ?? "").replace(
    /[&<>"']/g,
    match =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      })[match]
  );

export const norm = value =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export function actorClaim(d, actorId) {
  return (d.claimsByActor.get(actorId) || [])
    .find(claim => claim.claim_type === "position" && claim.status === "qualified_source");
}

export function evidenceHtml(d, ids = []) {
  if (!ids.length) {
    return '<p class="muted">Aucune preuve structurée.</p>';
  }

  return ids
    .map(id => {
      const evidence = d.evidenceById.get(id);

      if (!evidence) {
        return "";
      }

      const source = evidence.source_id
        ? d.sourceById.get(evidence.source_id)
        : null;

      const sourceHtml =
        source && source.url
          ? `<a target="_blank" rel="noopener" href="${esc(source.url)}">${esc(source.title)}</a>`
          : "Source à qualifier";

      return `
        <article class="proof">
          <div>${esc(evidence.text)}</div>
          <small>${sourceHtml}</small>
        </article>
      `;
    })
    .join("");
}
