"use client";

import { AlertsFilter } from "@/components/AlertsFilter";
import { Pagination } from "@/components/Pagination";
import { generateWhatsAppURL, formatDateFR } from "@/lib/whatsapp";
import {
  AlertTriangle,
  Clock,
  MessageSquare,
  ArrowLeft,
  FileText,
  ShieldCheck,
  Calendar,
  Phone,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import type { PaginatedExpiringDocumentsResult } from "@/app/actions/studentActions";

interface AlertsViewProps {
  result: PaginatedExpiringDocumentsResult;
  docType: string;
  status: string;
  search: string;
  limit: number;
}

export function AlertsView({ result, docType, status, search, limit }: AlertsViewProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Executive Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-cockpit-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-xs font-semibold text-amtc-blue hover:text-amtc-blueHover transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{t.nav.dashboard}</span>
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-amtc-navy dark:text-white">
              {t.alerts.title}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-700/40">
              <AlertCircle className="h-3 w-3" />
              {result.totalCount} {result.totalCount === 1 ? t.alerts.alert : t.alerts.alerts}
            </span>
          </div>
          <p className="text-slate-500 dark:text-cockpit-muted text-xs sm:text-sm mt-1">
            {t.alerts.subtitle}
          </p>
        </div>

        {/* Quick Return Action */}
        <div className="flex items-center gap-2">
          <Link
            href="/admin/students"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-amtc-navy dark:text-slate-200 bg-white dark:bg-cockpit-surface border border-slate-200 dark:border-cockpit-border hover:bg-slate-50 dark:hover:bg-cockpit-hover hover:border-slate-300 dark:hover:border-cockpit-border shadow-xs transition-all duration-200"
          >
            <UserCheck className="h-3.5 w-3.5 text-amtc-blue" />
            <span>{t.alerts.allStudents}</span>
          </Link>
        </div>
      </div>

      {/* Metric Summary Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Urgent */}
        <div className="bg-white dark:bg-cockpit-surface rounded-2xl border border-slate-100 dark:border-cockpit-border p-4 sm:p-5 shadow-card dark:shadow-none flex items-center gap-4 transition-colors duration-300">
          <div className="h-11 w-11 rounded-xl bg-amtc-blueLight dark:bg-amtc-blue/15 text-amtc-blue flex items-center justify-center shrink-0">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-cockpit-muted">{t.alerts.totalAlerts}</p>
            <p className="text-2xl font-extrabold text-amtc-navy dark:text-white">{result.summary.totalUrgent}</p>
            <p className="text-[11px] text-slate-500 dark:text-cockpit-muted font-medium">{t.alerts.matchingCriteria}</p>
          </div>
        </div>

        {/* Expired */}
        <div className="bg-white dark:bg-cockpit-surface rounded-2xl border border-slate-100 dark:border-cockpit-border p-4 sm:p-5 shadow-card dark:shadow-none flex items-center gap-4 transition-colors duration-300">
          <div className="h-11 w-11 rounded-xl bg-rose-50 dark:bg-rose-900/25 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">{t.alerts.expired}</p>
            <p className="text-2xl font-extrabold text-rose-700 dark:text-rose-400">{result.summary.expiredCount}</p>
            <p className="text-[11px] text-slate-500 dark:text-cockpit-muted font-medium">{t.alerts.immediateRenewal}</p>
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-white dark:bg-cockpit-surface rounded-2xl border border-slate-100 dark:border-cockpit-border p-4 sm:p-5 shadow-card dark:shadow-none flex items-center gap-4 transition-colors duration-300">
          <div className="h-11 w-11 rounded-xl bg-amber-50 dark:bg-amber-900/25 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">{t.alerts.expiringSoon}</p>
            <p className="text-2xl font-extrabold text-amber-700 dark:text-amber-400">{result.summary.expiringSoonCount}</p>
            <p className="text-[11px] text-slate-500 dark:text-cockpit-muted font-medium">{t.alerts.expiringSoonCriteria}</p>
          </div>
        </div>

        {/* Breakdown */}
        <div className="bg-white dark:bg-cockpit-surface rounded-2xl border border-slate-100 dark:border-cockpit-border p-4 sm:p-5 shadow-card dark:shadow-none flex items-center gap-4 transition-colors duration-300">
          <div className="h-11 w-11 rounded-xl bg-sky-50 dark:bg-sky-900/25 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-cockpit-muted">{t.alerts.documentType}</p>
            <div className="flex items-center gap-3 pt-0.5">
              <div>
                <span className="text-xs text-purple-700 dark:text-purple-400 font-extrabold">{t.alerts.passport}: </span>
                <span className="text-sm font-bold text-amtc-navy dark:text-white">{result.summary.passportCount}</span>
              </div>
              <span className="text-slate-300 dark:text-cockpit-border">•</span>
              <div>
                <span className="text-xs text-sky-700 dark:text-sky-400 font-extrabold">{t.alerts.cempn}: </span>
                <span className="text-sm font-bold text-amtc-navy dark:text-white">{result.summary.cempnCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Filter & Search Controls */}
      <AlertsFilter
        currentDocType={docType}
        currentStatus={status}
        currentSearch={search}
        currentLimit={limit}
      />

      {/* Alerts Table & List View */}
      <div className="bg-white dark:bg-cockpit-surface rounded-2xl border border-slate-100/90 dark:border-cockpit-border shadow-card dark:shadow-none overflow-hidden transition-colors duration-300">
        {result.data.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-cockpit-muted flex flex-col items-center justify-center">
            <div className="h-14 w-14 rounded-full bg-emerald-50 dark:bg-emerald-900/25 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-amtc-navy dark:text-white">{t.alerts.noAlertsFound}</h3>
            <p className="text-xs text-slate-400 dark:text-cockpit-muted mt-1 max-w-sm">
              {search || docType !== "ALL" || status !== "ALL"
                ? t.alerts.noAlertsFiltered
                : t.alerts.allDocumentsValid}
            </p>
            {(search || docType !== "ALL" || status !== "ALL") && (
              <Link
                href="/admin/alerts"
                className="mt-4 px-4 py-2 bg-slate-100 dark:bg-cockpit-input hover:bg-slate-200 dark:hover:bg-cockpit-hover text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors"
              >
                {t.alerts.clearFilters}
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="bg-slate-50/80 dark:bg-cockpit-canvas/50 border-b border-slate-100 dark:border-cockpit-border text-slate-500 dark:text-cockpit-muted uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">{t.alerts.thCandidate}</th>
                  <th className="px-6 py-3.5">{t.alerts.thDocument}</th>
                  <th className="px-6 py-3.5">{t.alerts.thExpirationDate}</th>
                  <th className="px-6 py-3.5">{t.alerts.thUrgency}</th>
                  <th className="px-6 py-3.5 text-right">{t.alerts.thAction}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 dark:divide-cockpit-border bg-white dark:bg-cockpit-surface text-sm">
                {result.data.map((alert) => {
                  const isExpired = alert.daysRemaining <= 0;
                  const isUrgent = alert.daysRemaining <= 7 && alert.daysRemaining > 0;
                  const formattedDate = formatDateFR(alert.expirationDate);
                  const docTypeEnum = alert.type.toUpperCase() as "CEMPN" | "PASSPORT";
                  const whatsappUrl = generateWhatsAppURL(
                    alert.phone,
                    {
                      fullName: alert.fullName,
                      expirationDate: alert.expirationDate,
                      daysRemaining: alert.daysRemaining,
                    },
                    docTypeEnum
                  );

                  const initials = alert.fullName
                    ? alert.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()
                    : "C";

                  return (
                    <tr
                      key={alert.alertId}
                      className="hover:bg-slate-50/70 dark:hover:bg-cockpit-hover transition-colors group"
                    >
                      {/* Candidate Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {alert.photoUrl ? (
                            <img
                              src={alert.photoUrl}
                              alt=""
                              className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-cockpit-border shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-amtc-blueLight dark:bg-amtc-blue/15 text-amtc-blue font-bold text-xs flex items-center justify-center border border-amtc-blue/20 dark:border-amtc-blue/30 shrink-0">
                              {initials}
                            </div>
                          )}
                          <div className="min-w-0">
                            <Link
                              href={`/admin/students/${alert.studentId}`}
                              className="font-semibold text-amtc-navy dark:text-white group-hover:text-amtc-blue transition-colors text-sm hover:underline block truncate"
                            >
                              {alert.fullName}
                            </Link>
                            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-cockpit-muted mt-0.5">
                              <span className="font-medium text-slate-500 dark:text-slate-400">CIN: {alert.cin}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-slate-400 dark:text-cockpit-muted">
                                <Phone className="h-3 w-3" />
                                {alert.phone}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Document Type Column */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                            alert.type === "cempn"
                              ? "bg-sky-100 dark:bg-sky-900/30 text-sky-800 dark:text-sky-400 border border-sky-200/60 dark:border-sky-700/40"
                              : "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 border border-purple-200/60 dark:border-purple-700/40"
                          }`}
                        >
                          <FileText className="h-3.5 w-3.5" />
                          {alert.type === "cempn" ? t.alerts.cempnMedical : t.alerts.passport}
                        </span>
                      </td>

                      {/* Expiration Date Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          <Calendar className="h-3.5 w-3.5 text-slate-400 dark:text-cockpit-muted" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>

                      {/* Urgency & Status Column */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              isExpired
                                ? "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-700/40"
                                : isUrgent
                                ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-700/40"
                                : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-700/30"
                            }`}
                          >
                            {isExpired ? (
                              <>
                                <AlertTriangle className="h-3 w-3 text-rose-600 dark:text-rose-400" />
                                <span>{t.common.expiredDaysAgo.replace("{days}", String(Math.abs(alert.daysRemaining)))}</span>
                              </>
                            ) : (
                              <>
                                <Clock className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                                <span>{t.common.expiresInDays.replace("{days}", String(alert.daysRemaining))}</span>
                              </>
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Quick Action Column */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-[0.98]"
                            title={`${t.alerts.remindWhatsApp} (${alert.fullName})`}
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span>{t.alerts.remindWhatsApp}</span>
                          </a>

                          <Link
                            href={`/admin/students/${alert.studentId}`}
                            className="p-1.5 text-slate-400 dark:text-cockpit-muted hover:text-amtc-blue hover:bg-slate-100 dark:hover:bg-cockpit-hover rounded-lg transition-colors"
                            title={t.alerts.inspectCandidate}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Server-Side Pagination */}
        <div className="border-t border-slate-100 dark:border-cockpit-border bg-slate-50/50 dark:bg-cockpit-canvas/30">
          <Pagination
            currentPage={result.page}
            totalPages={result.totalPages}
            totalCount={result.totalCount}
            pageSize={result.limit}
          />
        </div>
      </div>
    </div>
  );
}
