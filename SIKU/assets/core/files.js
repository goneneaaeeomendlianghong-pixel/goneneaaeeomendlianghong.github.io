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
  addFile({ name, type, size, contentText, blobUrl }) {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const rec = { id, name, type, size, contentText, blobUrl, ts: Date.now() };
    this.files.push(rec);
    this._save();
    return rec;
  }
  getAll() {
    return [...this.files].sort((a, b) => b.ts - a.ts);
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
