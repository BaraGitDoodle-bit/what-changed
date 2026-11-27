import type { InitResponse, PingResponse, TapResponse } from '../shared/types';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    credentials: 'same-origin',
  });

  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    throw new ApiError(response.status, String(data.error ?? 'request-failed'));
  }
  return data as T;
}

export const api = {
  init: () => request<InitResponse>('/api/init'),
  start: () => request<{ ok: boolean; startedAt: number }>('/api/start', { method: 'POST' }),
  tap: (x: number, y: number) =>
    request<TapResponse>('/api/tap', { method: 'POST', body: JSON.stringify({ x, y }) }),
  ping: () => request<PingResponse>('/api/ping', { method: 'POST' }),
  practice: () =>
    request<{ ok: boolean; practice: boolean; alreadyScored: boolean }>('/api/practice', {
      method: 'POST',
    }),
  share: () =>
    request<{ ok: boolean; already: boolean; permalink: string; text: string }>('/api/share', {
      method: 'POST',
    }),
};
