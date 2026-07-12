import Link from "next/link";

export interface AdminPaginationProps {
  page: number;
  limit: number;
  total: number;
  /** Base path + existing query params (minus `page`) to append `?page=N` to. */
  buildHref: (page: number) => string;
}

export function AdminPagination({ page, limit, total, buildHref }: AdminPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="mt-6 flex items-center justify-center gap-2" aria-label="Пагінація">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
        <Link
          key={pageNumber}
          href={buildHref(pageNumber)}
          className={
            pageNumber === page
              ? "bg-accent-400 flex size-9 items-center justify-center rounded-md text-white"
              : "border-border hover:bg-surface-secondary flex size-9 items-center justify-center rounded-md border"
          }
          aria-current={pageNumber === page ? "page" : undefined}
        >
          {pageNumber}
        </Link>
      ))}
    </nav>
  );
}
