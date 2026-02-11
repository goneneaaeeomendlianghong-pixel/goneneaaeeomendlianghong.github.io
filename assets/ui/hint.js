export class HintPanel {
  constructor(root, listEl) {
    this.root = root;
    this.listEl = listEl;
    this.titleEl = root.querySelector('.hint-header');
  }
  show() {
    this.root.style.display = '';
  }
  hide() {
    this.root.style.display = 'none';
    this.listEl.innerHTML = '';
  }
  render(suggestions, { title } = {}) {
    if (title) this.titleEl.textContent = title;
    if (!suggestions || suggestions.length === 0) {
      this.hide();
      return;
    }
    this.show();
    this.listEl.innerHTML = '';
    for (const s of suggestions) {
      const item = document.createElement('div');
      item.className = 'hint-item';
      item.dataset.id = s.id;
      const title = document.createElement('div');
      title.className = 'hint-title';
      title.textContent = s.title;
      const meta = document.createElement('div');
      meta.className = 'hint-meta';
      const timeStr = s.time ? new Date(s.time).toLocaleString() : '未设时间';
      meta.textContent = `场景：${s.scene} · 时间：${timeStr} · 标签：${(s.tags||[]).join('、')}`;
      item.appendChild(title);
      item.appendChild(meta);
      item.addEventListener('click', () => {
        const ev = new CustomEvent('hint:open-record', { detail: { id: s.id } });
        window.dispatchEvent(ev);
      });
      this.listEl.appendChild(item);
    }
  }
  renderEmpty(text = '暂无提示') {
    this.hide();
  }
}
