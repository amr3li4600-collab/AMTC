"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useTransition } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
}

export function Pagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { isFrench } = useLanguage();

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const startRecord = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalCount);

  // Generate pagination page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      if (start > 2) {
        pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  if (totalCount === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2">
      {/* Information text */}
      <div className="text-xs text-slate-500 dark:text-cockpit-muted font-medium">
        {isFrench ? (
          <>
            Affichage de <span className="font-bold text-amtc-navy dark:text-white">{startRecord}</span> à{" "}
            <span className="font-bold text-amtc-navy dark:text-white">{endRecord}</span> sur{" "}
            <span className="font-bold text-amtc-navy dark:text-white">{totalCount}</span> alertes de documents
          </>
        ) : (
          <>
            Showing <span className="font-bold text-amtc-navy dark:text-white">{startRecord}</span> to{" "}
            <span className="font-bold text-amtc-navy dark:text-white">{endRecord}</span> of{" "}
            <span className="font-bold text-amtc-navy dark:text-white">{totalCount}</span> document alerts
          </>
        )}
      </div>

      {/* Page Navigation Controls */}
      <div className="flex items-center gap-1.5">
        {/* First Page */}
        <button
          type="button"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1 || isPending}
          className="p-2 rounded-lg border border-slate-200 dark:border-cockpit-border bg-white dark:bg-cockpit-surface text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-cockpit-hover hover:text-amtc-navy dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs dark:shadow-none"
          title={isFrench ? "Première page" : "First page"}
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>

        {/* Prev Page */}
        <button
          type="button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || isPending}
          className="p-2 rounded-lg border border-slate-200 dark:border-cockpit-border bg-white dark:bg-cockpit-surface text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-cockpit-hover hover:text-amtc-navy dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs dark:shadow-none"
          title={isFrench ? "Page précédente" : "Previous page"}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Numeric Page Buttons */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, idx) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-1 text-xs text-slate-400 dark:text-cockpit-muted font-bold"
                >
                  ...
                </span>
              );
            }

            const pageNumber = page as number;
            const isActive = pageNumber === currentPage;

            return (
              <button
                key={pageNumber}
                type="button"
                onClick={() => handlePageChange(pageNumber)}
                disabled={isPending}
                className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-amtc-blue text-white shadow-sm font-bold"
                    : "bg-white dark:bg-cockpit-surface border border-slate-200 dark:border-cockpit-border text-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-cockpit-hover hover:border-slate-300 dark:hover:border-cockpit-border hover:text-amtc-navy dark:hover:text-white"
                }`}
              >
                {pageNumber}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          type="button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isPending}
          className="p-2 rounded-lg border border-slate-200 dark:border-cockpit-border bg-white dark:bg-cockpit-surface text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-cockpit-hover hover:text-amtc-navy dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs dark:shadow-none"
          title={isFrench ? "Page suivante" : "Next page"}
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Last Page */}
        <button
          type="button"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages || isPending}
          className="p-2 rounded-lg border border-slate-200 dark:border-cockpit-border bg-white dark:bg-cockpit-surface text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-cockpit-hover hover:text-amtc-navy dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs dark:shadow-none"
          title={isFrench ? "Dernière page" : "Last page"}
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
