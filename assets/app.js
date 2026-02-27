import { MemoryStore } from './core/memory.js';
 
import { buildSuggestions } from './core/suggest.js';
import { HintPanel } from './ui/hint.js';
import { generateReport } from './core/report.js';
import { ReportView } from './ui/report.js';
import { icon } from './ui/icon.js';
import { setTheme, getTheme } from './theme/tokens.js';
import { FileStore, readFileAsText, readFileAsDataURL } from './core/files.js';
import { Modal } from './ui/modal.js';
import { buildInsights } from './core/insights.js';
import { buildChains } from './core/chains.js';
import { extractFeatures } from './core/extract.js';
import { aiSummarize } from './core/ai.js';

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
const $notesEmptyTitle = document.querySelector('#view-notes .empty-title');
const $notesEmptySub = document.querySelector('#view-notes .empty-sub');
const $viewHistory = document.getElementById('view-history');
const $viewDatabase = document.getElementById('view-database');
const $viewFiles = document.getElementById('view-files');
const $viewTrash = document.getElementById('view-trash');
const $viewDashboard = document.getElementById('view-dashboard');
const $viewReport = document.getElementById('view-report');
const $viewKeywords = document.getElementById('view-keywords');
const $viewSettings = document.getElementById('view-settings');
const $historyList = document.getElementById('history-list');
const $timelineList = document.getElementById('timeline-list');
const $insightsList = document.getElementById('insights-list');
const $chainsList = document.getElementById('chains-list');
const $trashList = document.getElementById('trash-list');
const $trashEmpty = document.getElementById('trash-empty');
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
const $composeAI = document.getElementById('compose-ai');
const $composeTitle = document.getElementById('compose-title');
const $composeScene = document.getElementById('compose-scene');
const $composeRelatedPanel = document.getElementById('compose-related-panel');
const $composeRelatedList = document.getElementById('compose-related-list');
const $dashReminders = document.getElementById('dash-reminders');
const $dashScenes = document.getElementById('dash-scenes');
const $dashNew = document.getElementById('dash-new');
const $reportScene = document.getElementById('report-scene');
const $reportGen = document.getElementById('report-gen');
const $reportCopy = document.getElementById('report-copy');
const $reportContent = document.getElementById('report-content');
const $reportRange = document.getElementById('report-range');
const $reportKeyword = document.getElementById('report-keyword');
const $reportExportTxt = document.getElementById('report-export-txt');
const $reportExportMd = document.getElementById('report-export-md');
const $reportDelete = document.getElementById('report-delete');
const $reportRefresh = document.getElementById('report-refresh');
const $reportBack = document.getElementById('report-back');
const $reportHome = document.getElementById('report-home');
let reportStatusFilter = null;
const $reportList = document.getElementById('report-list');
const $reportOutput = document.getElementById('report-output');
const $reportBuild = document.getElementById('report-build');
const $reportSelectedCount = document.getElementById('report-selected-count');
const $reportActionbar = document.getElementById('report-actionbar');
let reportChecked = new Set();
const $reportSelectAll = document.getElementById('report-select-all');
const $kwList = document.getElementById('kw-list');
const $kwRelated = document.getElementById('kw-related');
const $dashTodo = document.getElementById('dash-todo');
const $dashSolved = document.getElementById('dash-solved');
const $dashKeywords = document.getElementById('dash-keywords');
const $dashReports = document.getElementById('dash-reports');
const $kwRename = document.getElementById('kw-rename');
const $kwMerge = document.getElementById('kw-merge');
const $kwDelete = document.getElementById('kw-delete');
const $setRemindersToggle = document.getElementById('set-reminders-toggle');
const $setFrequency = document.getElementById('set-frequency');
const $setExportJson = document.getElementById('set-export-json');
const $setClear = document.getElementById('set-clear');

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

function navigateToRecordsByKeyword(kw) {
  if (!kw) return;
  query = kw;
  if ($searchInput) $searchInput.value = kw;
  setView('history');
  renderHistory();
  const list = Array.from(document.querySelectorAll('#view-history .note-card'));
  if (list.length > 0) {
    list[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  showToast(`已按关键词筛选：${kw}`);
}

let currentTag = '全部';
let query = '';
let range = '全部时间';
let currentView = 'notes';
 
let pendingDraft = null;

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
    const matchQuery = query ? `${r.title||''} ${r.text} ${(r.tags||[]).join(' ')}`.toLowerCase().includes(query.toLowerCase()) : true;
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
    title.textContent = (r.title && r.title.trim()) ? r.title : (r.text ? r.text.slice(0, 40) : '未命名笔记');
    const sub = document.createElement('div');
    sub.className = 'note-sub';
    sub.textContent = r.text ? (r.text.slice(0, 60)) : '无内容';
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

if ($searchInput) {
  $searchInput.addEventListener('input', () => {
    query = ($searchInput.value || '').trim();
    if (currentView === 'notes') renderNotes();
    if (currentView === 'history') renderHistory();
    if (currentView === 'database') renderDatabase();
    if (currentView === 'files') renderFiles();
  });
}

function renderHistory() {
  const all = store.getAll().slice().sort((a, b) => {
    const ta = a.time ? new Date(a.time).getTime() : 0;
    const tb = b.time ? new Date(b.time).getTime() : 0;
    return tb - ta;
  });
  const filtered = all.filter(r => {
    if (!query) return true;
    const hay = `${r.title||''} ${r.text} ${(r.tags||[]).join(' ')}`.toLowerCase();
    return hay.includes(query.toLowerCase());
  });
  $historyList.innerHTML = '';
  for (const r of filtered) {
    const card = document.createElement('div');
    card.className = 'note-card';
    card.dataset.id = r.id;
    card.addEventListener('click', () => renderHistoryPreview(r));
    const actions = document.createElement('div');
    actions.style.marginTop = '6px';
    const delBtn = document.createElement('button');
    delBtn.className = 'chip';
    delBtn.textContent = '删除';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      store.trashById(r.id);
      renderHistory();
    });
    const title = document.createElement('div');
    title.className = 'note-title';
    title.textContent = (r.title && r.title.trim()) ? r.title : (r.text ? r.text.slice(0, 40) : '未命名笔记');
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
    card.appendChild(actions);
    actions.appendChild(delBtn);
    $historyList.appendChild(card);
  }
}

function renderDatabase() {
  const all = files.getAll();
  const filtered = all.filter(f => {
    if (!query) return true;
    const hay = `${f.name} ${f.type} ${f.contentText || ''}`.toLowerCase();
    return hay.includes(query.toLowerCase());
  });
  $dbList.innerHTML = '';
  for (const f of filtered) {
    const card = document.createElement('div');
    card.className = 'note-card';
    card.dataset.id = f.id;
    card.addEventListener('click', () => renderDbPreview(f));
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
    const actions = document.createElement('div');
    actions.style.marginTop = '8px';
    const previewBtn = document.createElement('button');
    previewBtn.className = 'create-btn';
    previewBtn.style.height = '32px';
    previewBtn.textContent = '预览';
    previewBtn.addEventListener('click', (e) => { e.stopPropagation(); renderDbPreview(f); });
    const backBtn = document.createElement('button');
    backBtn.className = 'brand-chip';
    backBtn.textContent = '返回';
    backBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const panel = document.querySelector('#view-database .preview');
      if (panel) panel.innerHTML = '<div class="empty"><div class="empty-icon"></div><div class="empty-title">文本识别结果预览</div><div class="empty-sub">选择左侧项目查看识别文本</div></div>';
    });
    const delBtn = document.createElement('button');
    delBtn.className = 'chip';
    delBtn.textContent = '删除';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      files.trashById(f.id);
      renderDatabase();
      if (currentView === 'trash') renderTrash();
    });
    actions.appendChild(previewBtn);
    actions.appendChild(backBtn);
    actions.appendChild(delBtn);
    card.appendChild(actions);
    $dbList.appendChild(card);
  }
}

function renderFiles() {
  const all = files.getAll();
  const filtered = all.filter(f => {
    if (!query) return true;
    const hay = `${f.name} ${f.type}`.toLowerCase();
    return hay.includes(query.toLowerCase());
  });
  $fileList.innerHTML = '';
  for (const f of filtered) {
    const card = document.createElement('div');
    card.className = 'note-card';
    card.addEventListener('click', () => renderFilePreview(f));
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
    const actions = document.createElement('div');
    actions.style.marginTop = '8px';
    const previewBtn = document.createElement('button');
    previewBtn.className = 'create-btn';
    previewBtn.style.height = '32px';
    previewBtn.textContent = '预览';
    previewBtn.addEventListener('click', (e) => { e.stopPropagation(); renderFilePreview(f); });
    const backBtn = document.createElement('button');
    backBtn.className = 'brand-chip';
    backBtn.textContent = '返回';
    backBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const panel = document.querySelector('#view-files .preview');
      if (panel) panel.innerHTML = '<div class="empty"><div class="empty-icon"></div><div class="empty-title">文件预览</div><div class="empty-sub">选择左侧文件进行本地预览或下载</div></div>';
    });
    if (f.blobUrl) {
      const dl = document.createElement('button');
      dl.className = 'brand-chip';
      dl.textContent = '下载';
      dl.addEventListener('click', (e) => {
        e.stopPropagation();
        const a = document.createElement('a');
        a.href = f.blobUrl;
        a.download = f.name;
        a.target = '_blank';
        a.click();
      });
      actions.appendChild(dl);
    }
    const delBtn = document.createElement('button');
    delBtn.className = 'chip';
    delBtn.textContent = '删除';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      files.trashById(f.id);
      renderFiles();
      if (currentView === 'trash') renderTrash();
    });
    actions.appendChild(previewBtn);
    actions.appendChild(backBtn);
    actions.appendChild(delBtn);
    card.appendChild(actions);
    $fileList.appendChild(card);
  }
}

