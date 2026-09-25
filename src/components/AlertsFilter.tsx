"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X, Filter, FileText } from "lucide-react";
import { useCallback, useTransition, useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface AlertsFilterProps {
  currentDocType: string;
  currentStatus: string;
  currentSearch: string;
  currentLimit: number;
}

export function AlertsFilter({
  currentDocType,
  currentStatus,
  currentSearch,
  currentLimit,
}: AlertsFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState(currentSearch);

  // Sync state if searchParams change externally
  useEffect(() => {
    setSearchTerm(currentSearch);
  }, [currentSearch]);

  const updateFilters = useCallback(
    (updates: Record<string, string | number | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      // Reset to page 1 whenever filters change (except when updating page itself)
      if (!updates.page) {
        params.set("page", "1");
      }

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "" || value === "ALL") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams]
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchTerm.trim() || null });
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    updateFilters({ search: null });
  };

  const docTypes = [
    { label: t.alerts.allDocuments, value: "ALL" },
    { label: t.alerts.passports, value: "PASSPORT" },
    { label: t.alerts.cempnMedicals, value: "CEMPN" },
  ];

  const statuses = [
    { label: t.alerts.allStatuses, value: "ALL" },
    { label: t.alerts.expired, value: "EXPIRED" },
    { label: t.alerts.expiringSoon, value: "EXPIRING_SOON" },
  ];

  return (
    <div className="bg-white dark:bg-cockpit-surface rounded-2xl border border-slate-100 dark:border-cockpit-border shadow-card dark:shadow-none p-4 sm:p-5 space-y-4 transition-colors duration-300">
      {/* Top row: Search & Rows Per Page */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-cockpit-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.alerts.searchPlaceholder}
            className="w-full pl-10 pr-20 py-2.5 bg-slate-50 dark:bg-cockpit-input border border-slate-200 dark:border-cockpit-border rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amtc-blue/30 focus:border-amtc-blue dark:focus:border-amtc-blue transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-14 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-md"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-amtc-navy dark:bg-amtc-blue hover:bg-amtc-navyDark dark:hover:bg-amtc-blueHover text-white text-xs font-semibold rounded-lg transition-colors"
          >
            {t.common.search}
          </button>
        </form>

        {/* Rows per page selector */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <span className="text-xs text-slate-400 dark:text-cockpit-muted font-medium">{t.alerts.show}</span>
          <select
            value={currentLimit}
            onChange={(e) => updateFilters({ limit: Number(e.target.value) })}
            className="bg-slate-50 dark:bg-cockpit-input border border-slate-200 dark:border-cockpit-border text-xs font-semibold text-slate-700 dark:text-slate-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-amtc-blue/30 cursor-pointer"
          >
            <option value="10">10 {t.alerts.perPage}</option>
            <option value="20">20 {t.alerts.perPage}</option>
            <option value="50">50 {t.alerts.perPage}</option>
          </select>
        </div>
      </div>

      {/* Filter Tabs / Pills */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-cockpit-border">
        {/* Document Type Filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 dark:text-cockpit-muted mr-1 flex items-center gap-1">
            <FileText className="h-3.5 w-3.5 text-amtc-blue" />
            {t.alerts.typeFilter}
          </span>
          {docTypes.map((type) => {
            const isSelected = currentDocType === type.value;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => updateFilters({ docType: type.value })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-amtc-navy dark:bg-amtc-blue text-white shadow-xs"
                    : "bg-slate-100 dark:bg-cockpit-input text-slate-600 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-cockpit-hover hover:text-amtc-navy dark:hover:text-white"
                }`}
              >
                {type.label}
              </button>
            );
          })}
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 dark:text-cockpit-muted mr-1 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5 text-amtc-blue" />
            {t.alerts.statusFilter}
          </span>
          {statuses.map((st) => {
            const isSelected = currentStatus === st.value;
            return (
              <button
                key={st.value}
                type="button"
                onClick={() => updateFilters({ status: st.value })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-amtc-blue text-white shadow-xs"
                    : "bg-slate-100 dark:bg-cockpit-input text-slate-600 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-cockpit-hover hover:text-amtc-navy dark:hover:text-white"
                }`}
              >
                {st.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading state indicator */}
      {isPending && (
        <div className="h-1 w-full bg-slate-100 dark:bg-cockpit-border overflow-hidden rounded-full">
          <div className="h-full bg-amtc-blue animate-pulse w-2/3 rounded-full" />
        </div>
      )}
    </div>
  );
}
