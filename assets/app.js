import { MemoryStore } from './core/memory.js';
 
import { buildSuggestions } from './core/suggest.js';
import { HintPanel } from './ui/hint.js';
import { generateReport } from './core/report.js';
import { ReportView } from './ui/report.js';
import { icon } from './ui/icon.js';
import { setTheme, getTheme } from './theme/tokens.js';
import { FileStore, readFileAsText } from './core/files.js';
import { Modal } from './ui/modal.js';
import { buildInsights } from './core/insights.js';
import { buildChains } from './core/chains.js';
import { extractFeatures } from './core/extract.js';

const store = new MemoryStore();
const files = new FileStore();
const hint = new HintPanel(document.getElementById('hint-panel'), document.getElementById('hint-list'));
const rpEl = document.getElementById('report-panel');
const reportView = rpEl ? new ReportView(rpEl) : null;

const $text = document.getElementById('record-text');
const $tags = document.getElementById('record-tags');
const $time = document.getElementById('record-time');
const $scene = document.getElementById('record-scene');
const $save = document.getElementById('save-record');
const $contextName = document.getElementById('context-name');
const $openContext = document.getElementById('open-context');
const $checkUpcoming = document.getElementById('check-upcoming');
const $reportType = document.getElementById('report-type');
const $reportContext = document.getElementById('report-context');
const $generateReport = document.getElementById('generate-report');
const $applyTheme = document.getElementById('apply-theme');
const $colorAccent = document.getElementById('color-accent');
const $colorAccent2 = document.getElementById('color-accent2');
const $colorBg = document.getElementById('color-bg');
const $colorPanel = document.getElementById('color-panel');
const $colorText = document.getElementById('color-text');
const $colorMuted = document.getElementById('color-muted');
const $searchInput = document.getElementById('search-input');
const $timeRange = document.getElementById('time-range');
const $noteList = document.getElementById('note-list');
const $noteCount = document.getElementById('note-count');
const $viewNotes = document.getElementById('view-notes');
const $viewHistory = document.getElementById('view-history');
const $viewDatabase = document.getElementById('view-database');
const $viewFiles = document.getElementById('view-files');
const $historyList = document.getElementById('history-list');
const $timelineList = document.getElementById('timeline-list');
const $insightsList = document.getElementById('insights-list');
const $chainsList = document.getElementById('chains-list');
const $tabList = document.getElementById('tab-list');
const $tabTimeline = document.getElementById('tab-timeline');
const $tabInsights = document.getElementById('tab-insights');
const $tabChains = document.getElementById('tab-chains');
const $dbUpload = document.getElementById('db-upload');
const $dbList = document.getElementById('db-list');
const $fileUpload = document.getElementById('file-upload');
const $fileList = document.getElementById('file-list');
const modal = new Modal();
const $viewCompose = document.getElementById('view-compose');
const $composeType = document.getElementById('compose-type');
const $composeAttach = document.getElementById('compose-attach');
const $composeRecord = document.getElementById('compose-record');
const $composeUpload = document.getElementById('compose-upload');
const $composeSave = document.getElementById('compose-save');
const $composeText = document.getElementById('compose-text');
const $composeIntent = document.getElementById('compose-intent');
const $dropzone = document.getElementById('compose-dropzone');
const $dzUpload = document.getElementById('dz-upload');

// Seed demo data for first run
store.seedDemoIfEmpty();
hint.hide();
setTheme();

document.querySelectorAll('.icon-slot').forEach(el => {
  const name = el.getAttribute('data-icon');
  el.appendChild(icon(name, 16));
});

function relTime(t) {
  if (!t) return '未设时间';
  const now = Date.now();
  const ts = new Date(t).getTime();
  const diff = now - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return '刚刚';
  if (m < 60) return `${m}分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}小时前`;
  const d = Math.floor(h / 24);
  return `${d}天前`;
}

let currentTag = '全部';
let query = '';
let range = '全部时间';
let currentView = 'notes';

function inRange(t) {
  if (!t) return true;
  const d = new Date(t);
  const now = new Date();
  if (range === '今天') {
    const s = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return d >= s;
  } else if (range === '本周') {
    const day = now.getDay() || 7;
    const s = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1);
    return d >= s;
  } else if (range === '本月') {
    const s = new Date(now.getFullYear(), now.getMonth(), 1);
    return d >= s;
  }
  return true;
}

