/**
 * Thin client-side fetch helpers used by the Redux async thunks to call the
 * REST API routes under `src/app/api/**`. This is the only place that talks
 * to the network from the client; components dispatch thunks, thunks call
 * these helpers, and the route handlers use the server services.
 */

async function handle<T>(res: Response): Promise<T> {
  let body: any = null;
  try {
    body = await res.json();
  } catch {
    /* no body */
  }
  if (!res.ok) {
    const message = body?.error || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return body as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  return handle<T>(res);
}

export async function apiPost<T>(path: string, payload?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload ?? {}),
  });
  return handle<T>(res);
}

export async function apiPatch<T>(path: string, payload?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload ?? {}),
  });
  return handle<T>(res);
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(path, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  return handle<T>(res);
}
