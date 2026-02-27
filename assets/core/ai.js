export async function aiChat(messages, { model = 'gpt-4o-mini', endpoint } = {}) {
  const url = endpoint || window.SIKU_AI_ENDPOINT || localStorage.getItem('siku_ai_endpoint') || '';
  if (!url) throw new Error('AI endpoint not configured');
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, stream: false })
  });
  if (!r.ok) throw new Error('AI request failed');
  const data = await r.json();
  const c = data?.choices?.[0]?.message?.content || '';
  return c;
}
export async function aiSummarize(text, opts = {}) {
  const prompt = `请基于以下内容生成两部分：1) 50字以内的摘要；2) 3-5个关键词以中文逗号分隔。\n内容：\n${text}`;
  const content = await aiChat([{ role: 'user', content: prompt }], opts);
  return content;
}
