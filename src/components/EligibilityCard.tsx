"use client";

import { CheckCircle2, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MatchResult } from "@/app/actions/filterActions";
import { DGACBadge } from "./DGACBadge";
import { useLanguage } from "@/context/LanguageContext";

interface EligibilityCardProps {
  result: MatchResult;
}

export function EligibilityCard({ result }: EligibilityCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { student, matchPercentage, criteria, isEligible } = result;
  const { t } = useLanguage();

  // Determine badge styling based on score
  let badgeColor = "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200/60 dark:border-red-800/40";
  if (matchPercentage === 100) {
    badgeColor = "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40";
  } else if (matchPercentage >= 75) {
    badgeColor = "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40";
  }

  const genderLabel = student.gender === "FEMALE" ? t.studentForm.female : t.studentForm.male;

  return (
    <motion.div 
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
      className="card overflow-hidden"
    >
      {/* Header Summary */}
      <div 
        className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-cockpit-canvas/40 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          {student.photoUrl ? (
            <img src={student.photoUrl} alt="" className="h-12 w-12 rounded-full object-cover border border-slate-200 dark:border-cockpit-border" />
          ) : (
            <div className="h-12 w-12 rounded-full bg-amtc-blueLight dark:bg-cockpit-border/40 flex items-center justify-center text-amtc-navy dark:text-amtc-sky font-bold">
              {student.fullName.charAt(0)}
            </div>
          )}
          
          <div>
            <h4 className="font-bold text-amtc-navy dark:text-white text-lg">{student.fullName}</h4>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-cockpit-muted mt-0.5">
              <span>{genderLabel}</span>
              <span>•</span>
              <span>{student.height} cm</span>
              <span>•</span>
              <span>BMI: {student.bmi}</span>
            </div>
            <div className="mt-2">
              <DGACBadge status={student.dgacStatus} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 self-end sm:self-auto">
          <div className="flex flex-col items-end">
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${badgeColor}`}>
              {matchPercentage}% {t.eligibility.match}
            </span>
            <span className="text-xs text-slate-500 dark:text-cockpit-muted mt-1 font-medium">
              {isEligible ? t.eligibility.readyForAssessment : t.eligibility.needsImprovement}
            </span>
          </div>
          <button className="p-1 text-slate-400 dark:text-cockpit-muted">
            {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Expanded Details with Framer Motion Accordion */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden border-t border-slate-100 dark:border-cockpit-border bg-slate-50/50 dark:bg-cockpit-canvas/50"
          >
            <div className="p-5">
              <h5 className="text-sm font-semibold text-amtc-navy dark:text-white mb-3">{t.eligibility.eligibilityBreakdown}</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                {criteria.map((c, i) => (
                  <div key={i} className="flex items-start justify-between py-2 border-b border-slate-100/50 dark:border-cockpit-border/50 last:border-0">
                    <div className="flex items-center gap-2">
                      {c.passed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm font-medium ${c.passed ? "text-slate-700 dark:text-slate-300" : "text-red-700 dark:text-red-400"}`}>
                        {c.criterion}
                      </span>
                    </div>
                    <span className="text-sm text-slate-500 dark:text-cockpit-muted text-right">{c.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