function renderNotes() {
  const all = store.getAll();
  const filtered = all.filter(r => {
    const matchTag = currentTag === '全部' ? true : (r.tags || []).includes(currentTag);
    const matchQuery = query ? `${r.text} ${(r.tags||[]).join(' ')}`.toLowerCase().includes(query.toLowerCase()) : true;
    const matchRange = inRange(r.time);
    return matchTag && matchQuery && matchRange;
  });
  $noteCount.textContent = String(filtered.length);
  $noteList.innerHTML = '';
  for (const r of filtered.slice(0, 20)) {
    const card = document.createElement('div');
    card.className = 'note-card';
    const title = document.createElement('div');
    title.className = 'note-title';
    title.textContent = r.text ? r.text.slice(0, 40) : '未命名笔记';
    const sub = document.createElement('div');
    sub.className = 'note-sub';
    sub.textContent = r.text ? ' ' : '无内容';
    const meta = document.createElement('div');
    meta.className = 'note-meta';
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = (r.tags && r.tags[0]) ? r.tags[0] : '想法';
    const time = document.createElement('span');
    time.className = 'time';
    time.textContent = relTime(r.time);
    meta.appendChild(tag);
    meta.appendChild(time);
    card.appendChild(title);
    card.appendChild(sub);
    card.appendChild(meta);
    card.addEventListener('click', () => {
      document.querySelectorAll('.note-card').forEach(x => x.classList.remove('selected'));
      card.classList.add('selected');
    });
    $noteList.appendChild(card);
  }
}
renderNotes();

function renderHistory() {
  const all = store.getAll().slice().sort((a, b) => {
    const ta = a.time ? new Date(a.time).getTime() : 0;
    const tb = b.time ? new Date(b.time).getTime() : 0;
    return ta - tb;
  });
  $historyList.innerHTML = '';
  for (const r of all) {
    const card = document.createElement('div');
    card.className = 'note-card';
    card.dataset.id = r.id;
    const title = document.createElement('div');
    title.className = 'note-title';
    title.textContent = r.text ? r.text.slice(0, 40) : '未命名笔记';
    const sub = document.createElement('div');
    sub.className = 'note-sub';
    sub.textContent = (r.tags || []).join('、') || '无标签';
    const meta = document.createElement('div');
    meta.className = 'note-meta';
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = r.scene || '工作';
    const time = document.createElement('span');
    time.className = 'time';
    time.textContent = relTime(r.time);
    meta.appendChild(tag);
    meta.appendChild(time);
    card.appendChild(title);
    card.appendChild(sub);
    card.appendChild(meta);
    $historyList.appendChild(card);
  }
}

function renderDatabase() {
  const all = files.getAll();
  $dbList.innerHTML = '';
  for (const f of all) {
    const card = document.createElement('div');
    card.className = 'note-card';
    const title = document.createElement('div');
    title.className = 'note-title';
    title.textContent = f.name;
    const sub = document.createElement('div');
    sub.className = 'note-sub';
    sub.textContent = f.contentText ? f.contentText.slice(0, 80) : '待识别/不支持的格式';
    const meta = document.createElement('div');
    meta.className = 'note-meta';
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = f.type || '文件';
    const time = document.createElement('span');
    time.className = 'time';
    time.textContent = relTime(f.ts);
    meta.appendChild(tag);
    meta.appendChild(time);
    card.appendChild(title);
    card.appendChild(sub);
    card.appendChild(meta);
    $dbList.appendChild(card);
  }
}

function renderFiles() {
  const all = files.getAll();
  $fileList.innerHTML = '';
  for (const f of all) {
    const card = document.createElement('div');
    card.className = 'note-card';
    const title = document.createElement('div');
    title.className = 'note-title';
    title.textContent = f.name;
    const sub = document.createElement('div');
    sub.className = 'note-sub';
    sub.textContent = `${(f.size/1024).toFixed(1)} KB`;
    const meta = document.createElement('div');
    meta.className = 'note-meta';
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = f.type || '文件';
    const time = document.createElement('span');
    time.className = 'time';
    time.textContent = relTime(f.ts);
    meta.appendChild(tag);
    meta.appendChild(time);
    card.appendChild(title);
    card.appendChild(sub);
    card.appendChild(meta);
    if (f.blobUrl) {
      const btn = document.createElement('button');
      btn.className = 'create-btn';
      btn.style.height = '32px';
      btn.textContent = '下载/预览';
      btn.addEventListener('click', () => {
        const a = document.createElement('a');
        a.href = f.blobUrl;
        a.download = f.name;
        a.target = '_blank';
        a.click();
      });
      card.appendChild(btn);
    }
    $fileList.appendChild(card);
  }
}

