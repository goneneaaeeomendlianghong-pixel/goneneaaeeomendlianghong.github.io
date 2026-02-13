export class FileStore {
  constructor() {
    this.key = 'siku_files';
    this.files = this._load();
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
    localStorage.setItem(this.key, JSON.stringify(this.files));
  }
  addFile({ name, type, size, contentText = '', blobUrl = '', dataUrl = '' }) {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const rec = { id, name, type, size, contentText, blobUrl, dataUrl, ts: Date.now(), deleted: false, deletedAt: null };
    this.files.push(rec);
    this._save();
    return rec;
  }
  updateFile(id, patch = {}) {
    const i = this.files.findIndex(x => x.id === id);
    if (i >= 0) {
      this.files[i] = { ...this.files[i], ...patch };
      this._save();
      return this.files[i];
    }
    return null;
  }
  getAll() {
    return this.files.filter(f => !f.deleted).slice().sort((a, b) => b.ts - a.ts);
  }
  getTrash() {
    return this.files.filter(f => f.deleted).slice().sort((a, b) => (b.deletedAt||0) - (a.deletedAt||0));
  }
  trashById(id) {
    const f = this.files.find(x => x.id === id);
    if (f && !f.deleted) {
      f.deleted = true;
      f.deletedAt = Date.now();
      this._save();
    }
  }
  restoreById(id) {
    const f = this.files.find(x => x.id === id);
    if (f && f.deleted) {
      f.deleted = false;
      f.deletedAt = null;
      this._save();
    }
  }
  purgeById(id) {
    const idx = this.files.findIndex(x => x.id === id);
    if (idx >= 0) {
      this.files.splice(idx, 1);
      this._save();
    }
  }
  emptyTrash() {
    this.files = this.files.filter(x => !x.deleted);
    this._save();
  }
}

export async function readFileAsText(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => resolve('');
    reader.readAsText(file);
  });
}

export async function readFileAsDataURL(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}
