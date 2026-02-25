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
    const hay = `${r.text} ${(r.tags||[]).join(' ')}`.toLowerCase();
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
  const delBtn = document.createElement('button');
  delBtn.className = 'chip';
  delBtn.textContent = '删除';
  delBtn.addEventListener('click', () => {
    files.trashById(f.id);
    renderDatabase();
    setView('trash');
  });
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
  title.textContent = r.text ? r.text.slice(0, 120) : '未命名笔记';
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
  const content = document.createElement('div');
  content.className = 'preview-text';
  content.textContent = r.text || '';
  const actions = document.createElement('div');
  actions.style.marginTop = '8px';
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
  body.appendChild(actions);
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
  document.querySelectorAll('.sidebar .nav-item').forEach(it => it.classList.toggle('active', it.getAttribute('data-view') === view));
  if (view === 'notes') renderNotes();
  if (view === 'history') { renderHistory(); renderTimeline(); renderInsights(); renderChains(); }
  if (view === 'database') renderDatabase();
  if (view === 'files') renderFiles();
  if (view === 'trash') renderTrash();
  if (view !== 'compose') { hint.hide(); }
}
setView('history');

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