function typeOfRecord(r) {
  const text = r.text || '';
  const tags = r.tags || [];
  if (tags.includes('需求') || /需求|反馈|提案/.test(text)) return '客户需求';
  if (tags.includes('策略') || /策略|调整|变更|风控/.test(text)) return '策略调整';
  if (tags.includes('测试') || /测试|验收|AB|实验/.test(text)) return '测试记录';
  if (tags.includes('结论') || tags.includes('决策') || /结论|决定|确认|通过/.test(text)) return '决策结论';
  return '记录';
}

function renderTimeline() {
  const all = store.getAll().filter(r => r.time).sort((a,b)=> new Date(a.time)-new Date(b.time));
  $timelineList.innerHTML = '';
  for (const r of all) {
    const item = document.createElement('div');
    item.className = 'timeline-item';
    const dot = document.createElement('div');
    dot.className = 'timeline-dot';
    const card = document.createElement('div');
    card.className = 'timeline-card';
    const type = document.createElement('div');
    type.className = 'timeline-type';
    type.textContent = typeOfRecord(r);
    const title = document.createElement('div');
    title.className = 'timeline-title';
    title.textContent = r.text.slice(0, 100);
    const meta = document.createElement('div');
    meta.className = 'timeline-meta';
    meta.textContent = `${new Date(r.time).toLocaleString()} · 标签：${(r.tags||[]).join('、')}`;
    card.appendChild(type);
    card.appendChild(title);
    card.appendChild(meta);
    card.addEventListener('click', () => {
      const suggestion = [{
        id: r.id, title: r.text.slice(0,60), score: 1.0, scene: r.scene, time: r.time, tags: r.tags
      }];
      hint.render(suggestion, { title: '相关原始记录 · 可回溯的历史事实' });
    });
    item.appendChild(dot);
    item.appendChild(card);
    $timelineList.appendChild(item);
  }
}

function renderInsights() {
  const ins = buildInsights(store.getAll());
  $insightsList.innerHTML = '';
  for (const i of ins) {
    const card = document.createElement('div');
    card.className = 'insight-card';
    const title = document.createElement('div');
    title.className = 'insight-title';
    title.textContent = i.title;
    const detail = document.createElement('div');
    detail.className = 'insight-detail';
    detail.textContent = i.detail;
    card.appendChild(title);
    card.appendChild(detail);
    $insightsList.appendChild(card);
  }
  if (ins.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'insight-detail';
    empty.textContent = '暂无洞察（随着长期使用，系统会形成你的模式识别）';
    $insightsList.appendChild(empty);
  }
}

function renderChains() {
  const chains = buildChains(store.getAll());
  $chainsList.innerHTML = '';
  for (const c of chains) {
    const head = document.createElement('div');
    head.className = 'note-card';
    const t = document.createElement('div');
    t.className = 'note-title';
    t.textContent = c.title;
    head.appendChild(t);
    $chainsList.appendChild(head);
    for (const r of c.items) {
      const card = document.createElement('div');
      card.className = 'note-card';
      const title = document.createElement('div');
      title.className = 'note-title';
      title.textContent = r.text.slice(0, 80);
      const meta = document.createElement('div');
      meta.className = 'note-meta';
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = r.intent || '记录';
      const time = document.createElement('span');
      time.className = 'time';
      time.textContent = r.time ? new Date(r.time).toLocaleString() : '未设时间';
      meta.appendChild(tag);
      meta.appendChild(time);
      card.appendChild(title);
      card.appendChild(meta);
      card.addEventListener('click', () => {
        const suggestion = [{
          id: r.id, title: r.text.slice(0,60), score: 1.0, scene: r.scene, time: r.time, tags: r.tags
        }];
        hint.render(suggestion, { title: '相关原始记录 · 可回溯的历史事实' });
      });
      $chainsList.appendChild(card);
    }
  }
}

