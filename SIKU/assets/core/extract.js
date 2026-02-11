const STOPWORDS = new Set([
  '的','了','和','与','在','是','就','也','都','且','及','并','或','而','被','把','等',
]);

function tokenize(text) {
  const raw = (text || '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .map(s => s.trim())
    .filter(Boolean);
  const tokens = [];
  for (const t of raw) {
    if (STOPWORDS.has(t)) continue;
    if (t.length <= 1) continue;
    tokens.push(t);
  }
  return tokens.slice(0, 20);
}

function detectScene({ text, tags, sceneHint }) {
  const all = `${text} ${(tags || []).join(' ')} ${sceneHint || ''}`;
  if (/\b客户|售前|合同|报价\b/.test(all)) return '客户';
  if (/\b项目|需求|迭代|上线\b/.test(all)) return '项目';
  if (/\b会议|讨论|复盘|总结\b/.test(all)) return '会议';
  if (/\b出行|旅行|行程|准备\b/.test(all)) return '出行';
  if (/\b购物|家庭|生活|清单\b/.test(all)) return '生活';
  return sceneHint || '工作';
}

function parseTime(timeStr, text) {
  if (timeStr) return timeStr;
  // naive date detection like 2026-02-12 14:00, 2月12日, 明天/后天 10:00
  const iso = text.match(/\b(20\d{2}-\d{2}-\d{2}(\s+\d{2}:\d{2})?)\b/);
  if (iso) return iso[1].replace(' ', 'T');
  const today = new Date();
  const tomorrow = /明天/.test(text) ? 1 : /后天/.test(text) ? 2 : 0;
  const timeMatch = text.match(/\b(\d{1,2}:\d{2})\b/);
  if (tomorrow > 0 && timeMatch) {
    const d = new Date(today.getTime() + tomorrow * 86400000);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}T${timeMatch[1]}`;
  }
  return undefined;
}

export function extractFeatures({ text, tags = [], time, sceneHint }) {
  const keywords = Array.from(new Set([...tokenize(text), ...tags])).slice(0, 20);
  const scene = detectScene({ text, tags, sceneHint });
  const parsed = parseTime(time, text);
  const t = parsed || new Date().toISOString();
  const intent = guessIntent(text, tags);
  return { keywords, scene, time: t, intent, text };
}

export function guessIntent(text, tags = []) {
  const s = `${text} ${(tags||[]).join(' ')}`;
  if (/决策|结论|确认|通过|依据|原因/.test(s)) return '决策依据';
  if (/需求|反馈|提案|客户/.test(s)) return '需求记录';
  if (/待办|TODO|提醒|安排|任务/.test(s)) return '临时事务';
  if (/复盘|总结|教训|经验/.test(s)) return '复盘素材';
  if (/备忘|记住|提醒|清单/.test(s)) return '备忘';
  return '备忘';
}
