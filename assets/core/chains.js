function jaccard(a, b) {
  const A = new Set(a || []);
  const B = new Set(b || []);
  const inter = [...A].filter(x => B.has(x)).length;
  const uni = new Set([...A, ...B]).size || 1;
  return inter / uni;
}

function timeClose(a, b) {
  if (!a.time || !b.time) return 0.2;
  const ha = new Date(a.time).getTime();
  const hb = new Date(b.time).getTime();
  const diff = Math.abs(ha - hb) / 36e5;
  if (diff <= 24) return 1.0;
  if (diff <= 72) return 0.6;
  if (diff <= 168) return 0.4;
  return 0.2;
}

export function buildChains(records) {
  const items = records.slice();
  const chains = [];
  const used = new Set();
  for (let i = 0; i < items.length; i++) {
    const r = items[i];
    if (used.has(r.id)) continue;
    const chain = [r];
    used.add(r.id);
    for (let j = i + 1; j < items.length; j++) {
      const s = items[j];
      if (used.has(s.id)) continue;
      const sim = jaccard(r.tags, s.tags) * 0.7 + (r.scene === s.scene ? 0.2 : 0) + timeClose(r, s) * 0.1;
      if (sim > 0.45) {
        chain.push(s);
        used.add(s.id);
      }
    }
    chain.sort((a, b) => {
      const ta = a.time ? new Date(a.time).getTime() : 0;
      const tb = b.time ? new Date(b.time).getTime() : 0;
      return ta - tb;
    });
    const title = deriveTitle(chain);
    chains.push({ title, items: chain });
  }
  chains.sort((a, b) => (b.items[0]?.time || 0) - (a.items[0]?.time || 0));
  return chains;
}

function deriveTitle(chain) {
  const freq = new Map();
  for (const r of chain) for (const t of r.tags || []) freq.set(t, (freq.get(t) || 0) + 1);
  const hot = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([t]) => t);
  const scene = chain[0]?.scene || '工作';
  if (hot.length) return `${scene} · ${hot.join(' / ')}`;
  return `${scene} · 思考脉络`;
}