function setView(view) {
  currentView = view;
  $viewNotes.style.display = view === 'notes' ? '' : 'none';
  $viewHistory.style.display = view === 'history' ? '' : 'none';
  $viewDatabase.style.display = view === 'database' ? '' : 'none';
  $viewFiles.style.display = view === 'files' ? '' : 'none';
  $viewCompose.style.display = view === 'compose' ? '' : 'none';
  document.querySelectorAll('.sidebar .nav-item').forEach(it => it.classList.toggle('active', it.getAttribute('data-view') === view));
  if (view === 'notes') renderNotes();
  if (view === 'history') { renderHistory(); renderTimeline(); renderInsights(); renderChains(); }
  if (view === 'database') renderDatabase();
  if (view === 'files') renderFiles();
  if (view !== 'compose') hint.hide();
}
setView('notes');

document.querySelectorAll('.sidebar .nav-item').forEach(it => {
  it.addEventListener('click', () => {
    const view = it.getAttribute('data-view');
    setView(view);
  });
});

if ($tabList && $tabTimeline && $tabInsights) {
  const switchTab = (tab) => {
    $tabList.classList.toggle('active', tab === 'list');
    $tabTimeline.classList.toggle('active', tab === 'timeline');
    $tabInsights.classList.toggle('active', tab === 'insights');
    if ($tabChains) $tabChains.classList.toggle('active', tab === 'chains');
    $historyList.style.display = tab === 'list' ? '' : 'none';
    $timelineList.style.display = tab === 'timeline' ? '' : 'none';
    $insightsList.style.display = tab === 'insights' ? '' : 'none';
    if ($chainsList) $chainsList.style.display = tab === 'chains' ? '' : 'none';
  };
  $tabList.addEventListener('click', () => switchTab('list'));
  $tabTimeline.addEventListener('click', () => switchTab('timeline'));
  $tabInsights.addEventListener('click', () => switchTab('insights'));
  if ($tabChains) $tabChains.addEventListener('click', () => switchTab('chains'));
  switchTab('list');
}
if ($dbUpload) {
  $dbUpload.addEventListener('change', async () => {
    const filesArr = Array.from($dbUpload.files || []);
    for (const file of filesArr) {
      const blobUrl = URL.createObjectURL(file);
      let contentText = '';
      if (/text|csv|json/.test(file.type) || /\.(txt|csv|json)$/i.test(file.name)) {
        contentText = await readFileAsText(file);
      } else {
        contentText = '';
      }
      files.addFile({ name: file.name, type: file.type, size: file.size, contentText, blobUrl });
    }
    renderDatabase();
    renderFiles();
    $dbUpload.value = '';
  });
}

if ($fileUpload) {
  $fileUpload.addEventListener('change', async () => {
    const filesArr = Array.from($fileUpload.files || []);
    for (const file of filesArr) {
      const blobUrl = URL.createObjectURL(file);
      files.addFile({ name: file.name, type: file.type, size: file.size, contentText: '', blobUrl });
    }
    renderFiles();
    $fileUpload.value = '';
  });
}

const createBtn = document.querySelector('.create-btn');
if (createBtn) {
  createBtn.addEventListener('click', () => {
    setView('compose');
  });
}

