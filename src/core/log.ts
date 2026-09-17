// In-memory ring buffer of the last log lines, read by the debug overlay
// (docs/PIANO.md §4.6 — 5 taps on the version number in the panel) since
// there's no Web Inspector on iOS Safari for a userscript.

export interface LogEntry {
  time: number;
  level: 'info' | 'warn' | 'error';
  message: string;
}

const MAX_ENTRIES = 50;
const buffer: LogEntry[] = [];

function push(level: LogEntry['level'], message: string): void {
  buffer.push({ time: Date.now(), level, message });
  if (buffer.length > MAX_ENTRIES) {
    buffer.shift();
  }
}

export const log = {
  info: (message: string): void => push('info', message),
  warn: (message: string): void => push('warn', message),
  error: (message: string): void => push('error', message),
};

export function getLogEntries(): readonly LogEntry[] {
  return buffer;
}

export function clearLog(): void {
  buffer.length = 0;
}
