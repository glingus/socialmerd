// 7-day bar chart (docs/PIANO.md §4.6). The scaling math is split out as a
// pure function so it's unit-testable without a DOM; renderBars is a thin
// DOM wrapper around it.

export interface BarValue {
  label: string;
  value: number;
}

export interface BarHeight extends BarValue {
  heightPercent: number;
}

/** Scales every value to a 0-100 percent height, relative to the max in the
 * set. An all-zero set (no usage this week) gets 0% for every bar instead
 * of dividing by zero. */
export function computeBarHeights(values: readonly BarValue[]): BarHeight[] {
  const max = Math.max(0, ...values.map((v) => v.value));
  return values.map((v) => ({ ...v, heightPercent: max === 0 ? 0 : Math.round((v.value / max) * 100) }));
}

export function renderBars(values: readonly BarValue[], unitLabel: (value: number) => string): HTMLElement {
  const container = document.createElement('div');
  container.className = 'smd-bars';

  for (const bar of computeBarHeights(values)) {
    const col = document.createElement('div');
    col.className = 'smd-bars-col';
    col.setAttribute('role', 'img');
    col.setAttribute('aria-label', `${bar.label}: ${unitLabel(bar.value)}`);

    const track = document.createElement('div');
    track.className = 'smd-bars-track';
    const fill = document.createElement('div');
    fill.className = 'smd-bars-fill';
    fill.style.height = `${bar.heightPercent}%`;
    track.appendChild(fill);

    const label = document.createElement('span');
    label.className = 'smd-bars-label';
    label.textContent = bar.label;

    col.append(track, label);
    container.appendChild(col);
  }

  return container;
}