function renderDbPreview(f) {
  const panel = document.querySelector('#view-database .preview');
  if (!panel) return;
  panel.innerHTML = '';
 
  const body = document.createElement('div');
  body.className = 'preview-body';
  const title = document.createElement('div');
  title.className = 'note-title';
  title.textContent = f.name;
  const url = f.blobUrl || f.dataUrl || '';
  const isImage = (/\.(png|jpg|jpeg|gif|webp|bmp|svg)$/i.test(f.name) || /^image\//.test(f.type));
  const isTextType = /^(text\/|application\/json|application\/xml|text\/html)/.test(f.type);
  const isTextExt = /\.(txt|md|log|csv|json|xml|html|rtf)$/i.test(f.name);
  const content = document.createElement('div');
  content.className = 'preview-text';
  content.textContent = f.contentText || '暂未识别到文本';
  body.appendChild(title);
  body.appendChild(content);
  if (url && !(isImage || isTextType || isTextExt)) {
    const viewer = document.createElement('div');
    viewer.className = 'viewer';
    if (/^audio\//.test(f.type)) {
      const audio = document.createElement('audio');
      audio.controls = true;
      audio.src = url;
      viewer.appendChild(audio);
    } else if (/^video\//.test(f.type)) {
      const video = document.createElement('video');
      video.controls = true;
      video.src = url;
      video.style.maxWidth = '100%';
      viewer.appendChild(video);
    } else if (/\.pdf$/i.test(f.name) || f.type === 'application/pdf') {
      const embed = document.createElement('embed');
      embed.src = url;
      embed.type = 'application/pdf';
      embed.style.width = '100%';
      embed.style.minHeight = '320px';
      viewer.appendChild(embed);
    }
    body.appendChild(viewer);
  }
  const actions = document.createElement('div');
  actions.className = 'evidence-actions';
  const aiBtn = document.createElement('button');
  aiBtn.className = 'brand-chip';
  aiBtn.textContent = 'AI提炼';
  aiBtn.addEventListener('click', async () => {
    const src = f.contentText || '';
    if (!src) return;
    aiBtn.disabled = true;
    try {
      const out = await aiSummarize(src);
      const k = document.createElement('div');
      k.className = 'evidence-item';
      const t = document.createElement('div');
      t.textContent = 'AI提炼';
      const m = document.createElement('div');
      m.className = 'evidence-meta';
      m.textContent = out;
      k.appendChild(t);
      k.appendChild(m);
      body.appendChild(k);
    } catch (e) {
      alert('AI不可用，请在 localStorage 设置 siku_ai_endpoint');
    } finally {
      aiBtn.disabled = false;
    }
  });
  const delBtn = document.createElement('button');
  delBtn.className = 'chip';
  delBtn.textContent = '删除';
  delBtn.addEventListener('click', () => {
    files.trashById(f.id);
    renderDatabase();
    setView('trash');
  });
  actions.appendChild(aiBtn);
  actions.appendChild(delBtn);
  body.appendChild(actions);
  panel.appendChild(body);
}

function renderHistoryPreview(r) {
  const panel = document.querySelector('#view-history .preview');
  if (!panel) return;
  panel.innerHTML = '';
  const body = document.createElement('div');
  body.className = 'preview-body';
  const title = document.createElement('div');
  title.className = 'note-title';
  title.textContent = (r.title && r.title.trim()) ? r.title : (r.text ? r.text.slice(0, 120) : '未命名笔记');
  const meta = document.createElement('div');
  meta.className = 'note-meta';
  const tag = document.createElement('span');
  tag.className = 'tag';
  tag.textContent = (r.scene || '工作') + ' · ' + (r.intent || '记录');
  const time = document.createElement('span');
  time.className = 'time';
  time.textContent = r.time ? new Date(r.time).toLocaleString() : '未设时间';
  meta.appendChild(tag);
  meta.appendChild(time);
  if (r.updatedAt || r.revisions != null) {
    const time2 = document.createElement('span');
    time2.className = 'time';
    const up = r.updatedAt ? new Date(r.updatedAt).toLocaleString() : '';
    const rev = r.revisions || 0;
    time2.textContent = `更新：${up} · 修改${rev}次`;
    meta.appendChild(time2);
  }
  const content = document.createElement('div');
  content.className = 'preview-text';
  const q = r.question || '';
  const c = r.conclusion || '';
  const rs = r.reason || '';
  const a = r.action || '';
  const full = [
    q ? `我遇到的问题：${q}` : null,
    c ? `我的思考/结论：${c}` : null,
    rs ? `我为什么这么想：${rs}` : null,
    a ? `下次再遇到类似情况，我应该：${a}` : null,
    (!q && !c && !rs && !a) ? (r.text || '') : null
  ].filter(Boolean).join('\n');
  content.textContent = full;
  if (Array.isArray(r.supplements) && r.supplements.length > 0) {
    const supTitle = document.createElement('div');
    supTitle.className = 'note-title';
    supTitle.textContent = '补充思考';
    body.appendChild(supTitle);
    r.supplements.slice().reverse().forEach(su => {
      const item = document.createElement('div');
      item.className = 'evidence-item';
      const t = document.createElement('div'); t.textContent = new Date(su.time).toLocaleString();
      const m = document.createElement('div'); m.className = 'evidence-meta'; m.textContent = su.text;
      item.appendChild(t); item.appendChild(m);
      body.appendChild(item);
    });
  }
  const actions = document.createElement('div');
  actions.style.marginTop = '8px';
  const addSup = document.createElement('button');
  addSup.className = 'brand-chip';
  addSup.textContent = '补充思考';
  addSup.addEventListener('click', () => {
    const txt = prompt('补充你的思考');
    if (!txt) return;
    store.addSupplement(r.id, txt);
    renderHistoryPreview(store.getById(r.id));
  });
  const markState = document.createElement('button');
  markState.className = 'chip';
  markState.textContent = r.status || '未标记';
  markState.addEventListener('click', () => {
    const next = r.status === '未标记' ? '待解决' : (r.status === '待解决' ? '已解决' : '未标记');
    store.setStatus(r.id, next);
    renderHistoryPreview(store.getById(r.id));
    renderDashboard();
  });
  const markImp = document.createElement('button');
  markImp.className = 'chip';
  markImp.textContent = r.important ? '取消重要' : '标记重要';
  markImp.addEventListener('click', () => {
    const flag = store.toggleImportant(r.id);
    markImp.textContent = flag ? '取消重要' : '标记重要';
  });
  const delBtn = document.createElement('button');
  delBtn.className = 'chip';
  delBtn.textContent = '删除';
  delBtn.addEventListener('click', () => {
    store.trashById(r.id);
    renderHistory();
    panel.innerHTML = '<div class=\"empty\"><div class=\"empty-icon\"></div><div class=\"empty-title\">记录详情</div><div class=\"empty-sub\">点击左侧记录查看完整内容</div></div>';
  });
  body.appendChild(title);
  body.appendChild(meta);
  body.appendChild(content);
  const relTitle = document.createElement('div');
  relTitle.className = 'note-title';
  relTitle.textContent = '相关思考';
  body.appendChild(relTitle);
  const related = store.getAll().filter(x => x.id !== r.id && (x.scene === r.scene || (x.tags||[]).some(t => (r.tags||[]).includes(t)))).slice(0,3);
  related.forEach(x => {
    const item = document.createElement('div');
    item.className = 'evidence-item';
    const tt = document.createElement('div'); tt.textContent = x.title || (x.text||'').slice(0, 60);
    const mm = document.createElement('div'); mm.className = 'evidence-meta'; mm.textContent = (x.conclusion && x.conclusion.trim()) ? x.conclusion : (x.text||'').slice(0, 80);
    item.appendChild(tt); item.appendChild(mm);
    body.appendChild(item);
  });
  body.appendChild(actions);
  actions.appendChild(addSup);
  actions.appendChild(markState);
  actions.appendChild(markImp);
  actions.appendChild(delBtn);
  panel.appendChild(body);
}

function renderTrash() {
  if (!$trashList) return;
  $trashList.innerHTML = '';
  const recs = store.getTrash();
  const ffs = files.getTrash();
  const addCard = (item, kind) => {
    const card = document.createElement('div');
    card.className = 'note-card';
    const title = document.createElement('div');
    title.className = 'note-title';
    title.textContent = kind === 'record' ? (item.text ? item.text.slice(0,80) : '未命名笔记') : item.name;
    const sub = document.createElement('div');
    sub.className = 'note-sub';
    sub.textContent = kind === 'record' ? (item.tags||[]).join('、') : (item.type || '文件');
    const meta = document.createElement('div');
    meta.className = 'note-meta';
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = kind === 'record' ? '笔记/记录' : '文件';
    const time = document.createElement('span');
    time.className = 'time';
    time.textContent = item.deletedAt ? new Date(item.deletedAt).toLocaleString() : '';
    meta.appendChild(tag);
    meta.appendChild(time);
    const actions = document.createElement('div');
    actions.style.marginTop = '8px';
    const restore = document.createElement('button');
    restore.className = 'create-btn';
    restore.style.height = '32px';
    restore.textContent = '还原';
    restore.addEventListener('click', () => {
      if (kind === 'record') store.restoreById(item.id);
      else files.restoreById(item.id);
      renderTrash();
    });
    const purge = document.createElement('button');
    purge.className = 'chip';
    purge.textContent = '彻底删除';
    purge.addEventListener('click', () => {
      if (kind === 'record') store.purgeById(item.id);
      else files.purgeById(item.id);
      renderTrash();
    });
    actions.appendChild(restore);
    actions.appendChild(purge);
    card.appendChild(title);
    card.appendChild(sub);
    card.appendChild(meta);
    card.appendChild(actions);
    $trashList.appendChild(card);
  };
  recs.forEach(r => addCard(r, 'record'));
  ffs.forEach(f => addCard(f, 'file'));
}

function renderFilePreview(f) {
  const panel = document.querySelector('#view-files .preview');
  if (!panel) return;
  panel.innerHTML = '';
 
  const body = document.createElement('div');
  body.className = 'preview-body';
  const title = document.createElement('div');
  title.className = 'note-title';
  title.textContent = f.name;
  body.appendChild(title);
  const viewer = document.createElement('div');
  viewer.className = 'viewer';
  const url = f.blobUrl || f.dataUrl || '';
  if (/\.(png|jpg|jpeg|gif|webp|bmp|svg)$/i.test(f.name) || /^image\//.test(f.type)) {
    const img = document.createElement('img');
    img.src = url;
    img.style.maxWidth = '100%';
    img.style.borderRadius = '8px';
    viewer.appendChild(img);
  } else if (/^audio\//.test(f.type)) {
    const audio = document.createElement('audio');
    audio.controls = true;
    audio.src = url;
    viewer.appendChild(audio);
  } else if (/^video\//.test(f.type)) {
    const video = document.createElement('video');
    video.controls = true;
    video.src = url;
    video.style.maxWidth = '100%';
    viewer.appendChild(video);
  } else if (/\.pdf$/i.test(f.name) || f.type === 'application/pdf') {
    const embed = document.createElement('embed');
    embed.src = url;
    embed.type = 'application/pdf';
    embed.style.width = '100%';
    embed.style.minHeight = '320px';
    viewer.appendChild(embed);
  } else {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.textContent = '在新窗口打开预览/下载';
    viewer.appendChild(link);
  }
  body.appendChild(viewer);
  const actions = document.createElement('div');
  actions.className = 'evidence-actions';
  const delBtn = document.createElement('button');
  delBtn.className = 'chip';
  delBtn.textContent = '删除';
  delBtn.addEventListener('click', () => {
    files.trashById(f.id);
    renderFiles();
    setView('trash');
  });
  actions.appendChild(delBtn);
  body.appendChild(actions);
  panel.appendChild(body);
}

if ($trashEmpty) {
  $trashEmpty.addEventListener('click', () => {
    if (!confirm('确认清空废纸篓？此操作不可恢复。')) return;
    store.emptyTrash();
    files.emptyTrash();
    renderTrash();
  });
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
  if ($viewTrash) $viewTrash.style.display = view === 'trash' ? '' : 'none';
  $viewCompose.style.display = view === 'compose' ? '' : 'none';
  if ($viewDashboard) $viewDashboard.style.display = view === 'dashboard' ? '' : 'none';
  if ($viewReport) $viewReport.style.display = view === 'report' ? '' : 'none';
  if ($viewKeywords) $viewKeywords.style.display = view === 'keywords' ? '' : 'none';
  if ($viewSettings) $viewSettings.style.display = view === 'settings' ? '' : 'none';
  document.querySelectorAll('.sidebar .nav-item').forEach(it => it.classList.toggle('active', it.getAttribute('data-view') === view));
  if (view === 'notes') renderNotes();
  if (view === 'history') { renderHistory(); renderTimeline(); renderInsights(); renderChains(); }
  if (view === 'database') renderDatabase();
  if (view === 'files') renderFiles();
  if (view === 'trash') renderTrash();
  if (view === 'dashboard') renderDashboard();
  if (view === 'report') { ensureDemoReport(); }
  if (view === 'keywords') renderKeywords();
  if (view === 'compose') { updateSceneList(); composeRelatedSelected = new Set(); updateComposeRelated(); }
  if (view !== 'compose') { hint.hide(); }
}
function syncViewFromHash() {
  const m = (location.hash || '').match(/#view-([a-z]+)/);
  if (m) setView(m[1]);
}
window.addEventListener('hashchange', syncViewFromHash);
try {
  const today = new Date().toISOString().slice(0,10);
  const last = localStorage.getItem('siku_last_open_day');
  if (last !== today) {
    localStorage.setItem('siku_last_open_day', today);
    renderDashboard();
  }
} catch {}

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
    let last = null;
    for (const file of filesArr) {
      const blobUrl = URL.createObjectURL(file);
      const dataUrl = await readFileAsDataURL(file);
      let contentText = '';
      const isTextType = /^(text\/|application\/json|application\/xml|text\/html)/.test(file.type);
      const isTextExt = /\.(txt|md|log|csv|json|xml|html?|rtf)$/i.test(file.name);
      const isImage = (/^image\//.test(file.type) || /\.(png|jpg|jpeg|gif|webp|bmp|svg)$/i.test(file.name));
      if (isTextType || isTextExt) {
        const raw = await readFileAsText(file);
        if (/^text\/html/.test(file.type) || /\.html?$/i.test(file.name)) {
          const div = document.createElement('div');
          div.innerHTML = raw;
          contentText = (div.textContent || '').trim();
        } else if (/\.rtf$/i.test(file.name)) {
          let s = String(raw || '');
          s = s.replace(/\\par[d]?/g, '\n');
          s = s.replace(/\\'[0-9a-fA-F]{2}/g, (m) => {
            const hex = m.slice(2);
            return String.fromCharCode(parseInt(hex, 16));
          });
          s = s.replace(/\\[a-z]+-?\d*/gi, '');
          s = s.replace(/[{}]/g, '');
          s = s.replace(/\n{3,}/g, '\n\n');
          contentText = s.trim();
        } else {
          contentText = raw;
        }
      }
      const rec = files.addFile({ name: file.name, type: file.type, size: file.size, contentText, blobUrl, dataUrl });
      last = rec;
      if (isImage && typeof window.Tesseract !== 'undefined') {
        try {
          const result = await window.Tesseract.recognize(dataUrl || blobUrl, 'chi_sim', { logger: null });
          const text = String(result?.data?.text || '').trim();
          if (text) {
            files.updateFile(rec.id, { contentText: text });
            last = files.getAll().find(x => x.id === rec.id) || rec;
          }
        } catch {}
      }
    }
    setView('database');
    renderDatabase();
    $dbUpload.value = '';
    if (last) renderDbPreview(last);
  });
}
if ($fileUpload) {
  $fileUpload.addEventListener('change', async () => {
    const filesArr = Array.from($fileUpload.files || []);
    let last = null;
    for (const file of filesArr) {
      const blobUrl = URL.createObjectURL(file);
      const dataUrl = await readFileAsDataURL(file);
      const rec = files.addFile({ name: file.name, type: file.type, size: file.size, contentText: '', blobUrl, dataUrl });
      last = rec;
    }
    setView('files');
    renderFiles();
    $fileUpload.value = '';
    if (last) renderFilePreview(last);
  });
}
 

