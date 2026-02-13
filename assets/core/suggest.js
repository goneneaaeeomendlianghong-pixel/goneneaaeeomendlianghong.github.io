function jaccard(a, b) {
  const A = new Set(a || []);
  const B = new Set(b || []);
  const inter = [...A].filter(x => B.has(x)).length;
  const uni = new Set([...A, ...B]).size || 1;
  return inter / uni;
}

function tokenizeText(text) {
  const STOP = new Set(['的','了','和','与','在','是','就','也','都','且','及','并','或','而','被','把','等']);
  const out = [];
  const asciiWords = ((text || '').toLowerCase().match(/[a-z0-9]+/g) || []);
  for (const w of asciiWords) {
    if (w.length <= 1) continue;
    out.push(w);
  }
  const han = (text.match(/[\u4e00-\u9fff]/g) || []);
  for (let i = 0; i < han.length - 1; i++) {
    const bi = han[i] + han[i + 1];
    if (STOP.has(han[i]) || STOP.has(han[i+1])) continue;
    out.push(bi);
  }
  return Array.from(new Set(out)).slice(0, 100);
}

export function buildSuggestions(features, records) {
  if (!features || !features.text) return [];
  const tokens = tokenizeText(features.text);
  if (tokens.length === 0) return [];
  const scored = [];
  for (const r of records) {
    const text = (r.text || '') + ' ' + ((r.tags || []).join(' '));
    const rTokens = tokenizeText(text);
    const set = new Set(rTokens);
    const hits = tokens.filter(t => set.has(t)).length;
    if (hits > 0) {
      scored.push({
        id: r.id,
        title: (r.text || '').slice(0, 60),
        score: hits,
        scene: r.scene,
        time: r.time,
        tags: r.tags,
      });
    }
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, 8);
}
