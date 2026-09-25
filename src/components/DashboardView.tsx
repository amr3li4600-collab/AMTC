"use client";

import { ArrowRight, UserPlus, CheckCircle2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { StatsCard } from "@/components/StatsCard";
import { ExpiryAlert } from "@/components/ExpiryAlert";
import { DGACBadge } from "@/components/DGACBadge";
import { useLanguage } from "@/context/LanguageContext";
import type { Student } from "@/generated/prisma/client";

interface DashboardViewProps {
  stats: {
    total: number;
    certified: number;
    hired: number;
    expiringSoon: number;
    expiringDocuments: {
      id: string;
      fullName: string;
      phone: string;
      type: "cempn" | "passport";
      expirationDate: Date;
      daysRemaining: number;
    }[];
  };
  recentStudents: Student[];
}

export function DashboardView({ stats, recentStudents }: DashboardViewProps) {
  const { t, language } = useLanguage();
  const certifiedPercent = Math.round((stats.certified / Math.max(stats.total, 1)) * 100);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Executive Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-cockpit-border">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-amtc-navy dark:text-white">
              {t.dashboard.title}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amtc-blue/10 dark:bg-amtc-blue/20 text-amtc-blue border border-amtc-blue/20 dark:border-amtc-blue/30">
              <ShieldCheck className="h-3 w-3" />
              {t.dashboard.dgacReady}
            </span>
          </div>
          <p className="text-slate-500 dark:text-cockpit-muted text-xs sm:text-sm mt-1">
            {t.dashboard.subtitle}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <Link
            href="/admin/eligibility"
            className="inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold text-amtc-navy dark:text-slate-200 bg-white dark:bg-cockpit-surface border border-slate-200 dark:border-cockpit-border hover:bg-slate-50 dark:hover:bg-cockpit-hover hover:border-slate-300 dark:hover:border-cockpit-border shadow-xs transition-all duration-200 active:scale-[0.98] flex-1 sm:flex-none"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-amtc-blue" />
            <span>{t.dashboard.eligibilityEngine}</span>
          </Link>
          <Link
            href="/admin/students/new"
            className="inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold text-white bg-amtc-navy dark:bg-amtc-blue hover:bg-amtc-navyDark dark:hover:bg-amtc-blueHover shadow-sm hover:shadow transition-all duration-200 active:scale-[0.98] flex-1 sm:flex-none"
          >
            <UserPlus className="h-3.5 w-3.5 text-amtc-blue dark:text-white" />
            <span>{t.dashboard.addCandidate}</span>
          </Link>
        </div>
      </div>

      {/* Stats Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <StatsCard
          title={t.dashboard.totalStudents}
          value={stats.total}
          icon="Users"
          description={t.dashboard.totalStudentsDesc}
        />
        <StatsCard
          title={t.dashboard.dgacCertified}
          value={stats.certified}
          icon="GraduationCap"
          trend={{ value: `${certifiedPercent}%`, isPositive: true }}
          description={t.dashboard.dgacCertifiedDesc}
        />
        <StatsCard
          title={t.dashboard.hired}
          value={stats.hired}
          icon="Briefcase"
          trend={{ value: stats.hired > 0 ? `${stats.hired} ${t.dashboard.hiredActive}` : t.common.active, isPositive: true }}
          description={t.dashboard.hiredDesc}
        />
        <StatsCard
          title={t.dashboard.actionRequired}
          value={stats.expiringSoon}
          icon="AlertCircle"
          description={t.dashboard.actionRequiredDesc}
          trend={{ value: stats.expiringSoon > 0 ? t.common.urgent : t.common.clear, isPositive: stats.expiringSoon === 0 }}
          highlight={stats.expiringSoon > 0}
        />
      </div>

      {/* Main Two-Column Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Candidate Enrollments */}
        <div className="lg:col-span-2 space-y-4 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-amtc-navy dark:text-white tracking-tight">
                {t.dashboard.recentEnrollments}
              </h2>
              <p className="text-xs text-slate-400 dark:text-cockpit-muted mt-0.5">
                {t.dashboard.recentEnrollmentsDesc}
              </p>
            </div>
            <Link 
              href="/admin/students" 
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amtc-blue hover:text-amtc-blueHover bg-amtc-blueLight/60 dark:bg-amtc-blue/15 px-3 py-1.5 rounded-lg border border-amtc-blue/20 dark:border-amtc-blue/30 transition-colors"
            >
              <span>{t.common.viewAll}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          
          <div className="bg-white dark:bg-cockpit-surface rounded-2xl border border-slate-100/90 dark:border-cockpit-border shadow-card dark:shadow-none overflow-hidden transition-colors duration-300">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[540px]">
                <thead className="bg-slate-50/80 dark:bg-cockpit-canvas/50 border-b border-slate-100 dark:border-cockpit-border text-slate-500 dark:text-cockpit-muted uppercase text-[11px] font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">{t.dashboard.candidate}</th>
                    <th className="px-6 py-3.5">{t.dashboard.qualification}</th>
                    <th className="px-6 py-3.5">{t.dashboard.dateEnrolled}</th>
                    <th className="px-4 py-3.5 text-right">{t.common.action}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80 dark:divide-cockpit-border bg-white dark:bg-cockpit-surface text-sm">
                  {(recentStudents || []).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-400 dark:text-cockpit-muted">
                        {t.dashboard.noStudentsYet}
                      </td>
                    </tr>
                  ) : (
                    recentStudents.map((student) => {
                      const initials = student.fullName
                        ? student.fullName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
                        : "S";

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/70 dark:hover:bg-cockpit-hover transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {student.photoUrl ? (
                                <img src={student.photoUrl} alt="" className="h-9 w-9 rounded-full object-cover border border-slate-200 dark:border-cockpit-border" />
                              ) : (
                                <div className="h-9 w-9 rounded-full bg-amtc-blueLight dark:bg-amtc-blue/15 text-amtc-blue font-bold text-xs flex items-center justify-center border border-amtc-blue/20 dark:border-amtc-blue/30 shadow-xs">
                                  {initials}
                                </div>
                              )}
                              <div>
                                <Link 
                                  href={`/admin/students/${student.id}`}
                                  className="font-semibold text-amtc-navy dark:text-white group-hover:text-amtc-blue transition-colors text-sm"
                                >
                                  {student.fullName || t.dashboard.candidate}
                                </Link>
                                <p className="text-xs text-slate-400 dark:text-cockpit-muted mt-0.5">
                                  CIN: {student.cin || "—"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <DGACBadge status={student.dgacStatus || "ENROLLED"} />
                          </td>
                          <td className="px-6 py-4 text-xs font-medium text-slate-500 dark:text-cockpit-muted">
                            {student.createdAt ? new Date(student.createdAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            }) : "—"}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <Link
                              href={`/admin/students/${student.id}`}
                              className="text-xs font-medium text-slate-400 dark:text-cockpit-muted hover:text-amtc-blue transition-colors px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-cockpit-hover inline-block"
                            >
                              {t.common.inspect}
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Expiring Documents Monitor */}
        <div className="space-y-4 w-full min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-amtc-navy dark:text-white tracking-tight">
                  {t.dashboard.expiringDocuments}
                </h2>
                {stats.expiringSoon > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-700/40 shrink-0">
                    {stats.expiringSoon} {t.common.pending}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 dark:text-cockpit-muted mt-0.5">
                {t.dashboard.passportMedicalAlerts}
              </p>
            </div>
            
            <Link 
              href="/admin/alerts" 
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amtc-blue hover:text-amtc-blueHover bg-amtc-blueLight/60 dark:bg-amtc-blue/15 px-3 py-1.5 rounded-lg border border-amtc-blue/20 dark:border-amtc-blue/30 transition-colors shrink-0"
            >
              <span>{t.common.viewAll}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          
          <div className="space-y-3 w-full">
            {stats.expiringDocuments.length === 0 ? (
              <div className="bg-white dark:bg-cockpit-surface rounded-2xl border border-slate-100 dark:border-cockpit-border p-8 text-center text-slate-500 dark:text-cockpit-muted flex flex-col items-center justify-center shadow-card dark:shadow-none">
                <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-900/25 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <p className="font-semibold text-amtc-navy dark:text-white text-sm">
                  {t.dashboard.allDocumentsUpToDate}
                </p>
                <p className="text-xs text-slate-400 dark:text-cockpit-muted mt-1">
                  {t.dashboard.allDocumentsUpToDateDesc}
                </p>
              </div>
            ) : (
              <>
                {stats.expiringDocuments.map((doc) => (
                  <ExpiryAlert
                    key={`${doc.id}-${doc.type}`}
                    id={doc.id}
                    fullName={doc.fullName}
                    phone={doc.phone}
                    type={doc.type}
                    expirationDate={doc.expirationDate}
                    daysRemaining={doc.daysRemaining}
                  />
                ))}

                {stats.expiringSoon > 5 && (
                  <Link
                    href="/admin/alerts"
                    className="block p-3 rounded-xl bg-slate-50 dark:bg-cockpit-input hover:bg-amtc-blueLight/40 dark:hover:bg-cockpit-hover border border-slate-200/80 dark:border-cockpit-border hover:border-amtc-blue/30 dark:hover:border-amtc-blue/30 text-center transition-all group"
                  >
                    <span className="text-xs font-semibold text-amtc-navy dark:text-slate-200 group-hover:text-amtc-blue transition-colors inline-flex items-center gap-1.5">
                      {t.dashboard.viewAllAlertsManager.replace("{count}", String(stats.expiringSoon))}
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
