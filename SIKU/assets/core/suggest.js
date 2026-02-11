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
  // 拉丁/数字词
  const rawWords = (text || '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .map(s => s.trim())
    .filter(Boolean);
  for (const w of rawWords) {
    if (STOP.has(w)) continue;
    if (w.length <= 1) continue;
    out.push(w);
  }
  // 中文双字分词（适配无空格文本，如“点点图片不需要…”）
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
  const scored = records.map(r => {
    const kw = jaccard(tokens, tokenizeText(r.text || ''));
    const score = kw;
    return {
      id: r.id,
      title: r.text.slice(0, 60),
      score: Number(score.toFixed(3)),
      scene: r.scene,
      time: r.time,
      tags: r.tags,
      kw,
    };
  }).filter(s => s.kw > 0);
  return scored.sort((a, b) => b.score - a.score).slice(0, 8);
}
