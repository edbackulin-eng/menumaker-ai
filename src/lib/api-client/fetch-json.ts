import { ApiClientError } from "@/lib/api-client/api-client-error";

interface ErrorEnvelope {
  error: { code: string; message: string; details?: Record<string, string[]> };
}

/** Shared request/response handling for every api-client wrapper — parses the `{ data }`/`{ error }` envelope. */
export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const json = await response.json();

  if (!response.ok) {
    const { error } = json as ErrorEnvelope;
    throw new ApiClientError(
      error?.code ?? "unknown_error",
      error?.message ?? "Сталася помилка запиту.",
      response.status,
      error?.details,
    );
  }

  return (json as { data: T }).data;
}
