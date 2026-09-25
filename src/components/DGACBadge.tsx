"use client";

import { CheckCircle2, FileText, BookOpen, GraduationCap } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type DGACStatusType = "ENROLLED" | "WRITTEN_PASSED" | "PRACTICAL_PASSED" | "CERTIFIED" | string;

export function DGACBadge({ status }: { status: DGACStatusType }) {
  const { t } = useLanguage();
  let label = t.dgacBadges.ENROLLED;
  let classes = "bg-slate-100 dark:bg-cockpit-canvas text-slate-800 dark:text-slate-300 border-slate-200 dark:border-cockpit-border";
  let Icon = BookOpen;

  switch (status) {
    case "ENROLLED":
      label = t.dgacBadges.ENROLLED;
      classes = "bg-slate-100 dark:bg-cockpit-canvas text-slate-800 dark:text-slate-300 border-slate-200 dark:border-cockpit-border";
      Icon = BookOpen;
      break;
    case "WRITTEN_PASSED":
      label = t.dgacBadges.WRITTEN_PASSED;
      classes = "bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800/40";
      Icon = FileText;
      break;
    case "PRACTICAL_PASSED":
      label = t.dgacBadges.PRACTICAL_PASSED;
      classes = "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/40";
      Icon = GraduationCap;
      break;
    case "CERTIFIED":
      label = t.dgacBadges.CERTIFIED;
      classes = "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40";
      Icon = CheckCircle2;
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${classes}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