let composeTag = '想法';
if ($composeType) {
  $composeType.addEventListener('click', () => {
    composeTag = composeTag === '想法' ? '决策' : '想法';
    $composeType.classList.add('active');
    $composeType.innerHTML = '';
    $composeType.appendChild(icon(composeTag === '想法' ? 'bulb' : 'report', 16));
    $composeType.appendChild(document.createTextNode(composeTag));
  });
}
if ($composeAttach && $composeUpload) {
  $composeAttach.addEventListener('click', () => $composeUpload.click());
  $composeUpload.addEventListener('change', async () => {
    const arr = Array.from($composeUpload.files || []);
    for (const f of arr) {
      const blobUrl = URL.createObjectURL(f);
      let contentText = '';
      if (/text|csv|json/.test(f.type) || /\.(txt|csv|json)$/i.test(f.name)) {
        contentText = await readFileAsText(f);
      }
      files.addFile({ name: f.name, type: f.type, size: f.size, contentText, blobUrl });
    }
    $composeUpload.value = '';
  });
}
let composeRecorder = null;
let composeChunks = [];
if ($composeRecord) {
  $composeRecord.addEventListener('click', async () => {
    if (composeRecorder && composeRecorder.state === 'recording') {
      composeRecorder.stop();
      $composeRecord.classList.remove('active');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      composeRecorder = new MediaRecorder(stream);
      composeChunks = [];
      composeRecorder.ondataavailable = e => composeChunks.push(e.data);
      composeRecorder.onstop = () => {
        const blob = new Blob(composeChunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        files.addFile({ name: `录音-${Date.now()}.webm`, type: 'audio/webm', size: blob.size, contentText: '', blobUrl: url });
      };
      composeRecorder.start();
      $composeRecord.classList.add('active');
    } catch (e) {
      console.warn('录音不可用', e);
    }
  });
}
if ($composeSave) {
  $composeSave.addEventListener('click', () => {
    const text = ($composeText && $composeText.value.trim()) || '';
    const features = extractFeatures({ text, tags: [composeTag] });
    store.add({ text, tags: features.keywords, scene: features.scene, time: features.time, intent: features.intent });
    setView('notes');
    renderNotes();
  });
}

function repetitionHint(features) {
  const all = store.getAll();
  const key = features.keywords[0];
  const similar = all.filter(r => (r.tags||[]).includes(key)).length;
  if (similar >= 3) {
    const recent = all.filter(r => (r.tags||[]).includes(key)).slice(0, 3).map(r => ({
      id: r.id,
      title: r.text.slice(0, 60),
      score: 0.9,
      scene: r.scene,
      time: r.time,
      tags: r.tags,
    }));
    hint.render(recent, { title: `你已经第 ${similar} 次记录到类似内容 · 相关历史` });
  }
}

if ($composeText) {
  $composeText.addEventListener('input', () => {
    const text = $composeText.value.trim();
    const features = extractFeatures({ text, tags: [composeTag] });
    if (currentView !== 'compose') { hint.hide(); return; }
    if (!features.keywords || features.keywords.length === 0) { hint.hide(); return; }
    const suggestions = buildSuggestions(features, store.getAll());
    if (suggestions.length > 0) hint.render(suggestions, { title: '你之前记录过类似内容' });
    else hint.hide();
    repetitionHint(features);
  });
}

if ($dropzone && $composeUpload) {
  const handleFiles = async (arr) => {
    for (const f of arr) {
      const blobUrl = URL.createObjectURL(f);
      let contentText = '';
      if (/text|csv|json/.test(f.type) || /\.(txt|csv|json)$/i.test(f.name)) {
        contentText = await readFileAsText(f);
      }
      files.addFile({ name: f.name, type: f.type, size: f.size, contentText, blobUrl });
    }
  };
  $dropzone.addEventListener('click', () => $composeUpload.click());
  if ($dzUpload) $dzUpload.addEventListener('click', () => $composeUpload.click());
  $dropzone.addEventListener('dragover', (e) => { e.preventDefault(); $dropzone.classList.add('drag'); });
  $dropzone.addEventListener('dragleave', (e) => { e.preventDefault(); $dropzone.classList.remove('drag'); });
  $dropzone.addEventListener('drop', async (e) => {
    e.preventDefault();
    const arr = Array.from(e.dataTransfer?.files || []);
    await handleFiles(arr);
    $dropzone.classList.remove('drag');
  });
}
document.querySelectorAll('.chip').forEach(ch => {
  ch.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach(x => x.classList.remove('active'));
    ch.classList.add('active');
    currentTag = ch.getAttribute('data-tag');
    renderNotes();
  });
});
$searchInput.addEventListener('input', () => { query = $searchInput.value.trim(); renderNotes(); });
$timeRange.addEventListener('change', () => { range = $timeRange.value; renderNotes(); });

if ($text) {
  $text.addEventListener('input', () => {
    const text = $text.value.trim();
    const tags = $tags.value.split(',').map(s => s.trim()).filter(Boolean);
    const sceneInput = $scene.value.trim() || undefined;
    const features = extractFeatures({ text, tags, sceneHint: sceneInput });
    // 非“新建笔记”页面不展示提示
    hint.hide();
  });
}

if ($save) {
  $save.addEventListener('click', () => {
    const text = $text.value.trim();
    if (!text) return;
    const tags = $tags.value.split(',').map(s => s.trim()).filter(Boolean);
    const sceneInput = $scene.value.trim() || undefined;
    const features = extractFeatures({ text, tags, sceneHint: sceneInput });
    store.add({
      text,
      tags: features.keywords,
      scene: features.scene,
    });
    $text.value = '';
    $tags.value = '';
    $scene.value = '';
    hint.renderEmpty('已保存。继续输入即可看到相关历史提示');
    renderNotes();
  });
}

