"use client";

import { Users, GraduationCap, Briefcase, AlertCircle, CheckCircle2, ShieldCheck, Clock, AlertTriangle, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

const iconMap: Record<string, LucideIcon> = {
  Users,
  GraduationCap,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Clock,
  AlertTriangle,
};

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  highlight?: boolean;
}

export function StatsCard({ title, value, icon, description, trend, highlight }: StatsCardProps) {
  const isAlert = highlight || (trend && !trend.isPositive);
  const Icon = iconMap[icon] || AlertCircle;

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`p-6 rounded-2xl border transition-colors duration-200 group relative overflow-hidden cursor-default ${
        isAlert
          ? "bg-gradient-to-br from-white via-white to-amber-50/40 dark:from-cockpit-surface dark:via-cockpit-surface dark:to-amber-900/10 border-amber-200/80 dark:border-amber-700/40 shadow-card hover:shadow-card-hover dark:shadow-none"
          : "bg-white dark:bg-cockpit-surface border-slate-100/90 dark:border-cockpit-border shadow-card dark:shadow-none hover:border-amtc-blue/30 dark:hover:border-amtc-blue/40 hover:shadow-card-hover"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-cockpit-muted">{title}</p>
          <p className="mt-2.5 text-3xl font-extrabold tracking-tight text-amtc-navy dark:text-white">{value}</p>
        </div>
        <div className={`p-3 rounded-xl transition-transform duration-200 group-hover:scale-105 ${
          isAlert 
            ? "bg-amber-100/80 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-700/40" 
            : "bg-amtc-blueLight dark:bg-amtc-blue/15 text-amtc-blue border border-amtc-blue/15 dark:border-amtc-blue/30"
        }`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      
      {(description || trend) && (
        <div className="mt-4 flex items-center gap-2 text-xs font-medium pt-3 border-t border-slate-100 dark:border-cockpit-border">
          {trend && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[11px] ${
                trend.isPositive 
                  ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700/40" 
                  : "bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-700/40 animate-pulse"
              }`}
            >
              {trend.value}
            </span>
          )}
          {description && (
            <span className="text-slate-500 dark:text-cockpit-muted">
              {description}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}

