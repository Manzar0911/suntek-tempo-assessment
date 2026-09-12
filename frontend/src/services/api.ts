const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

type SuccessEnvelope<T> = { success: true; data: T };
type ErrorEnvelope = { success: false; error: { message: string; code: string } };
type Envelope<T> = SuccessEnvelope<T> | ErrorEnvelope;

function isSuccessEnvelope<T>(value: unknown): value is SuccessEnvelope<T> {
  return typeof value === 'object' && value !== null &&
    (value as { success?: unknown }).success === true && 'data' in value;
}

function errorMessage(value: unknown, status: number) {
  if (typeof value === 'object' && value !== null &&
      (value as { success?: unknown }).success === false) {
    const error = (value as Partial<ErrorEnvelope>).error;
    if (typeof error?.message === 'string') return error.message;
  }
  return `Request failed (${status})`;
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const body = await response.json().catch(() => null) as Envelope<T> | null;
  if (!response.ok || !isSuccessEnvelope<T>(body)) throw new Error(errorMessage(body, response.status));
  return body.data;
}
