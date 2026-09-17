// "Ritorno silenzioso" (docs/PIANO.md §4.1): a per-tab stack of allowed
// URLs, so a blocked route can bounce back to the last allowed one instead
// of showing any warning. Platform-specific route classification (what's
// "allowed") lives in platforms/*/routes.ts; this module only tracks the
// stack and picks back()/replace().

const STACK_KEY = 'smd:v1:navstack';
const MAX_STACK = 50;

function readStack(): string[] {
  try {
    const raw = sessionStorage.getItem(STACK_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeStack(stack: string[]): void {
  sessionStorage.setItem(STACK_KEY, JSON.stringify(stack.slice(-MAX_STACK)));
}

/** Records `url` as an allowed page reached in this tab. Idempotent for
 * consecutive duplicates (e.g. repeated SPA re-renders of the same route). */
export function pushAllowed(url: string): void {
  const stack = readStack();
  if (stack[stack.length - 1] !== url) {
    stack.push(url);
    writeStack(stack);
  }
}

export function getStack(): readonly string[] {
  return readStack();
}

export function resetStack(): void {
  sessionStorage.removeItem(STACK_KEY);
}

export interface NavigateActions {
  back(): void;
  replace(url: string): void;
}

const defaultNavigate: NavigateActions = {
  back: () => history.back(),
  replace: (url) => location.replace(url),
};

/** Called on a blocked route: goes back to the last allowed URL we recorded
 * for this tab, or replaces the current page with `fallbackUrl` if we have
 * none (fresh tab, direct/deep link). Does not itself push anything onto
 * the stack — the caller should only push URLs it has classified as
 * allowed. */
export function returnSilently(fallbackUrl: string, navigate: NavigateActions = defaultNavigate): void {
  const stack = readStack();
  const lastAllowed = stack[stack.length - 1];
  if (lastAllowed) {
    navigate.back();
  } else {
    navigate.replace(fallbackUrl);
  }
}
