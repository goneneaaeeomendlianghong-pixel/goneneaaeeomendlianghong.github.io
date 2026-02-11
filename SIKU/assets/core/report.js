import { extractFeatures } from './extract.js';

function jaccard(a, b) {
  const A = new Set(a || []);
  const B = new Set(b || []);
  const inter = [...A].filter(x => B.has(x)).length;
  const uni = new Set([...A, ...B]).size || 1;
  return inter / uni;
}

function scoreRecord(features, r) {
  const kw = jaccard(features.keywords, r.tags);
  const sceneBoost = features.scene === r.scene ? 0.2 : 0.0;
  const score = kw * 0.8 + sceneBoost;
  return score;
}

function filterRelevant(records, features) {
  return records
    .map(r => ({ r, s: scoreRecord(features, r) }))
    .filter(x => x.s > 0.2)
    .sort((a, b) => b.s - a.s)
    .map(x => x.r);
}

function byTimeAsc(a, b) {
  const ta = a.time ? new Date(a.time).getTime() : 0;
  const tb = b.time ? new Date(b.time).getTime() : 0;
  return ta - tb;
}
function byTimeDesc(a, b) {
  const ta = a.time ? new Date(a.time).getTime() : 0;
  const tb = b.time ? new Date(b.time).getTime() : 0;
  return tb - ta;
}

function pickBackground(rels) {
  return [...rels].sort(byTimeAsc).slice(0, 3);
}
function pickKeyNodes(rels) {
  const keys = ['需求','决策','测试','上线','迭代','会议','结论'];
  return [...rels].filter(r => (r.tags||[]).some(t => keys.includes(t))).sort(byTimeAsc).slice(0, 8);
}
function pickRationale(rels) {
  const keys = ['原因','依据','策略','讨论','复盘','风控','数据'];
  return [...rels].filter(r => (r.tags||[]).some(t => keys.includes(t)) || /依据|原因|策略|复盘|讨论|风控/.test(r.text))
    .sort(byTimeAsc).slice(0, 6);
}
function pickCurrentConclusion(rels) {
  const cands = [...rels].filter(r => /结论|决定|确认|通过/.test(r.text) || (r.tags||[]).includes('结论'))
    .sort(byTimeDesc);
  return cands.slice(0, 1);
}
function pickSuggestions(rels) {
  const freq = new Map();
  for (const r of rels) for (const t of r.tags || []) freq.set(t, (freq.get(t) || 0) + 1);
  const hot = [...freq.entries()].filter(([t, c]) => c >= 2).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const out = [];
  for (const [tag, count] of hot) {
    const rep = rels.find(r => (r.tags||[]).includes(tag));
    if (rep) out.push({ ...rep, note: `历史出现${count}次：${tag}` });
  }
  return out;
}

function contextScene(type) {
  if (type === '客户阶段报告') return '客户';
  if (type === '项目复盘报告') return '项目';
  return '工作';
}

export function generateReport(type, contextName, records) {
  const sceneHint = contextScene(type);
  let relevant = [];
  if (type === '关键词汇总报告' && (!contextName || contextName.trim() === '')) {
    relevant = records;
  } else {
    const features = extractFeatures({ text: contextName, tags: [contextName], sceneHint });
    relevant = filterRelevant(records, features);
  }
  const sections = [
    { title: '背景（早期记录）', items: pickBackground(relevant) },
    { title: '关键节点（需求 / 决策 / 测试）', items: pickKeyNodes(relevant) },
    { title: '决策依据（为什么这样定）', items: pickRationale(relevant) },
    { title: '当前结论', items: pickCurrentConclusion(relevant) },
    { title: '后续建议（基于历史模式）', items: pickSuggestions(relevant) },
  ];
  return { type, contextName, sections };
}