const $btnNewNote = document.getElementById('btn-new-note');
if ($btnNewNote) {
  $btnNewNote.addEventListener('click', () => setView('compose'));
}
if ($notesEmptyTitle) {
  $notesEmptyTitle.addEventListener('click', () => setView('compose'));
}
if ($notesEmptySub) {
  $notesEmptySub.addEventListener('click', () => setView('compose'));
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
      const isTextType = /^(text\/|application\/json|application\/xml|text\/html)/.test(f.type);
      const isTextExt = /\.(txt|md|log|csv|json|xml|html|rtf)$/i.test(f.name);
      if (isTextType || isTextExt) {
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
        const panel = document.getElementById('compose-evidence');
        if (panel) {
          const item = document.createElement('div');
          item.className = 'evidence-item';
          const title = document.createElement('div');
          title.textContent = '录音附件';
          const audio = document.createElement('audio');
          audio.controls = true;
          audio.src = url;
          item.appendChild(title);
          item.appendChild(audio);
          panel.appendChild(item);
        }
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
    const title = ($composeTitle && $composeTitle.value.trim()) || '';
    const scene = ($composeScene && $composeScene.value.trim()) || undefined;
    const features = extractFeatures({ text, tags: [composeTag], sceneHint: scene });
    let question = '', conclusion = '', reason = '', action = '';
    const lines = text.split('\n');
    let current = '';
    for (const ln of lines) {
      const l = ln.trim();
      if (/^我遇到的问题[:：]?/.test(l)) { current = 'q'; question = l.replace(/^我遇到的问题[:：]?/, '').trim(); continue; }
      if (/^我的思考\/结论[:：]?/.test(l)) { current = 'c'; conclusion = l.replace(/^我的思考\/结论[:：]?/, '').trim(); continue; }
      if (/^我为什么这么想[:：]?/.test(l)) { current = 'r'; reason = l.replace(/^我为什么这么想[:：]?/, '').trim(); continue; }
      if (/^下次再遇到类似情况，我应该[:：]?/.test(l)) { current = 'a'; action = l.replace(/^下次再遇到类似情况，我应该[:：]?/, '').trim(); continue; }
      if (!l) continue;
      if (current === 'q') question += (question ? ' ' : '') + l;
      if (current === 'c') conclusion += (conclusion ? ' ' : '') + l;
      if (current === 'r') reason += (reason ? ' ' : '') + l;
      if (current === 'a') action += (action ? ' ' : '') + l;
    }
    const relatedIds = Array.from(composeRelatedSelected || []);
    store.add({ title, text, tags: features.keywords, scene: features.scene, time: features.time, intent: features.intent, relatedIds, question, conclusion, reason, action });
    setView('notes');
    renderNotes();
  });
}
if ($composeAI) {
  $composeAI.addEventListener('click', async () => {
    if (!$composeText) return;
    const txt = $composeText.value.trim();
    if (!txt) return;
    $composeAI.disabled = true;
    try {
      const out = await aiSummarize(txt);
      const panel = document.getElementById('compose-evidence');
      if (panel) {
        const item = document.createElement('div');
        item.className = 'evidence-item';
        const title = document.createElement('div');
        title.textContent = 'AI摘要与关键词';
        const meta = document.createElement('div');
        meta.className = 'evidence-meta';
        meta.textContent = out;
        item.appendChild(title);
        item.appendChild(meta);
        panel.appendChild(item);
      }
    } catch (e) {
      alert('AI不可用，请在 localStorage 设置 siku_ai_endpoint');
    } finally {
      $composeAI.disabled = false;
    }
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
    if (text.length === 0) { hint.hide(); return; }
    const combined = [
      ...store.getAll(),
      ...files.getAll()
        .filter(f => (f.contentText || '').trim().length > 0)
        .map(f => ({ id: `db-${f.id}`, text: f.contentText || '', scene: '数据库', time: f.ts, tags: [f.type], name: f.name }))
    ];
    let suggestions = buildSuggestions({ text }, combined);
    if (suggestions.length > 0) {
      hint.render(suggestions, { title: '你之前记录过类似内容' });
    } else {
      const han = (text.match(/[\u4e00-\u9fff]/g) || []);
      if (han.length >= 2) {
        const q = han.slice(-2).join('');
        const strong = [];
        for (const r of combined) {
          const rt = (r.text || '') + ' ' + ((r.tags || []).join(' ')) + ' ' + (r.name || '');
          if (rt.includes(q)) {
            strong.push({
              id: r.id,
              title: rt.slice(0, 60),
              score: 1,
              scene: r.scene,
              time: r.time,
              tags: r.tags,
            });
          }
        }
        if (strong.length > 0) {
          hint.render(strong.slice(0,8), { title: '你之前记录过类似内容' });
        } else {
          const q2 = text;
          if (q2.length >= 2) {
            const any = [];
            for (const r of combined) {
              const rt = (r.text || '') + ' ' + ((r.tags || []).join(' ')) + ' ' + (r.name || '');
              if (rt.toLowerCase().includes(q2.toLowerCase())) {
                any.push({
                  id: r.id,
                  title: rt.slice(0, 60),
                  score: 1,
                  scene: r.scene,
                  time: r.time,
                  tags: r.tags,
                });
              }
            }
            if (any.length > 0) {
              hint.render(any.slice(0,8), { title: '你之前记录过类似内容' });
            } else {
              hint.hide();
            }
          } else {
            hint.hide();
          }
        }
      } else {
        const q2 = text;
        if (q2.length >= 2) {
          const any = [];
          for (const r of combined) {
            const rt = (r.text || '') + ' ' + ((r.tags || []).join(' ')) + ' ' + (r.name || '');
            if (rt.toLowerCase().includes(q2.toLowerCase())) {
              any.push({
                id: r.id,
                title: rt.slice(0, 60),
                score: 1,
                scene: r.scene,
                time: r.time,
                tags: r.tags,
              });
            }
          }
          if (any.length > 0) {
            hint.render(any.slice(0,8), { title: '你之前记录过类似内容' });
          } else {
            hint.hide();
          }
        } else {
          hint.hide();
        }
      }
    }
    repetitionHint(features);
  });
}
let composeRelatedSelected = new Set();
let kwSelected = new Set();
let reportSelected = new Set();
function getKWBlacklist() {
  try { return new Set(JSON.parse(localStorage.getItem('siku_kw_blacklist') || '[]')); } catch { return new Set(); }
}
function addToKWBlacklist(arr) {
  const cur = getKWBlacklist();
  arr.forEach(x => cur.add(x));
  localStorage.setItem('siku_kw_blacklist', JSON.stringify(Array.from(cur)));
}
const SIKU_STOPWORDS = new Set(['客户','产品','事情','功能','项目','模块','页面','问题','结论','原因','方案','情况','东西','内容']);
const SIKU_VERBS = ['提出','反馈','修改','决定','测试','上线','下线','修复','优化','回滚','延期','确认','评估','排期','对齐','跟进','复盘','核对','记录','导出'];
const SIKU_JUDG = ['风险高','性能差','成本增加','影响大','优先级高','可复用','已解决','待处理','进度慢','准确率低','需要优化','建议保留'];
const SIKU_ENTITY_MARKERS = ['客户','项目','功能','模块','页面','版本','渠道','供应商','部门','系统','平台','城市','地点','门店','接口'];
function extractSikuKeywordsFromRecords(records) {
  const blacklist = getKWBlacklist();
  const score = new Map();
  const bump = (k, s) => {
    if (!k) return;
    k = k.trim();
    if (k.length < 2 || k.length > 16) return;
    if (SIKU_STOPWORDS.has(k)) return;
    if (blacklist.has(k)) return;
    score.set(k, (score.get(k)||0) + s);
  };
  for (const r of records) {
    const text = [r.title, r.text, r.conclusion, r.reason, r.question].filter(Boolean).join(' ');
    // Entities via markers: “标记 + 名称”
    for (const mk of SIKU_ENTITY_MARKERS) {
      const re = new RegExp(`${mk}[：:\\s]?([\\u4e00-\\u9fa5A-Za-z0-9_-]{2,12})`, 'g');
      let m; while ((m = re.exec(text))){ bump(m[1], 2.0); bump(`${mk}${m[1]}`, 2.2); }
    }
    // Standalone codes (simple heuristic)
    const codeRe = /\b[A-Za-z][A-Za-z0-9_-]{3,15}\b/g;
    const seenCodes = new Set();
    let m1; while ((m1 = codeRe.exec(text))){ const k = m1[0]; if (!/\d{4,}/.test(k)) { if (!SIKU_STOPWORDS.has(k)) { if (!seenCodes.has(k)) { bump(k, 1.6); seenCodes.add(k); }}}}
    // Behaviors
    for (const v of SIKU_VERBS) { if (text.includes(v)) bump(v, 1.5); }
    // Judgments
    for (const j of SIKU_JUDG) { if (text.includes(j)) bump(j, 1.8); }
    // Reusable checklist cues
    const checklistRe = /(我应该|下次|清单|步骤|注意事项)[^\n，。；;]{2,18}/g;
    let m2; while ((m2 = checklistRe.exec(text))){ bump(m2[0], 1.4); }
    // Core concepts: repeated nouns 2-6 chars
    const hanWords = (text.match(/[\u4e00-\u9fa5]{2,6}/g) || []).slice(0, 200);
    const localFreq = new Map();
    hanWords.forEach(w => { if (!SIKU_STOPWORDS.has(w)) localFreq.set(w, (localFreq.get(w)||0)+1); });
    for (const [w, c] of localFreq.entries()) if (c >= 2) bump(w, Math.min(1.2 + c*0.1, 1.8));
  }
  let arr = Array.from(score.entries()).sort((a,b)=>b[1]-a[1]);
  // Remove near-duplicates (prefix matches)
  const seen = new Set(); const dedup = [];
  for (const [k,s] of arr) {
    if ([...seen].some(x => k.includes(x) || x.includes(k))) continue;
    dedup.push([k,s]);
    seen.add(k);
  }
  // limit 5-12
  const top = dedup.slice(0, 12);
  if (top.length < 5) {
    // Fallback: include existing tags
    const extra = [];
    records.forEach(r => (r.tags||[]).forEach(t => { if (!SIKU_STOPWORDS.has(t)) extra.push(t); }));
    for (const t of extra) {
      if (top.find(x => x[0] === t)) continue;
      top.push([t, 1.0]);
      if (top.length >= 5) break;
    }
  }
  return top;
}
function uniqueScenes() {
  const set = new Set(store.getAll().map(r => r.scene).filter(Boolean));
  return Array.from(set);
}
function updateSceneList() {
  const dl = document.getElementById('scene-list');
  if (!dl) return;
  dl.innerHTML = '';
  uniqueScenes().forEach(s => {
    const opt = document.createElement('option');
    opt.value = s;
    dl.appendChild(opt);
  });
}
function tokenize(s='') {
  return (s.toLowerCase().match(/[\p{sc=Han}]{1}|[a-z0-9]+/giu) || []).filter(Boolean);
}
function updateComposeRelated() {
  if (!$composeRelatedList) return;
  const title = ($composeTitle && $composeTitle.value.trim()) || '';
  const scene = ($composeScene && $composeScene.value.trim()) || '';
  const tokens = new Set(tokenize(title));
  const all = store.getAll();
  const scored = [];
  for (const r of all) {
    if (scene && r.scene && r.scene !== scene) continue;
    const hay = `${r.title||''} ${r.text||''} ${(r.tags||[]).join(' ')}`.toLowerCase();
    let score = 0;
    tokens.forEach(t => { if (t && hay.includes(t)) score += 1; });
    if (score > 0) scored.push({ r, score });
  }
  scored.sort((a,b)=>b.score-a.score);
  const top = scored.slice(0,3).map(x=>x.r);
  $composeRelatedList.innerHTML = '';
  if (top.length === 0) {
    if ($composeRelatedPanel) $composeRelatedPanel.style.display = 'none';
    return;
  }
  if ($composeRelatedPanel) $composeRelatedPanel.style.display = '';
  for (const r of top) {
    const item = document.createElement('div');
    item.className = 'evidence-item';
    const t = document.createElement('div');
    t.textContent = r.title || (r.text || '').slice(0, 60) || '未命名记录';
    const m = document.createElement('div');
    m.className = 'evidence-meta';
    m.textContent = (r.conclusion && r.conclusion.trim()) ? r.conclusion : (r.text || '').slice(0, 80);
    const btn = document.createElement('button');
    btn.className = 'chip';
    btn.textContent = composeRelatedSelected.has(r.id) ? '已关联' : '关联';
    btn.addEventListener('click', () => {
      if (composeRelatedSelected.has(r.id)) composeRelatedSelected.delete(r.id);
      else composeRelatedSelected.add(r.id);
      btn.textContent = composeRelatedSelected.has(r.id) ? '已关联' : '关联';
    });
    item.appendChild(t);
    item.appendChild(m);
    item.appendChild(btn);
    $composeRelatedList.appendChild(item);
  }
}
if ($composeTitle) $composeTitle.addEventListener('input', updateComposeRelated);
if ($composeScene) $composeScene.addEventListener('input', updateComposeRelated);

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
if ($dashNew) {
  $dashNew.addEventListener('click', () => setView('compose'));
}
function renderDashboard() {
  if ($dashReminders) {
    const freq = localStorage.getItem('siku_review_frequency') || '7';
    const enabled = localStorage.getItem('siku_reminders_enabled') !== 'false';
    const days = parseInt(freq, 10) || 7;
    const now = Date.now();
    const all = store.getAll().filter(r => {
      if (!enabled) return false;
      const t = r.time ? new Date(r.time).getTime() : 0;
      return now - t <= days * 86400000;
    }).slice(0, 8);
    $dashReminders.innerHTML = '';
    for (const r of all) {
      const card = document.createElement('div');
      card.className = 'note-card';
      const title = document.createElement('div');
      title.className = 'note-title';
      title.textContent = r.title || (r.text||'').slice(0, 40) || '未命名记录';
      const sub = document.createElement('div');
      sub.className = 'note-sub';
      sub.textContent = (r.conclusion && r.conclusion.trim()) ? r.conclusion : (r.text||'').slice(0, 80);
      const meta = document.createElement('div');
      meta.className = 'note-meta';
      const tag = document.createElement('span'); tag.className = 'tag'; tag.textContent = r.scene || '工作';
      const time = document.createElement('span'); time.className = 'time'; time.textContent = relTime(r.time);
      meta.appendChild(tag); meta.appendChild(time);
      const actions = document.createElement('div');
      actions.style.marginTop = '8px';
      const delBtn = document.createElement('button');
      delBtn.className = 'chip';
      delBtn.textContent = '删除';
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        store.trashById(r.id);
        renderDashboard();
        showToast('已移至废纸篓');
      });
      actions.appendChild(delBtn);
      card.appendChild(title); card.appendChild(sub); card.appendChild(meta); card.appendChild(actions);
      $dashReminders.appendChild(card);
    }
  }
  if ($dashScenes) {
    $dashScenes.innerHTML = '';
    const scenes = uniqueScenes();
    for (const s of scenes) {
      const btn = document.createElement('button');
      btn.className = 'chip';
      btn.textContent = s;
      btn.addEventListener('click', () => {
        showToast(`已选择：${s}`);
        // 保留当前页面，不跳转
      });
      $dashScenes.appendChild(btn);
    }
  }
  if ($dashTodo) {
    $dashTodo.innerHTML = '';
    const list = store.getAll().filter(r => r.status === '待思考' || r.status === '处理中' || r.important).slice(0, 8);
    for (const r of list) {
      const card = document.createElement('div');
      card.className = 'note-card';
      const title = document.createElement('div'); title.className = 'note-title'; title.textContent = r.title || (r.text||'').slice(0, 40);
      const sub = document.createElement('div'); sub.className = 'note-sub'; sub.textContent = `${r.scene || '场景'}`;
      const meta = document.createElement('div'); meta.className = 'note-meta';
      const tag = document.createElement('span'); tag.className = 'tag'; tag.textContent = r.important ? '重要' : '普通';
      const st = document.createElement('span'); st.className = 'tag-status ' + ((r.status === '已解决') ? 'solved' : 'pending'); st.textContent = r.status || '未标记';
      const time = document.createElement('span'); time.className = 'time'; time.textContent = relTime(r.time);
      meta.appendChild(tag); meta.appendChild(st); meta.appendChild(time);
      const actions = document.createElement('div');
      actions.style.marginTop = '8px';
      const delBtn = document.createElement('button');
      delBtn.className = 'chip';
      delBtn.textContent = '删除';
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        store.trashById(r.id);
        renderDashboard();
        showToast('已移至废纸篓');
      });
      actions.appendChild(delBtn);
      card.appendChild(title); card.appendChild(sub); card.appendChild(meta); card.appendChild(actions);
      $dashTodo.appendChild(card);
    }
  }
  if ($dashSolved) {
    $dashSolved.innerHTML = '';
    const list = store.getAll().filter(r => r.status === '已解决').sort((a,b)=> new Date(b.time||0)-new Date(a.time||0)).slice(0, 8);
    for (const r of list) {
      const card = document.createElement('div');
      card.className = 'note-card';
      const title = document.createElement('div'); title.className = 'note-title'; title.textContent = r.title || (r.text||'').slice(0, 40);
      const sub = document.createElement('div'); sub.className = 'note-sub'; sub.textContent = (r.conclusion && r.conclusion.trim()) ? r.conclusion : (r.text||'').slice(0, 80);
      const meta = document.createElement('div'); meta.className = 'note-meta';
      const tag = document.createElement('span'); tag.className = 'tag-status solved'; tag.textContent = '已解决';
      const time = document.createElement('span'); time.className = 'time'; time.textContent = relTime(r.time);
      meta.appendChild(tag); meta.appendChild(time);
      card.appendChild(title); card.appendChild(sub); card.appendChild(meta);
      card.addEventListener('click', () => {
        setView('history');
        renderHistory();
        const el = document.querySelector(`#view-history .note-card[data-id="${r.id}"]`);
        if (el) {
          document.querySelectorAll('#view-history .note-card').forEach(x => x.classList.remove('selected'));
          el.classList.add('selected');
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
      $dashSolved.appendChild(card);
    }
  }
  if ($dashKeywords) {
    $dashKeywords.innerHTML = '';
    const arr = extractSikuKeywordsFromRecords(store.getAll()).slice(0, 12);
    for (const [kw] of arr) {
      const related = store.getAll().filter(r => {
        const hay = `${r.title||''} ${r.text||''} ${r.conclusion||''} ${r.reason||''} ${r.question||''} ${(r.tags||[]).join(' ')}`;
        return hay.includes(kw);
      });
      const cnt = related.length;
      const wrap = document.createElement('div');
      wrap.style.display = 'inline-flex';
      wrap.style.alignItems = 'center';
      const btn = document.createElement('button');
      btn.className = 'chip';
      btn.textContent = `${kw}·${cnt}`;
      btn.style.paddingRight = '28px';
      btn.addEventListener('click', () => {
        navigateToRecordsByKeyword(kw);
      });
      const del = document.createElement('span');
      del.textContent = '×';
      del.title = '删除该关键词';
      del.style.cursor = 'pointer';
      del.style.marginLeft = '-22px';
      del.style.padding = '2px 6px';
      del.style.borderRadius = '10px';
      del.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!confirm(`确定删除关键词「${kw}」？将从所有记录中移除该标签`)) return;
        store.deleteKeyword(kw);
        addToKWBlacklist([kw]);
        renderDashboard();
        if (currentView === 'keywords') renderKeywords();
        showToast('关键词已删除');
      });
      wrap.appendChild(btn);
      wrap.appendChild(del);
      $dashKeywords.appendChild(wrap);
    }
  }
  // 近期报告已移除
  
}
function renderReport() {
  if (!$reportContent) return;
  updateSceneList();
  const type = ($reportType && $reportType.value) || 'scene';
  const now = Date.now();
  let title = '决策报告';
  let selected = [];
  if (type === 'scene') {
    const scene = ($reportScene && $reportScene.value.trim()) || '';
    selected = store.getAll().filter(r => scene ? r.scene === scene : true);
    title = scene ? `场景报告：${scene}` : '场景报告';
  } else if (type === 'time') {
    const days = parseInt(($reportRange && $reportRange.value) || '7', 10) || 7;
    selected = store.getAll().filter(r => {
      const t = r.time ? new Date(r.time).getTime() : 0;
      return now - t <= days * 86400000;
    });
    title = `时间报告：近${days}天`;
  } else if (type === 'keyword') {
    const kw = ($reportKeyword && $reportKeyword.value.trim()) || '';
    selected = store.getAll().filter(r => kw ? (r.tags||[]).includes(kw) : true);
    title = kw ? `关键词专题：${kw}` : '关键词专题';
  }
  const stats = {
    total: selected.length,
    important: selected.filter(r => r.important).length,
    solved: selected.filter(r => r.status === '已解决').length,
    pending: selected.filter(r => r.status === '待思考' || r.status === '处理中').length
  };
  $reportContent.innerHTML = '';
  const head = document.createElement('div');
  head.className = 'list-head';
  head.textContent = `${title} · 总${stats.total} 条 · 重要${stats.important} · 已解决${stats.solved} · 待处理${stats.pending}`;
  $reportContent.appendChild(head);
  let fullText = `${title}\n总记录数：${stats.total}；重要：${stats.important}；已解决：${stats.solved}；待处理：${stats.pending}\n\n`;
  reportSelected = new Set(reportSelected); // keep existing selections when可行
  for (const r of selected) {
    const block = document.createElement('div');
    block.className = 'note-card';
    block.style.position = 'relative';
    const ck = document.createElement('input');
    ck.type = 'checkbox';
    ck.className = 'report-check';
    ck.checked = reportSelected && reportSelected.has(r.id);
    ck.addEventListener('click', (e) => {
      e.stopPropagation();
      if (ck.checked) { reportSelected.add(r.id); block.classList.add('selected'); }
      else { reportSelected.delete(r.id); block.classList.remove('selected'); }
    });
    block.addEventListener('click', () => {
      ck.checked = !ck.checked;
      if (ck.checked) { reportSelected.add(r.id); block.classList.add('selected'); }
      else { reportSelected.delete(r.id); block.classList.remove('selected'); }
    });
    const t = document.createElement('div'); t.className = 'note-title'; t.textContent = r.title || (r.text||'').slice(0, 40) || '未命名记录';
    const sub = document.createElement('div'); sub.className = 'note-sub';
    const q = r.question || '—';
    const c = r.conclusion || '—';
    const rs = r.reason || '—';
    const st = r.status || '未标记';
    sub.textContent = `问题：${q} · 结论：${c} · 原因：${rs} · 状态：${st}`;
    block.appendChild(ck); block.appendChild(t); block.appendChild(sub);
    $reportContent.appendChild(block);
    fullText += `标题：${t.textContent}\n问题：${q}\n结论：${c}\n原因：${rs}\n状态：${st}\n\n`;
  }
  const topTags = {};
  selected.forEach(r => (r.tags||[]).forEach(tag => topTags[tag]=(topTags[tag]||0)+1));
  const hot = Object.entries(topTags).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0]).join('、') || '—';
  const suggest = selected.filter(r => r.important || r.status==='已解决').slice(0,5).map(r => r.title || (r.text||'').slice(0,40)).join('、') || '—';
  const summary = document.createElement('div');
  summary.className = 'note-sub';
  summary.textContent = `自动总结：高频关键词 ${hot}；建议优先参考：${suggest}`;
  $reportContent.appendChild(summary);
  fullText += `自动总结：高频关键词：${hot}\n建议：优先参考：${suggest}\n`;
  try {
    const logs = JSON.parse(localStorage.getItem('siku_reports') || '[]');
    logs.push({ title, time: new Date().toISOString(), count: stats.total });
    localStorage.setItem('siku_reports', JSON.stringify(logs));
  } catch {}
  if ($reportCopy) {
    $reportCopy.onclick = async () => { try { await navigator.clipboard.writeText(fullText); alert('已复制'); } catch {} };
  }
  if ($reportExportTxt) {
    $reportExportTxt.onclick = () => {
      const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${title}.txt`; a.click();
    };
  }
  if ($reportExportMd) {
    $reportExportMd.onclick = () => {
      const lines = [`# ${title}`, `- 总记录数：${stats.total}`, `- 重要：${stats.important}`, `- 已解决：${stats.solved}`, `- 待处理：${stats.pending}`, ``];
      selected.forEach(r => {
        const t = r.title || (r.text||'').slice(0,40) || '未命名记录';
        const q = r.question || '—'; const c = r.conclusion || '—'; const rs = r.reason || '—'; const st = r.status || '未标记';
        lines.push(`## ${t}`, `- 问题：${q}`, `- 结论：${c}`, `- 原因：${rs}`, `- 状态：${st}`, ``);
      });
      lines.push(`**自动总结**`, `- 高频关键词：${hot}`, `- 建议优先参考：${suggest}`);
      const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${title}.md`; a.click();
    };
  }
  if ($reportDelete) {
    $reportDelete.onclick = () => {
      if (!reportSelected || reportSelected.size === 0) { alert('请选择要删除的记录'); return; }
      if (!confirm(`确定删除选中的 ${reportSelected.size} 条记录？记录将移动到废纸篓`)) return;
      for (const id of reportSelected) {
        store.trashById(id);
      }
      reportSelected.clear();
      if (typeof renderReportV2 === 'function') renderReportV2();
      renderDashboard();
    };
  }
}
// 旧按钮已移除

function renderReportV2() {
  if (!$reportContent) return;
  updateSceneList();
  const now = Date.now();
  const scene = ($reportScene && $reportScene.value.trim()) || '';
  const rangeRaw = ($reportRange && $reportRange.value) || 'all';
  const days = rangeRaw === 'all' ? null : parseInt(rangeRaw, 10) || null;
  const kw = ($reportKeyword && $reportKeyword.value.trim()) || '';
  let selected = store.getAll().filter(r => {
    if (reportStatusFilter) {
      if (reportStatusFilter === '重要') {
        if (!(r.isImportant || r.important)) return false;
      } else {
        if (r.status !== reportStatusFilter) return false;
      }
    }
    if (scene && r.scene !== scene) return false;
    if (days != null) {
      const t = r.time ? new Date(r.time).getTime() : 0;
      if (now - t > days * 86400000) return false;
    }
    if (kw) {
      const hay = `${r.title||''} ${r.text||''} ${r.conclusion||''} ${r.reason||''} ${r.question||''} ${(r.tags||[]).join(' ')}`;
      if (!hay.includes(kw)) return false;
    }
    return true;
  });
  let title = '决策报告';
  if (scene) title = `场景：${scene}`;
  if (kw) title += ` · 关键词：${kw}`;
  if (days) title += ` · 近${days}天`;
  const importantTop = (a,b)=> ((b.isImportant||b.important?1:0)-(a.isImportant||a.important?1:0)) || (new Date(b.time||0)-new Date(a.time||0));
  selected.sort(importantTop);
  const stats = {
    total: selected.length,
    important: selected.filter(r => r.isImportant || r.important).length,
    solved: selected.filter(r => r.status === '已解决').length,
    pending: selected.filter(r => r.status === '待思考' || r.status === '处理中').length
  };
  $reportContent.innerHTML = '';
  const stat = document.createElement('div');
  stat.className = 'note-card';
  const statTitle = document.createElement('div'); statTitle.className = 'note-title'; statTitle.textContent = title;
  const statText = document.createElement('div'); statText.className = 'note-sub'; statText.innerHTML = `本次报告共沉淀 <b style="color:#6366f1">${stats.total}</b> 条决策记录 · 已解决 <b style="color:#36D399">${stats.solved}</b> · 待处理 <b style="color:#FF9F43">${stats.pending}</b> · 重要 <b style="color:#6366f1">${stats.important}</b>`;
  stat.appendChild(statTitle); stat.appendChild(statText);
  $reportContent.appendChild(stat);
  if (selected.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'note-card';
    const t = document.createElement('div'); t.className = 'note-title'; t.textContent = '暂无相关决策记录';
    const s = document.createElement('div'); s.className = 'note-sub'; s.textContent = '可调整筛选条件重试';
    empty.appendChild(t); empty.appendChild(s);
    $reportContent.appendChild(empty);
  }
  let fullText = `${title}\n总记录数：${stats.total}；重要：${stats.important}；已解决：${stats.solved}；待处理：${stats.pending}\n\n`;
  reportSelected = new Set(reportSelected);
  const renderChunk = (list, start) => {
    const end = Math.min(start + 30, list.length);
    for (let i=start; i<end; i++) {
      const r = list[i];
      const block = document.createElement('div');
      block.className = 'note-card';
      block.style.position = 'relative';
      const ck = document.createElement('input');
      ck.type = 'checkbox';
      ck.className = 'report-check';
      ck.checked = reportSelected && reportSelected.has(r.id);
      ck.addEventListener('click', (e) => {
        e.stopPropagation();
        if (ck.checked) { reportSelected.add(r.id); block.classList.add('selected'); }
        else { reportSelected.delete(r.id); block.classList.remove('selected'); }
      });
      const t = document.createElement('div'); t.className = 'note-title'; t.textContent = r.title || (r.text||'').slice(0, 40) || '未命名记录';
      const sub = document.createElement('div'); sub.className = 'note-sub';
      const q = r.question || '—';
      const c = r.conclusion || '—';
      const rs = r.reason || '—';
      const st = r.status || '未标记';
      sub.textContent = `问题：${q} · 结论：${c}`;
      const meta = document.createElement('div');
      meta.className = 'note-meta';
      const tag = document.createElement('span'); tag.className = 'tag-status ' + ((st === '已解决') ? 'solved' : 'pending'); tag.textContent = (r.isImportant||r.important) ? '重要' : st;
      const time = document.createElement('span'); time.className = 'time'; time.textContent = r.time ? new Date(r.time).toLocaleString() : '未设时间';
      meta.appendChild(tag); meta.appendChild(time);
      tag.addEventListener('click', (e) => {
        e.stopPropagation();
        const v = tag.textContent || '';
        reportStatusFilter = (reportStatusFilter === v) ? null : v;
        renderReportV2();
      });
      const details = document.createElement('div');
      details.className = 'note-sub';
      details.style.display = 'none';
      details.textContent = `依据：${rs} · 创建时间：${r.time ? new Date(r.time).toLocaleString() : '—'}`;
      const tog = document.createElement('button');
      tog.className = 'chip';
      tog.textContent = '展开';
      tog.style.marginTop = '8px';
      tog.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = details.style.display !== 'none';
        details.style.display = open ? 'none' : '';
        tog.textContent = open ? '展开' : '折叠';
      });
      block.appendChild(ck); block.appendChild(t); block.appendChild(sub); block.appendChild(meta); block.appendChild(details); block.appendChild(tog);
      $reportContent.appendChild(block);
      fullText += `标题：${t.textContent}\n问题：${q}\n结论：${c}\n依据：${rs}\n状态：${st}\n\n`;
    }
    if (end < list.length) {
      requestAnimationFrame(() => renderChunk(list, end));
    }
  };
  renderChunk(selected, 0);
  const topTags = {};
  selected.forEach(r => (r.tags||[]).forEach(tag => topTags[tag]=(topTags[tag]||0)+1));
  const hot = Object.entries(topTags).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0]).join('、') || '—';
  const suggest = selected.filter(r => (r.isImportant||r.important) || r.status==='已解决').slice(0,5).map(r => r.title || (r.text||'').slice(0,40)).join('、') || '—';
  const summary = document.createElement('div');
  summary.className = 'note-sub';
  summary.textContent = `自动总结：高频关键词 ${hot}；建议优先参考：${suggest}`;
  $reportContent.appendChild(summary);
  fullText += `自动总结：高频关键词：${hot}\n建议：优先参考：${suggest}\n`;
  try {
    const logs = JSON.parse(localStorage.getItem('siku_reports') || '[]');
    logs.push({ title, time: new Date().toISOString(), count: stats.total });
    localStorage.setItem('siku_reports', JSON.stringify(logs));
  } catch {}
  if ($reportCopy) {
    $reportCopy.onclick = async () => { try { await navigator.clipboard.writeText(fullText); showToast('报告全文已复制到剪贴板'); } catch {} };
  }
  if ($reportExportTxt) {
    $reportExportTxt.onclick = () => {
      const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${title}.txt`; a.click();
      showToast('导出成功，文件已保存至本地');
    };
  }
  if ($reportExportMd) {
    $reportExportMd.onclick = () => {
      const lines = [`# ${title}`, `- 总记录数：${stats.total}`, `- 重要：${stats.important}`, `- 已解决：${stats.solved}`, `- 待处理：${stats.pending}`, ``];
      selected.forEach(r => {
        const t = r.title || (r.text||'').slice(0,40) || '未命名记录';
        const q = r.question || '—'; const c = r.conclusion || '—'; const rs = r.reason || '—'; const st = r.status || '未标记';
        lines.push(`## ${t}`, `- 问题：${q}`, `- 结论：${c}`, `- 依据：${rs}`, `- 状态：${st}`, ``);
      });
      lines.push(`**自动总结**`, `- 高频关键词：${hot}`, `- 建议优先参考：${suggest}`);
      const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${title}.md`; a.click();
      showToast('导出成功，文件已保存至本地');
    };
  }
  if ($reportDelete) {
    $reportDelete.onclick = () => {
      if (!reportSelected || reportSelected.size === 0) { alert('请选择要删除的记录'); return; }
      if (!confirm(`确定删除选中的 ${reportSelected.size} 条记录？记录将移动到废纸篓`)) return;
      for (const id of reportSelected) {
        store.trashById(id);
      }
      reportSelected.clear();
      renderReportV2();
      renderDashboard();
      showToast('已移动到废纸篓');
    };
  }
  saveReportFilters();
}

if ($reportRefresh) {
  $reportRefresh.onclick = () => { renderReportV2(); showToast('报告已刷新'); };
}
if ($reportBack) {
  $reportBack.onclick = () => history.back();
}
if ($reportHome) {
  $reportHome.onclick = () => setView('dashboard');
}

function saveReportFilters() {
  try {
    const obj = { scene: $reportScene?.value || '', range: $reportRange?.value || 'all', keyword: $reportKeyword?.value || '' };
    localStorage.setItem('siku_report_filters', JSON.stringify(obj));
  } catch {}
}
function loadReportFilters() {
  try {
    const raw = localStorage.getItem('siku_report_filters');
    if (!raw) return;
    const obj = JSON.parse(raw);
    if ($reportScene) $reportScene.value = obj.scene || '';
    if ($reportRange) $reportRange.value = obj.range || 'all';
    if ($reportKeyword) $reportKeyword.value = obj.keyword || '';
  } catch {}
}
function showToast(text) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = text;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 2000);
}

function initReportPage() {
  loadReportFilters();
  reportChecked = new Set();
  renderReportListOnly();
  if ($reportActionbar) $reportActionbar.style.display = '';
  updateReportSelectedCount();
  if ($reportBack) $reportBack.onclick = () => history.back();
  if ($reportHome) $reportHome.onclick = () => setView('dashboard');
  if ($reportBuild) $reportBuild.onclick = () => buildReportFromSelection();
  if ($reportSelectAll) $reportSelectAll.onclick = () => {
    const list = getFilteredForReport();
    const allSelected = reportChecked.size === list.length && list.length > 0;
    if (allSelected) {
      reportChecked.clear();
    } else {
      reportChecked = new Set(list.map(it => it.id));
    }
    renderReportListOnly();
    updateReportSelectedCount();
  };
  if ($reportScene) $reportScene.addEventListener('input', onReportFilterChange);
  if ($reportRange) $reportRange.addEventListener('change', onReportFilterChange);
  if ($reportKeyword) $reportKeyword.addEventListener('input', debounce(onReportFilterChange, 200));
}

function onReportFilterChange() {
  reportChecked.clear();
  saveReportFilters();
  renderReportListOnly();
  clearReportOutput();
  updateReportSelectedCount();
}

function getFilteredForReport() {
  const now = Date.now();
  const scene = ($reportScene && $reportScene.value.trim()) || '';
  const rangeRaw = ($reportRange && $reportRange.value) || 'all';
  const days = rangeRaw === 'all' ? null : parseInt(rangeRaw, 10) || null;
  const kw = ($reportKeyword && $reportKeyword.value.trim()) || '';
  return store.getAll().filter(r => {
    if (scene && r.scene !== scene) return false;
    if (days != null) {
      const t = r.time ? new Date(r.time).getTime() : 0;
      if (now - t > days * 86400000) return false;
    }
    if (kw) {
      const hay = `${r.title||''} ${r.text||''} ${r.conclusion||''} ${r.reason||''} ${r.question||''} ${(r.tags||[]).join(' ')}`;
      if (!hay.includes(kw)) return false;
    }
    return true;
  }).sort((a,b)=> new Date(b.time||0)-new Date(a.time||0));
}

function renderReportListOnly() {
  if (!$reportList) return;
  const list = getFilteredForReport();
  $reportList.innerHTML = '';
  for (const r of list) {
    const card = document.createElement('div');
    card.className = 'note-card';
    const ck = document.createElement('input');
    ck.type = 'checkbox';
    ck.className = 'report-check';
    ck.checked = reportChecked.has(r.id);
    ck.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleReportSelection(r.id, ck.checked, card);
    });
    card.addEventListener('click', () => {
      const next = !ck.checked;
      ck.checked = next;
      toggleReportSelection(r.id, next, card);
    });
    const title = document.createElement('div');
    title.className = 'note-title';
    title.textContent = r.question || r.title || (r.text||'').slice(0, 40) || '未命名记录';
    const sub = document.createElement('div');
    sub.className = 'note-sub';
    sub.textContent = `结论：${r.conclusion || '—'}`;
    const meta = document.createElement('div');
    meta.className = 'note-meta';
    const tag = document.createElement('span'); tag.className = 'tag'; tag.textContent = r.scene || '未分类';
    const time = document.createElement('span'); time.className = 'time'; time.textContent = r.time ? new Date(r.time).toLocaleString() : '—';
    meta.appendChild(tag); meta.appendChild(time);
    card.appendChild(ck); card.appendChild(title); card.appendChild(sub); card.appendChild(meta);
    if (reportChecked.has(r.id)) card.classList.add('selected');
    $reportList.appendChild(card);
  }
}

function toggleReportSelection(id, checked, card) {
  if (checked) { reportChecked.add(id); card.classList.add('selected'); }
  else { reportChecked.delete(id); card.classList.remove('selected'); }
  updateReportSelectedCount();
}

function updateReportSelectedCount() {
  if ($reportSelectedCount) $reportSelectedCount.textContent = String(reportChecked.size);
}

function clearReportOutput() {
  if ($reportOutput) $reportOutput.innerHTML = '';
}

function buildReportFromSelection() {
  if (!reportChecked || reportChecked.size === 0) { showToast('请至少选择1条决策记录'); return; }
  const list = getFilteredForReport().filter(r => reportChecked.has(r.id));
  renderStrictReport(list);
}

function renderStrictReport(selected) {
  if (!$reportOutput) return;
  $reportOutput.innerHTML = '';
  const title = `决策汇总报告（共 ${selected.length} 条）`;
  const head = document.createElement('div');
  head.className = 'note-card';
  const t = document.createElement('div'); t.className = 'note-title'; t.textContent = title;
  const stats = {
    total: selected.length,
    solved: selected.filter(r => r.status === '已解决').length,
    pending: selected.filter(r => r.status !== '已解决').length
  };
  const sub = document.createElement('div'); sub.className = 'note-sub'; sub.innerHTML = `统计：共 <b style="color:#6366f1">${stats.total}</b> 条；已解决 <b style="color:#36D399">${stats.solved}</b>；待处理 <b style="color:#FF9F43">${stats.pending}</b>`;
  head.appendChild(t); head.appendChild(sub);
  $reportOutput.appendChild(head);
  const sorted = selected.slice().sort((a,b)=> new Date(b.time||0)-new Date(a.time||0));
  for (const r of sorted) {
    const card = document.createElement('div');
    card.className = 'note-card';
    const q = document.createElement('div'); q.className = 'note-title'; q.textContent = `问题：${r.question || '—'}`;
    const c = document.createElement('div'); c.className = 'note-sub'; c.textContent = `结论：${r.conclusion || '—'}`;
    const e = document.createElement('div'); e.className = 'note-sub'; e.textContent = `依据：${r.reason || '—'}`;
    const tm = document.createElement('div'); tm.className = 'note-meta'; tm.textContent = `时间：${r.time ? new Date(r.time).toLocaleString() : '—'}`;
    card.appendChild(q); card.appendChild(c); card.appendChild(e); card.appendChild(tm);
    $reportOutput.appendChild(card);
  }
  const summary = document.createElement('div');
  summary.className = 'note-card';
  const st = document.createElement('div'); st.className = 'note-title'; st.textContent = '系统自动总结';
  const hotKw = (() => {
    const cnt = {};
    selected.forEach(r => (r.tags||[]).forEach(t => cnt[t]=(cnt[t]||0)+1));
    return Object.entries(cnt).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0]).join('、') || '—';
  })();
  const stSub = document.createElement('div'); stSub.className = 'note-sub'; stSub.textContent = `高频关键词：${hotKw}`;
  summary.appendChild(st); summary.appendChild(stSub);
  $reportOutput.appendChild(summary);
}

function debounce(fn, wait=200){ let t=null; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args), wait); }; }
function renderKeywords(focusKw) {
  if (!$kwList || !$kwRelated) return;
  const arr = extractSikuKeywordsFromRecords(store.getAll()).slice(0, 12);
  $kwList.innerHTML = '';
  let active = focusKw || (arr[0]?.[0] || '');
  for (const [kw] of arr) {
    const cnt = store.getAll().filter(r => {
      const hay = `${r.title||''} ${r.text||''} ${r.conclusion||''} ${r.reason||''} ${r.question||''} ${(r.tags||[]).join(' ')}`;
      return hay.includes(kw);
    }).length;
    const item = document.createElement('div');
    item.className = 'chip kw-item';
    if (kw === active) item.classList.add('active');
    if (kwSelected.has(kw)) item.classList.add('selected');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = kwSelected.has(kw);
    box.addEventListener('click', (e) => {
      e.stopPropagation();
      if (box.checked) kwSelected.add(kw);
      else kwSelected.delete(kw);
      item.classList.toggle('selected', box.checked);
    });
    const text = document.createElement('span');
    text.textContent = `${kw}·${cnt}`;
    text.style.cursor = 'pointer';
    text.addEventListener('click', (e) => {
      e.stopPropagation();
      navigateToRecordsByKeyword(kw);
    });
    item.addEventListener('click', () => { renderKeywords(kw); });
    item.appendChild(box);
    item.appendChild(text);
    $kwList.appendChild(item);
  }
  $kwRelated.innerHTML = '';
  if (!active) return;
  const related = store.getAll().filter(r => {
    const hay = `${r.title||''} ${r.text||''} ${r.conclusion||''} ${r.reason||''} ${r.question||''} ${(r.tags||[]).join(' ')}`;
    return hay.includes(active);
  });
  for (const r of related) {
    const card = document.createElement('div');
    card.className = 'note-card';
    const t = document.createElement('div'); t.className = 'note-title'; t.textContent = r.title || (r.text||'').slice(0, 60) || '未命名记录';
    const sub = document.createElement('div'); sub.className = 'note-sub'; sub.textContent = (r.conclusion && r.conclusion.trim()) ? r.conclusion : (r.text||'').slice(0, 80);
    const meta = document.createElement('div'); meta.className = 'note-meta';
    const tag = document.createElement('span'); tag.className = 'tag'; tag.textContent = r.scene || '场景';
    const time = document.createElement('span'); time.className = 'time'; time.textContent = relTime(r.time);
    meta.appendChild(tag); meta.appendChild(time);
    card.appendChild(t); card.appendChild(sub); card.appendChild(meta);
    $kwRelated.appendChild(card);
  }
}
document.querySelectorAll('.chip').forEach(ch => {
  ch.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach(x => x.classList.remove('active'));
    ch.classList.add('active');
    currentTag = ch.getAttribute('data-tag');
    renderNotes();
  });
});
$setRemindersToggle && ($setRemindersToggle.onclick = () => {
  const cur = localStorage.getItem('siku_reminders_enabled') !== 'false';
  localStorage.setItem('siku_reminders_enabled', cur ? 'false' : 'true');
  renderDashboard();
});
$setFrequency && ($setFrequency.onclick = () => {
  const cur = localStorage.getItem('siku_review_frequency') || '7';
  const v = prompt('回顾频率（天）：7/30', cur);
  if (v) { localStorage.setItem('siku_review_frequency', v); renderDashboard(); }
});
$setExportJson && ($setExportJson.onclick = () => {
  const data = { records: store.getAll(), trash: store.getTrash(), files: files.getAll() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'siku-data.json'; a.click();
});
$setClear && ($setClear.onclick = () => {
  if (!confirm('确定清空本地数据？此操作不可恢复')) return;
  localStorage.removeItem('siku_records');
  localStorage.removeItem('siku_files');
  localStorage.removeItem('siku_reports');
  location.reload();
});
$kwRename && ($kwRename.onclick = () => {
  const from = prompt('要重命名的关键词');
  if (!from) return;
  const to = prompt('新的关键词');
  if (!to) return;
  store.mergeKeywords(from, to);
  renderKeywords(to);
});
$kwMerge && ($kwMerge.onclick = () => {
  const from = prompt('要合并的关键词');
  if (!from) return;
  const to = prompt('合并到的关键词');
  if (!to) return;
  store.mergeKeywords(from, to);
  renderKeywords(to);
});
$kwDelete && ($kwDelete.onclick = () => {
  if (kwSelected.size === 0) { alert('请选择要删除的关键词'); return; }
  if (!confirm(`确定删除选中的 ${kwSelected.size} 个关键词？`)) return;
  const list = Array.from(kwSelected);
  for (const k of list) store.deleteKeyword(k);
  addToKWBlacklist(list);
  kwSelected.clear();
  renderKeywords();
});
$searchInput.addEventListener('click', () => {
  $searchInput.focus();
  const val = $searchInput.value;
  $searchInput.setSelectionRange(val.length, val.length);
});
$searchInput.addEventListener('input', () => {
  const val = $searchInput.value.trim();
  query = val;
  if (currentView === 'notes') {
    renderNotes();
  }
  if (val.length === 0) { hint.hide(); return; }
  const combined = [
    ...store.getAll(),
    ...files.getAll()
      .filter(f => (f.contentText || '').trim().length > 0)
      .map(f => ({ id: `db-${f.id}`, text: f.contentText || '', scene: '数据库', time: f.ts, tags: [f.type], name: f.name }))
  ];
  let suggestions = buildSuggestions({ text: val }, combined);
  if (suggestions.length === 0) {
    const han = (val.match(/[\u4e00-\u9fff]/g) || []);
    if (han.length >= 2) {
      const q = han.slice(-2).join('');
      const strong = [];
      for (const r of combined) {
        const rt = (r.text || '') + ' ' + ((r.tags || []).join(' ')) + ' ' + (r.name || '');
        if (rt.includes(q)) {
          strong.push({
            id: r.id,
            title: rt.slice(0, 60),
            score: 1,
            scene: r.scene,
            time: r.time,
            tags: r.tags,
          });
        }
      }
      suggestions = strong.slice(0, 8);
      if (suggestions.length === 0) {
        const q2 = val;
        if (q2.length >= 2) {
          const any = [];
          for (const r of combined) {
            const rt = (r.text || '') + ' ' + ((r.tags || []).join(' ')) + ' ' + (r.name || '');
            if (rt.toLowerCase().includes(q2.toLowerCase())) {
              any.push({
                id: r.id,
                title: rt.slice(0, 60),
                score: 1,
                scene: r.scene,
                time: r.time,
                tags: r.tags,
              });
            }
          }
          suggestions = any.slice(0,8);
        }
      }
    } else {
      const q2 = val;
      if (q2.length >= 2) {
        const any = [];
        for (const r of combined) {
          const rt = (r.text || '') + ' ' + ((r.tags || []).join(' ')) + ' ' + (r.name || '');
          if (rt.toLowerCase().includes(q2.toLowerCase())) {
            any.push({
              id: r.id,
              title: rt.slice(0, 60),
              score: 1,
              scene: r.scene,
              time: r.time,
              tags: r.tags,
            });
          }
        }
        suggestions = any.slice(0,8);
      }
    }
  }
  if (suggestions.length > 0) hint.render(suggestions, { title: '你之前记录过类似内容' });
  else hint.hide();
});
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

// Demo report data (from user request)
const DEMO_REPORT_DATA = {
  decision_records: [
    {
      id: 1,
      scene: "项目迭代",
      question: "迭代排期紧张，是否要先上线风控模块，延后结算模块？",
      conclusion: "优先上线风控，结算延后1周。",
      reason: "风控涉及资金安全，是核心红线；结算开发未完成，强行上线风险更高。",
      suggestion: "先判断安全优先级 > 功能完整性。",
      status: "已解决",
      is_important: true,
      create_time: "2026-02-20 14:30:00"
    },
    {
      id: 2,
      scene: "客户需求处理",
      question: "客户要求增加自定义导出格式，是否接受？",
      conclusion: "暂时不接，先统一导出逻辑。",
      reason: "自定义格式会增加维护成本，当前产品核心是结构化与复用，不是格式兼容。",
      suggestion: "需求必须对齐产品核心定位，不做边缘功能。",
      status: "已解决",
      is_important: true,
      create_time: "2026-02-21 10:15:00"
    },
    {
      id: 3,
      scene: "踩坑总结",
      question: "之前做笔记工具，用户留存低，为什么？",
      conclusion: "只记录不提醒，信息无法长期利用。",
      reason: "用户记完就忘，找不到、想不起、用不上，最后变成闲置工具。",
      suggestion: "所有记录必须支持：自动关联、主动提醒、可生成报告。",
      status: "已解决",
      is_important: true,
      create_time: "2026-02-22 16:40:00"
    },
    {
      id: 4,
      scene: "产品定位",
      question: "产品到底是笔记，还是决策助手？",
      conclusion: "不是笔记，是信息长期利用工具。核心：记录 → 结构化 → 回溯 → 提醒 → 复用。",
      reason: "笔记只解决“存”，不解决“用”；我要解决：信息记下来，能被反复使用。",
      suggestion: "所有功能围绕“长期复用”设计，不做纯记录功能。",
      status: "已解决",
      is_important: true,
      create_time: "2026-02-23 09:25:00"
    }
  ],
  decision_report: {
    title: "决策汇总报告（共4条）",
    statistics: { total: 4, resolved: 4, pending: 0, important: 4 },
    records: [
      {
        scene: "项目迭代类决策",
        question: "迭代排期紧张，是否要先上线风控模块，延后结算模块？",
        conclusion: "优先上线风控，结算延后1周。",
        reason: "风控涉及资金安全，是核心红线；结算开发未完成，强行上线风险更高。"
      },
      {
        scene: "客户需求处理类决策",
        question: "客户要求增加自定义导出格式，是否接受？",
        conclusion: "暂时不接，先统一导出逻辑。",
        reason: "自定义格式会增加维护成本，当前产品核心是结构化与复用。"
      },
      {
        scene: "踩坑总结类决策",
        question: "之前做笔记工具，用户留存低，为什么？",
        conclusion: "只记录不提醒，信息无法长期利用。",
        reason: "用户记完就忘，找不到、想不起、用不上，最后变成闲置工具。"
      },
      {
        scene: "产品定位类决策",
        question: "产品到底是笔记，还是决策助手？",
        conclusion: "不是笔记，是信息长期利用工具。",
        reason: "笔记只解决“存”，不解决“用”；我要解决信息记下来能被反复使用。"
      }
    ],
    auto_summary: {
      frequent_questions: "产品定位、需求取舍、风险优先级、信息如何复用。",
      core_conclusions: ["安全 > 效率", "核心定位 > 边缘需求", "信息必须能被长期复用，而不只是存储。"],
      reusable_experience: "以后再做需求排期、客户沟通、产品定位、功能规划时，系统会自动提醒你今天的思考，避免重复踩坑。"
    },
    value_slogans: [
      "信息不是用来记的，是用来反复用的。",
      "今天的思考，会在你下次决策时自动提醒你。",
      "所有内容自动结构化，可回溯、可关联、可生成报告。",
      "用得越久，你的经验越值钱，越离不开这个工具。"
    ]
  }
};

function ensureDemoReport() {
  try {
    const flag = localStorage.getItem('siku_demo_report_seeded_v1');
    if (!flag) {
      for (const d of DEMO_REPORT_DATA.decision_records) {
        const t = new Date(d.create_time.replace(' ', 'T'));
        const rec = {
          title: d.question,
          text: `${d.conclusion}｜${d.reason}`,
          scene: d.scene,
          question: d.question,
          conclusion: d.conclusion,
          reason: d.reason,
          action: d.suggestion,
          status: d.status,
          important: !!d.is_important,
          time: isNaN(t.getTime()) ? d.create_time : t.toISOString(),
          tags: [d.scene, '决策', '报告']
        };
        store.add(rec);
      }
      localStorage.setItem('siku_demo_report_seeded_v1', 'true');
    }
  } catch {}
  renderDemoReportPage();
}

function renderDemoReportPage() {
  const listEl = document.getElementById('report-list');
  const outEl = document.getElementById('report-output');
  if (!listEl || !outEl) return;
  listEl.innerHTML = '';
  outEl.innerHTML = '';
  // Render records list (from demo records to guarantee字段完整)
  for (const d of DEMO_REPORT_DATA.decision_records) {
    const card = document.createElement('div');
    card.className = 'note-card';
    const title = document.createElement('div'); title.className = 'note-title'; title.textContent = d.question;
    const sub = document.createElement('div'); sub.className = 'note-sub'; sub.textContent = `结论：${d.conclusion}`;
    const meta = document.createElement('div'); meta.className = 'note-meta';
    const tag = document.createElement('span'); tag.className = 'tag'; tag.textContent = d.scene;
    const time = document.createElement('span'); time.className = 'time'; time.textContent = d.create_time;
    meta.appendChild(tag); meta.appendChild(time);
    card.appendChild(title); card.appendChild(sub); card.appendChild(meta);
    listEl.appendChild(card);
  }
  // Render report content
  const head = document.createElement('div');
  head.className = 'note-card';
  const t = document.createElement('div'); t.className = 'note-title'; t.textContent = DEMO_REPORT_DATA.decision_report.title;
  const s = DEMO_REPORT_DATA.decision_report.statistics;
  const sub = document.createElement('div'); sub.className = 'note-sub'; sub.innerHTML = `统计：共 <b style="color:#6366f1">${s.total}</b> 条；已解决 <b style="color:#36D399">${s.resolved}</b>；待处理 <b style="color:#FF9F43">${s.pending}</b>；重要 <b style="color:#6366f1">${s.important}</b>`;
  head.appendChild(t); head.appendChild(sub);
  outEl.appendChild(head);
  for (const r of DEMO_REPORT_DATA.decision_report.records) {
    const card = document.createElement('div');
    card.className = 'note-card';
    const q = document.createElement('div'); q.className = 'note-title question'; q.textContent = `问题：${r.question}`;
    const c = document.createElement('div'); c.className = 'note-sub'; c.textContent = `结论：${r.conclusion}`;
    const e = document.createElement('div'); e.className = 'note-sub'; e.textContent = `依据：${r.reason}`;
    const sc = document.createElement('div'); sc.className = 'note-meta'; sc.textContent = `场景：${r.scene}`;
    card.appendChild(q); card.appendChild(c); card.appendChild(e); card.appendChild(sc);
    outEl.appendChild(card);
  }
  const summary = DEMO_REPORT_DATA.decision_report.auto_summary;
  const sumCard = document.createElement('div'); sumCard.className = 'note-card';
  const st = document.createElement('div'); st.className = 'note-title'; st.textContent = '系统自动总结';
  const q1 = document.createElement('div'); q1.className = 'note-sub'; q1.textContent = `你最常遇到的决策问题：${summary.frequent_questions}`;
  const q2 = document.createElement('div'); q2.className = 'note-sub'; q2.textContent = `你反复得出的核心结论：${summary.core_conclusions.join('、')}`;
  const q3 = document.createElement('div'); q3.className = 'note-sub'; q3.textContent = `你当前可复用的经验：${summary.reusable_experience}`;
  sumCard.appendChild(st); sumCard.appendChild(q1); sumCard.appendChild(q2); sumCard.appendChild(q3);
  outEl.appendChild(sumCard);
  const slogans = DEMO_REPORT_DATA.decision_report.value_slogans || [];
  if (slogans.length) {
    const val = document.createElement('div');
    val.className = 'note-card';
    const vtitle = document.createElement('div'); vtitle.className = 'note-title'; vtitle.textContent = '价值标语';
    val.appendChild(vtitle);
    slogans.forEach(x => { const li = document.createElement('div'); li.className='note-sub'; li.textContent = `- ${x}`; val.appendChild(li); });
    outEl.appendChild(val);
  }
}

// Initialize view after demo constants are defined
if (location.hash) syncViewFromHash(); else setView('dashboard');

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

window.addEventListener('hint:navigate-record', (e) => {
  const id = e.detail.id;
  pendingDraft = $composeText ? $composeText.value : '';
  if (id.startsWith('db-')) {
    const realId = id.slice(3);
    setView('database');
    renderDatabase();
    const el = document.querySelector(`#view-database .note-card[data-id="${realId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('selected');
    }
  } else {
    const r = store.getById(id);
    setView('history');
    renderHistory();
    const el = document.querySelector(`#view-history .note-card[data-id="${id}"]`);
    if (el) {
      document.querySelectorAll('.note-card').forEach(x => x.classList.remove('selected'));
      el.classList.add('selected');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
  let overlay = document.getElementById('btn-return-compose');
  if (!overlay) {
    overlay = document.createElement('button');
    overlay.id = 'btn-return-compose';
    overlay.className = 'return-overlay';
    overlay.textContent = '返回继续编辑';
    overlay.addEventListener('click', () => {
      setView('compose');
      if ($composeText && pendingDraft != null) {
        $composeText.value = pendingDraft;
        $composeText.dispatchEvent(new Event('input'));
      }
      pendingDraft = null;
      overlay.remove();
    });
    document.body.appendChild(overlay);
  }
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
