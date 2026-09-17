// Ambient types for the Stay for Safari / GM.* async API (Tampermonkey-compatible).
// @grant GM.getValue, GM.setValue, GM.deleteValue, GM.listValues, GM.xmlHttpRequest

interface GMXhrDetails {
  method?: 'GET' | 'POST' | 'HEAD';
  url: string;
  headers?: Record<string, string>;
  data?: string;
  onload?: (response: GMXhrResponse) => void;
  onerror?: (error: unknown) => void;
  ontimeout?: () => void;
  timeout?: number;
}

interface GMXhrResponse {
  status: number;
  statusText: string;
  responseText: string;
  finalUrl: string;
}

interface GMApi {
  getValue<T = unknown>(key: string, defaultValue?: T): Promise<T>;
  setValue(key: string, value: unknown): Promise<void>;
  deleteValue(key: string): Promise<void>;
  listValues(): Promise<string[]>;
  xmlHttpRequest(details: GMXhrDetails): void;
}

declare const GM: GMApi;
