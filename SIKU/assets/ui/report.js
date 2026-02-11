export class ReportView {
  constructor(panelEl) {
    this.el = panelEl;
  }
  export(report, format = 'csv') {
    const rows = [];
    for (const sec of report.sections) {
      rows.push([`[${sec.title}]`]);
      for (const it of (sec.items || [])) {
        const timeStr = it.time ? new Date(it.time).toLocaleString() : '未设时间';
        rows.push([it.text, it.scene, timeStr, (it.tags||[]).join('|')]);
      }
    }
    const download = (blob, filename) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename; a.click();
      setTimeout(()=> URL.revokeObjectURL(url), 1000);
    };
    if (format === 'csv' || format === 'xlsx') {
      const csv = rows.map(r => r.map(x => `"${String(x).replace(/"/g,'""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      download(blob, `report.${format==='xlsx'?'csv':'csv'}`);
    } else if (format === 'jpg') {
      const width = 1000;
      const height = Math.max(600, rows.length * 24 + 80);
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,width,height);
      ctx.fillStyle = '#000000'; ctx.font = '14px "PingFang SC","Microsoft YaHei",sans-serif';
      let y = 40;
      ctx.fillText('思库 · 自动生成报告（摘要）', 40, y); y += 30;
      for (const r of rows) {
        const line = r.join('  ');
        ctx.fillText(line.slice(0, 120), 40, y); y += 22;
      }
      canvas.toBlob((blob) => { if (blob) download(blob, 'report.jpg'); }, 'image/jpeg', 0.92);
    } else if (format === 'pdf') {
      window.print();
    } else if (format === 'doc' || format === 'ppt') {
      const html = '<html><head><meta charset="utf-8"></head><body><pre>' + rows.map(r=>r.join('  ')).join('\n') + '</pre></body></html>';
      const blob = new Blob([html], { type: 'application/msword' });
      download(blob, `report.${format}`);
    }
  }
  render(report) {
    this.el.innerHTML = '';
    const tools = document.createElement('div');
    tools.className = 'report-actions';
    const select = document.createElement('select');
    select.innerHTML = '<option value="csv">CSV</option><option value="xlsx">XLSX</option><option value="jpg">JPG</option><option value="pdf">PDF(打印)</option><option value="doc">DOC</option><option value="ppt">PPT</option>';
    const btn = document.createElement('button');
    btn.className = 'create-btn';
    btn.style.height = '32px';
    btn.textContent = '导出';
    btn.addEventListener('click', () => this.export(report, select.value));
    tools.appendChild(select);
    tools.appendChild(btn);
    this.el.appendChild(tools);
    for (const sec of report.sections) {
      const sEl = document.createElement('div');
      sEl.className = 'report-section';
      const title = document.createElement('div');
      title.className = 'report-title';
      title.textContent = sec.title;
      const items = document.createElement('div');
      items.className = 'report-items';
      if (!sec.items || sec.items.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'report-meta';
        empty.textContent = '暂无数据（基于真实记录生成，不凭空编造）';
        items.appendChild(empty);
      } else {
        for (const it of sec.items) {
          const item = document.createElement('div');
          item.className = 'report-item';
          const titleLine = document.createElement('div');
          titleLine.textContent = it.text.slice(0, 120);
          const meta = document.createElement('div');
          meta.className = 'report-meta';
          const timeStr = it.time ? new Date(it.time).toLocaleString() : '未设时间';
          const tagsStr = (it.tags || []).map(t => `#${t}`).join(' ');
          meta.textContent = `场景：${it.scene} · 时间：${timeStr} · 标签：${tagsStr}`;
          const actions = document.createElement('div');
          actions.className = 'report-actions';
          if (it.note) {
            const label = document.createElement('span');
            label.className = 'label';
            label.textContent = it.note;
            actions.appendChild(label);
          }
          const link = document.createElement('button');
          link.className = 'link';
          link.textContent = '回溯原始记录';
          link.addEventListener('click', () => {
            const ev = new CustomEvent('report:show-record', { detail: { id: it.id } });
            window.dispatchEvent(ev);
          });
          actions.appendChild(link);
          item.appendChild(titleLine);
          item.appendChild(meta);
          item.appendChild(actions);
          items.appendChild(item);
        }
      }
      sEl.appendChild(title);
      sEl.appendChild(items);
      this.el.appendChild(sEl);
    }
  }
}
