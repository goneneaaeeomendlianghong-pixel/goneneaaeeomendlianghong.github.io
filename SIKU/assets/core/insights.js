function avg(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function buildInsights(records) {
  const out = [];
  const byScene = (scene) => records.filter(r => r.scene === scene);
  const withTag = (tag) => records.filter(r => (r.tags||[]).includes(tag));

  // 出行清单重复度
  const travel = byScene('出行').filter(r => (r.tags||[]).includes('清单'));
  if (travel.length >= 2) {
    const tokenCounts = new Map();
    for (const r of travel) for (const t of r.tags || []) tokenCounts.set(t, (tokenCounts.get(t)||0)+1);
    const hot = [...tokenCounts.entries()].filter(([t,c]) => c >= 2 && t !== '清单' && t !== '出行').slice(0,5).map(([t])=>t);
    if (hot.length) out.push({ title: '出行前的准备清单高度重复', detail: `高频项：${hot.join('、')}` });
  }

  // 客户需求变更节奏（粗略）
  const clientNeeds = records.filter(r => (r.tags||[]).includes('客户') || /客户/.test(r.text))
                             .filter(r => (r.tags||[]).includes('需求') || /需求|反馈/.test(r.text))
                             .filter(r => r.time);
  if (clientNeeds.length >= 3) {
    const sorted = clientNeeds.sort((a,b)=> new Date(a.time)-new Date(b.time));
    const gaps = [];
    for (let i=1;i<sorted.length;i++) {
      gaps.push((new Date(sorted[i].time)-new Date(sorted[i-1].time))/86400000);
    }
    const days = Math.round(avg(gaps));
    out.push({ title: '客户需求的调整节奏', detail: `平均每 ${days} 天会有一次调整/反馈` });
  }

  // 夜间决策次日修改率（粗略）
  const decisions = records.filter(r => (r.tags||[]).includes('决策') || /决策|结论|确认|通过/.test(r.text))
                           .filter(r => r.time);
  if (decisions.length >= 2) {
    let night = 0, changed = 0;
    for (const d of decisions) {
      const t = new Date(d.time);
      const hour = t.getHours();
      if (hour >= 20) {
        night++;
        const nextDayEnd = new Date(t.getFullYear(), t.getMonth(), t.getDate()+1, 23, 59, 59);
        const changedLater = records.some(r => {
          if (!r.time) return false;
          const rt = new Date(r.time);
          const similar = (r.tags||[]).some(x => (d.tags||[]).includes(x)) || jaccard(r.tags||[], d.tags||[]) > 0.4;
          const modified = /修改|变更|调整/.test(r.text);
          return rt > t && rt <= nextDayEnd && similar && modified;
        });
        if (changedLater) changed++;
      }
    }
    if (night >= 1) {
      const rate = Math.round((changed / night) * 100);
      out.push({ title: '夜间决策次日修改率', detail: `近似为 ${rate}%（样本数：${night}）` });
    }
  }

  return out;
}

function jaccard(a, b) {
  const A = new Set(a || []);
  const B = new Set(b || []);
  const inter = [...A].filter(x => B.has(x)).length;
  const uni = new Set([...A, ...B]).size || 1;
  return inter / uni;
}
