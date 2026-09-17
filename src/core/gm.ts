// Only entry point for GM.* storage access (see CLAUDE.md).
// Falls back to localStorage when GM is not injected (unit tests, harness).

function hasGM(): boolean {
  return typeof GM !== 'undefined' && typeof GM.getValue === 'function';
}

export async function getValue<T>(key: string, defaultValue: T): Promise<T> {
  if (hasGM()) {
    return GM.getValue<T>(key, defaultValue);
  }
  const raw = localStorage.getItem(key);
  if (raw === null) return defaultValue;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

export async function setValue(key: string, value: unknown): Promise<void> {
  if (hasGM()) {
    return GM.setValue(key, value);
  }
  localStorage.setItem(key, JSON.stringify(value));
}

export async function deleteValue(key: string): Promise<void> {
  if (hasGM()) {
    return GM.deleteValue(key);
  }
  localStorage.removeItem(key);
}

export async function listValues(): Promise<string[]> {
  if (hasGM()) {
    return GM.listValues();
  }
  return Object.keys(localStorage);
}
