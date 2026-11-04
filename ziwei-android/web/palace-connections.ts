type Rect = Pick<DOMRectReadOnly, 'left' | 'right' | 'top' | 'bottom'>;

export function palaceConnectionEdges(branch: number): [number, number][] {
  if (!Number.isInteger(branch) || branch < 0 || branch > 11) throw new Error('宫位必须在0至11之间');
  const first = (branch + 4) % 12, second = (branch + 8) % 12;
  return [[branch, first], [first, second], [second, branch], [branch, (branch + 6) % 12]];
}

export function palaceAnchor(palace: Rect, center: Rect): [number, number] {
  return [
    palace.right <= center.left ? palace.right : palace.left >= center.right ? palace.left : (palace.left + palace.right) / 2,
    palace.bottom <= center.top ? palace.bottom : palace.top >= center.bottom ? palace.top : (palace.top + palace.bottom) / 2,
  ];
}

export function mountPalaceConnections(grid: HTMLElement | null, selected: number | null): () => void {
  if (!grid || selected === null) return () => {};
  const edges = palaceConnectionEdges(selected);
  const center = grid.querySelector<HTMLElement>('.chart-center');
  const palaces = new Map(Array.from(grid.querySelectorAll<HTMLElement>('[data-palace]'), palace => [Number(palace.dataset.palace), palace]));
  if (!center || edges.some(pair => pair.some(branch => !palaces.has(branch)))) return () => {};
  const namespace = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(namespace, 'svg');
  svg.setAttribute('class', 'palace-connections');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const lines = edges.map(() => {
    const line = document.createElementNS(namespace, 'line');
    svg.appendChild(line);
    return line;
  });
  grid.appendChild(svg);
  let frame = 0, disposed = false;
  const draw = () => {
    frame = 0;
    const bounds = svg.getBoundingClientRect(), centerBounds = center.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    svg.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
    edges.forEach(([from, to], i) => {
      const [x1, y1] = palaceAnchor(palaces.get(from)!.getBoundingClientRect(), centerBounds);
      const [x2, y2] = palaceAnchor(palaces.get(to)!.getBoundingClientRect(), centerBounds);
      lines[i].setAttribute('x1', String(x1 - bounds.left));
      lines[i].setAttribute('y1', String(y1 - bounds.top));
      lines[i].setAttribute('x2', String(x2 - bounds.left));
      lines[i].setAttribute('y2', String(y2 - bounds.top));
    });
  };
  const schedule = () => { if (!disposed && !frame) frame = window.requestAnimationFrame(draw); };
  const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule);
  observer?.observe(grid);
  observer?.observe(center);
  palaces.forEach(palace => observer?.observe(palace));
  // Older WebViews redraw after app renders, viewport changes and initial font loading.
  window.addEventListener('resize', schedule);
  document.fonts?.ready.then(schedule);
  draw();
  return () => {
    disposed = true;
    window.cancelAnimationFrame(frame);
    observer?.disconnect();
    window.removeEventListener('resize', schedule);
    svg.remove();
  };
}
