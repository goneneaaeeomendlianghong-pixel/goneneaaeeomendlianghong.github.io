export class Modal {
  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'modal';
    this.el.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-body">
        <div class="modal-title">新建笔记</div>
        <div class="modal-content">
          <div class="chips">
            <button class="chip active" data-tag="想法">想法</button>
            <button class="chip" data-tag="会议">会议</button>
            <button class="chip" data-tag="待办">待办</button>
            <button class="chip" data-tag="决策">决策</button>
          </div>
          <textarea class="modal-text" placeholder="输入内容…"></textarea>
          <div class="row">
            <input class="modal-files" type="file" multiple />
            <button class="secondary modal-record">录音</button>
          </div>
        </div>
        <div class="modal-actions">
          <button class="secondary modal-cancel">取消</button>
          <button class="primary modal-save">保存</button>
        </div>
      </div>
    `;
    document.body.appendChild(this.el);
    this.tag = '想法';
    this.textEl = this.el.querySelector('.modal-text');
    this.filesEl = this.el.querySelector('.modal-files');
    this.recordBtn = this.el.querySelector('.modal-record');
    this.saveBtn = this.el.querySelector('.modal-save');
    this.cancelBtn = this.el.querySelector('.modal-cancel');
    this.mediaRecorder = null;
    this.chunks = [];
    this.el.querySelectorAll('.chips .chip').forEach(ch => {
      ch.addEventListener('click', () => {
        this.el.querySelectorAll('.chips .chip').forEach(x => x.classList.remove('active'));
        ch.classList.add('active');
        this.tag = ch.getAttribute('data-tag');
      });
    });
    this.cancelBtn.addEventListener('click', () => this.hide());
  }
  async toggleRecord() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
      this.recordBtn.textContent = '录音';
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.chunks = [];
      this.mediaRecorder.ondataavailable = e => this.chunks.push(e.data);
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'audio/webm' });
        const ev = new CustomEvent('modal:recorded', { detail: { blob } });
        window.dispatchEvent(ev);
      };
      this.mediaRecorder.start();
      this.recordBtn.textContent = '停止';
    } catch (e) {
      console.warn('录音不可用', e);
    }
  }
  onSave(handler) {
    this.saveBtn.addEventListener('click', () => {
      const files = Array.from(this.filesEl.files || []);
      handler({ tag: this.tag, text: this.textEl.value.trim(), files });
      this.hide();
    });
    this.recordBtn.addEventListener('click', () => this.toggleRecord());
  }
  show() { this.el.style.display = 'block'; }
  hide() { this.el.style.display = 'none'; }
}
