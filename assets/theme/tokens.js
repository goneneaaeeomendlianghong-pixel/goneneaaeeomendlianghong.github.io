export const defaultTokens = {
  bg: '#0f1216',
  panel: '#141821',
  text: '#e6edf3',
  muted: '#9aa4b2',
  border: '#2a3140',
  accent: '#4f9cff',
  accent2: '#7ad3a8'
};

export function setTheme(tokens = {}) {
  const t = { ...defaultTokens, ...tokens };
  const root = document.documentElement;
  Object.entries(t).forEach(([k, v]) => root.style.setProperty(`--${k}`, v));
}

export function getTheme() {
  const root = getComputedStyle(document.documentElement);
  const out = {};
  Object.keys(defaultTokens).forEach(k => out[k] = root.getPropertyValue(`--${k}`).trim());
  return out;
}
