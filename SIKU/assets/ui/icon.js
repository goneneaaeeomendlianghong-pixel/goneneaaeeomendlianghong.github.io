export function icon(name, size = 16) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.style.verticalAlign = 'middle';
  svg.style.marginRight = '6px';
  const path = document.createElementNS(ns, 'path');
  path.setAttribute('fill', 'currentColor');
  const map = {
    image: 'M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-8 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm9 10H5l5-6 3.5 4.2L16 14l4 5z',
    customer: 'M12 12a5 5 0 1 0-0.001-10A5 5 0 0 0 12 12zm0 2c-5.33 0-8 2.67-8 6v2h16v-2c0-3.33-2.67-6-8-6z',
    project: 'M3 7h18v12H3V7zm2-4h14v3H5V3zm3 6h8v2H8V9zm0 4h10v2H8v-2z',
    meeting: 'M4 5h16v10H4V5zm2 12h12v2H6v-2zM7 7h10v2H7V7z',
    travel: 'M2 12l20 0-3 3H5l-3-3zm6-6h8l1 3H7l1-3z',
    life: 'M12 21s-7-4.35-7-10a7 7 0 0 1 14 0c0 5.65-7 10-7 10z',
    work: 'M4 8h16v10H4V8zm5-4h6l2 3H7l2-3z',
    save: 'M5 3h10l4 4v14H5V3zm7 2H7v4h5V5z',
    open: 'M4 4h12v2H6v12H4V4zm6 6h10v10H10V10z',
    clock: 'M12 2a10 10 0 1 0 0.001 20A10 10 0 0 0 12 2zm1 5h-2v6l5 3 1-1-4-2V7z',
    report: 'M5 3h10l4 4v14H5V3zm3 6h8v2H8V9zm0 4h8v2H8v-2z',
    bulb: 'M9 21h6v-2H9v2zm3-19a7 7 0 0 0-7 7c0 2.53 1.34 4.73 3.36 5.94L8 17h8l-0.36-2.06A6.96 6.96 0 0 0 19 9a7 7 0 0 0-7-7z',
    paperclip: 'M7 7a5 5 0 0 1 8.66-3.54l4.24 4.24a5 5 0 0 1-7.07 7.07L8.83 10.99',
    mic: 'M12 14a4 4 0 0 0 4-4V6a4 4 0 0 0-8 0v4a4 4 0 0 0 4 4zm-6-4h2a6 6 0 0 0 12 0h2a8 8 0 0 1-16 0z'
  };
  path.setAttribute('d', map[name] || 'M4 4h16v16H4z');
  svg.appendChild(path);
  return svg;
}