// Trigger 2: 打开某个客户 / 项目 – upon opening a context, show linked records
if ($openContext) {
  $openContext.addEventListener('click', () => {
    const name = $contextName.value.trim();
    if (!name) return;
    // 仅在新建笔记时提示
    hint.hide();
  });
}

// Trigger 3: 即将到达某个时间点（会议、出行前） – show upcoming reminders
if ($checkUpcoming) {
  $checkUpcoming.addEventListener('click', () => {
    // 仅在新建笔记时提示
    hint.hide();
  });
}

// Report generation – based on real records, auto-structured and traceable
if ($generateReport && $reportType && $reportContext && reportView) {
  $generateReport.addEventListener('click', () => {
    const type = $reportType.value;
    const ctx = $reportContext.value.trim();
    if (!ctx && type !== '个人复盘报告' && type !== '关键词汇总报告') return;
    const report = generateReport(type, ctx, store.getAll());
    reportView.render(report);
  });
}

// Click-through trace: show the original record in the hint panel
window.addEventListener('report:show-record', (e) => {
  const id = e.detail.id;
  const r = store.getById(id);
  if (!r) return;
  // 仅在新建笔记时提示
  hint.hide();
});

// 从提示打开原始记录，在“新建笔记”保持当前草稿的同时侧边显示证据，支持摘录
window.addEventListener('hint:open-record', (e) => {
  if (currentView !== 'compose') return;
  const id = e.detail.id;
  const r = store.getById(id);
  const panel = document.getElementById('compose-evidence');
  if (!panel) return;
  panel.innerHTML = '';
  const title = document.createElement('div');
  title.className = 'evidence-title';
  title.textContent = '关联内容';
  panel.appendChild(title);
  const item = document.createElement('div');
  item.className = 'evidence-item';
  const t = document.createElement('div');
  t.textContent = (r.text || '').slice(0, 160);
  const meta = document.createElement('div');
  meta.className = 'evidence-meta';
  const timeStr = r.time ? new Date(r.time).toLocaleString() : '未设时间';
  meta.textContent = `场景：${r.scene} · 时间：${timeStr} · 标签：${(r.tags||[]).join('、')}`;
  const actions = document.createElement('div');
  actions.className = 'evidence-actions';
  const btnView = document.createElement('button');
  btnView.className = 'btn-link';
  btnView.textContent = '打开该笔记';
  btnView.addEventListener('click', () => {
    setView('history');
    // 选中该记录的卡片（简单做法：渲染后滚动到近似位置）
    renderHistory();
    const el = document.querySelector(`.note-card[data-id="${r.id}"]`);
    if (el) {
      document.querySelectorAll('.note-card').forEach(x => x.classList.remove('selected'));
      el.classList.add('selected');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
  const btnExtract = document.createElement('button');
  btnExtract.className = 'btn-link';
  btnExtract.textContent = '摘录到当前笔记';
  btnExtract.addEventListener('click', () => {
    if ($composeText) {
      const append = `\n—— 摘录（${timeStr}）：${(r.text || '').slice(0, 160)}`;
      $composeText.value = ($composeText.value || '') + append;
      $composeText.dispatchEvent(new Event('input'));
    }
  });
  actions.appendChild(btnView);
  actions.appendChild(btnExtract);
  item.appendChild(t);
  item.appendChild(meta);
  item.appendChild(actions);
  panel.appendChild(item);
});

if ($applyTheme && $colorAccent && $colorAccent2 && $colorBg && $colorPanel && $colorText && $colorMuted) {
  $applyTheme.addEventListener('click', () => {
    const tokens = {
      accent: $colorAccent.value || undefined,
      accent2: $colorAccent2.value || undefined,
      bg: $colorBg.value || undefined,
      panel: $colorPanel.value || undefined,
      text: $colorText.value || undefined,
      muted: $colorMuted.value || undefined
    };
    setTheme(tokens);
  });
  const current = getTheme();
  $colorAccent.value = current.accent;
  $colorAccent2.value = current.accent2;
  $colorBg.value = current.bg;
  $colorPanel.value = current.panel;
  $colorText.value = current.text;
  $colorMuted.value = current.muted;
}
