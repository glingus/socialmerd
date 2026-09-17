// The single MutationObserver for the whole script (docs/PIANO.md §3.4):
// every feature registers an idempotent processor instead of creating its
// own observer. Batches are throttled via rAF (falling back to a 100ms
// timer) so a burst of DOM mutations triggers one pass, not one per node.

export type Processor = (root: ParentNode) => void;

const processors = new Set<Processor>();
let observer: MutationObserver | null = null;
let scheduled = false;

// Per-marker hit counts, fed by markProcessed. Free byproduct of the
// existing idempotency marker: the debug overlay (docs/PIANO.md §4.6,
// "contatori dei selettori trovati") reads this instead of every feature
// having to instrument its own selectors.
const markerCounts = new Map<string, number>();

function runProcessors(): void {
  scheduled = false;
  for (const processor of processors) {
    try {
      processor(document.documentElement);
    } catch (error) {
      console.error('[socialmerd] dom-scheduler processor failed', error);
    }
  }
}

function schedule(): void {
  if (scheduled) return;
  scheduled = true;
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(runProcessors);
  } else {
    setTimeout(runProcessors, 100);
  }
}

function ensureObserver(): void {
  if (observer) return;
  observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

/** Registers a processor, runs it once immediately for the current DOM
 * state, and returns an unsubscribe function. The shared observer is torn
 * down once the last processor unregisters. */
export function registerProcessor(processor: Processor): () => void {
  processors.add(processor);
  ensureObserver();
  schedule();
  return () => {
    processors.delete(processor);
    if (processors.size === 0 && observer) {
      observer.disconnect();
      observer = null;
    }
  };
}

/** Idempotency helper: marks `el` with `data-smd-<marker>` and returns
 * whether it was newly marked (false if a processor already handled it). */
export function markProcessed(el: Element, marker: string): boolean {
  const attr = `data-smd-${marker}`;
  if (el.hasAttribute(attr)) return false;
  el.setAttribute(attr, '');
  markerCounts.set(marker, (markerCounts.get(marker) ?? 0) + 1);
  return true;
}

/** Read-only snapshot of how many elements each marker has matched since
 * the last reset, for the debug overlay. */
export function getMarkerCounts(): ReadonlyMap<string, number> {
  return new Map(markerCounts);
}

/** Test-only: clears all module state (processors, observer, throttle
 * flag) so tests don't leak into each other. Not used by production code. */
export function _resetForTests(): void {
  processors.clear();
  observer?.disconnect();
  observer = null;
  scheduled = false;
  markerCounts.clear();
}
