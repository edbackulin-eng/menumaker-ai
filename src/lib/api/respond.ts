import { NextResponse } from "next/server";

/** Wraps a payload in the standard `{ data }` envelope (see docs/api-conventions.md). */
export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export interface PaginatedData<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

export function apiPaginated<T>(items: T[], page: number, limit: number, total: number) {
  return apiSuccess<PaginatedData<T>>({ items, page, limit, total });
}

/** For DELETE endpoints — a 204 must not carry a response body. */
export function apiNoContent() {
  return new NextResponse(null, { status: 204 });
}
