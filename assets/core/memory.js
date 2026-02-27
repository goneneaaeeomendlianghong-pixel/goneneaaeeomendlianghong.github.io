export class MemoryStore {
  constructor() {
    this.key = 'siku_records';
    this.records = this._load();
  }
  _load() {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  _save() {
    localStorage.setItem(this.key, JSON.stringify(this.records));
  }
  getAll() {
    return this.records.filter(r => !r.deleted).slice().sort((a, b) => {
      const ta = a.time ? new Date(a.time).getTime() : 0;
      const tb = b.time ? new Date(b.time).getTime() : 0;
      return tb - ta;
    });
  }
  getById(id) {
    return this.records.find(r => r.id === id);
  }
  add(rec) {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const norm = {
      id,
      text: rec.text,
      title: rec.title || '',
      tags: Array.from(new Set(rec.tags || [])),
      time: rec.time || new Date().toISOString(),
      createdAt: rec.createdAt || new Date().toISOString(),
      updatedAt: rec.updatedAt || new Date().toISOString(),
      scene: rec.scene || this.inferScene(rec),
      intent: rec.intent || this.inferIntent(rec),
      relatedIds: Array.from(new Set(rec.relatedIds || [])),
      question: rec.question || '',
      conclusion: rec.conclusion || '',
      reason: rec.reason || '',
      action: rec.action || '',
      status: rec.status || '未标记',
      important: !!rec.important,
      supplements: Array.isArray(rec.supplements) ? rec.supplements : [],
      revisions: rec.revisions || 0,
    };
    this.records.push(norm);
    this._save();
    return id;
  }
  updateById(id, patch) {
    const r = this.records.find(x => x.id === id);
    if (!r) return false;
    Object.assign(r, patch || {});
    r.updatedAt = new Date().toISOString();
    r.revisions = (r.revisions || 0) + 1;
    this._save();
    return true;
  }
  addSupplement(id, text) {
    const r = this.records.find(x => x.id === id);
    if (!r) return false;
    if (!Array.isArray(r.supplements)) r.supplements = [];
    r.supplements.push({ text, time: new Date().toISOString() });
    r.updatedAt = new Date().toISOString();
    r.revisions = (r.revisions || 0) + 1;
    this._save();
    return true;
  }
  toggleImportant(id) {
    const r = this.records.find(x => x.id === id);
    if (!r) return false;
    r.important = !r.important;
    r.updatedAt = new Date().toISOString();
    r.revisions = (r.revisions || 0) + 1;
    this._save();
    return r.important;
  }
  setStatus(id, status) {
    const r = this.records.find(x => x.id === id);
    if (!r) return false;
    r.status = status;
    r.updatedAt = new Date().toISOString();
    r.revisions = (r.revisions || 0) + 1;
    this._save();
    return true;
  }
  renameScene(oldName, newName) {
    if (!oldName || !newName || oldName === newName) return 0;
    let c = 0;
    this.records.forEach(r => {
      if (r.scene === oldName) { r.scene = newName; c++; r.updatedAt = new Date().toISOString(); r.revisions = (r.revisions||0)+1; }
    });
    this._save();
    return c;
  }
  mergeKeywords(from, to) {
    if (!from || !to || from === to) return 0;
    let c = 0;
    this.records.forEach(r => {
      const tags = new Set(r.tags || []);
      if (tags.has(from)) {
        tags.delete(from);
        tags.add(to);
        r.tags = Array.from(tags);
        c++;
        r.updatedAt = new Date().toISOString();
        r.revisions = (r.revisions||0)+1;
      }
    });
    this._save();
    return c;
  }
  deleteKeyword(kw) {
    if (!kw) return 0;
    let c = 0;
    this.records.forEach(r => {
      const before = r.tags ? r.tags.length : 0;
      r.tags = (r.tags || []).filter(t => t !== kw);
      if (r.tags.length !== before) { c++; r.updatedAt = new Date().toISOString(); r.revisions = (r.revisions||0)+1; }
    });
    this._save();
    return c;
  }
  getTrash() {
    return this.records.filter(r => r.deleted).slice().sort((a,b)=> (b.deletedAt||0)-(a.deletedAt||0));
  }
  trashById(id) {
    const r = this.records.find(x => x.id === id);
    if (r && !r.deleted) {
      r.deleted = true;
      r.deletedAt = Date.now();
      this._save();
    }
  }
  restoreById(id) {
    const r = this.records.find(x => x.id === id);
    if (r && r.deleted) {
      r.deleted = false;
      r.deletedAt = null;
      this._save();
    }
  }
  purgeById(id) {
    const idx = this.records.findIndex(x => x.id === id);
    if (idx >= 0) {
      this.records.splice(idx, 1);
      this._save();
    }
  }
  emptyTrash() {
    this.records = this.records.filter(x => !x.deleted);
    this._save();
  }
  removeById(id) {
    const i = this.records.findIndex(r => r.id === id);
    if (i >= 0) {
      this.records.splice(i, 1);
      this._save();
      return true;
    }
    return false;
  }
  removeByIds(ids) {
    const set = new Set(ids);
    this.records = this.records.filter(r => !set.has(r.id));
    this._save();
  }
  inferIntent(rec) {
    const s = `${rec.text} ${(rec.tags||[]).join(' ')}`;
    if (/决策|结论|确认|通过|依据|原因/.test(s)) return '决策依据';
    if (/需求|反馈|提案|客户/.test(s)) return '需求记录';
    if (/待办|TODO|提醒|安排|任务/.test(s)) return '临时事务';
    if (/复盘|总结|教训|经验/.test(s)) return '复盘素材';
    if (/备忘|记住|提醒|清单/.test(s)) return '备忘';
    return '备忘';
  }
  inferScene(rec) {
    const t = `${rec.text} ${(rec.tags || []).join(' ')}`.toLowerCase();
    if (t.includes('客户') || t.includes('销售') || t.includes('合同')) return '客户';
    if (t.includes('项目') || t.includes('需求') || t.includes('上线')) return '项目';
    if (t.includes('会议') || t.includes('讨论') || t.includes('复盘')) return '会议';
    if (t.includes('出行') || t.includes('旅行') || t.includes('准备')) return '出行';
    if (t.includes('生活') || t.includes('购物') || t.includes('家庭')) return '生活';
    return '工作';
  }
  seedDemoIfEmpty() {
    if (this.records.length > 0) return;
    const now = new Date();
    const mkTime = (offsetHours) => new Date(now.getTime() + offsetHours * 36e5).toISOString().slice(0, 16);
    const demos = [
      {
        text: '客户A 反馈移动端下单流程复杂，建议减少确认步骤',
        tags: ['客户', '需求', '移动端'],
        time: mkTime(20),
        scene: '客户',
        intent: '需求记录',
      },
      {
        text: '项目X 迭代2 会议结论：结算模块延后一周，先上线风控',
        tags: ['项目', '会议', '迭代', '风控'],
        time: mkTime(2),
        scene: '项目',
        intent: '决策依据',
      },
      {
        text: '出行前常备清单：充电器、证件、雨伞、常用药、移动电源',
        tags: ['出行', '清单', '生活'],
        time: mkTime(30),
        scene: '出行',
        intent: '备忘',
      },
      {
        text: '策略变更记录：首页推荐算法从点击率优化改为转化率优化',
        tags: ['策略', '推荐', '转化率'],
        scene: '工作',
        intent: '决策依据',
      },
    ];
    demos.forEach(d => this.add(d));
  }
}
