/** Client-side mirror of the server's `{ error }` envelope (see docs/api-conventions.md). */
export class ApiClientError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}
