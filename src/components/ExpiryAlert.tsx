"use client";

import { generateWhatsAppURL, formatDateFR } from "@/lib/whatsapp";
import { MessageSquare, Clock, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

interface ExpiryAlertProps {
  id: string;
  fullName: string;
  phone: string;
  type: "cempn" | "passport";
  expirationDate: Date;
  daysRemaining: number;
}

export function ExpiryAlert({ fullName, phone, type, expirationDate, daysRemaining }: ExpiryAlertProps) {
  const { t } = useLanguage();
  const isUrgent = daysRemaining <= 7;
  const isExpired = daysRemaining <= 0;
  
  const formattedDate = formatDateFR(new Date(expirationDate));
  const docType = type.toUpperCase() as "CEMPN" | "PASSPORT";
  const whatsappUrl = generateWhatsAppURL(
    phone,
    {
      fullName,
      expirationDate,
      daysRemaining,
    },
    docType
  );
  
  const title = docType === "CEMPN" ? t.alerts.cempnMedical : t.alerts.passport;
  
  return (
    <motion.div
      whileHover={{ x: 2, scale: 1.008 }}
      transition={{ type: "spring", stiffness: 450, damping: 25 }}
      className="w-full min-w-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-white dark:bg-cockpit-surface border border-slate-100 dark:border-cockpit-border rounded-xl shadow-card dark:shadow-none hover:shadow-card-hover dark:hover:shadow-none hover:border-amtc-blue/30 dark:hover:border-white/15 transition-colors overflow-hidden"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className={`p-2 rounded-full shrink-0 ${
          isExpired ? "bg-red-50 dark:bg-red-900/25 text-red-600 dark:text-red-400" : 
          isUrgent ? "bg-amber-50 dark:bg-amber-900/25 text-amber-600 dark:text-amber-400" : 
          "bg-blue-50 dark:bg-blue-900/25 text-blue-600 dark:text-blue-400"
        }`}>
          {isExpired ? <AlertTriangle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
        </div>
        
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-amtc-navy dark:text-white truncate" title={fullName}>{fullName}</h4>
          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
              type === "cempn" 
                ? "bg-sky-100 dark:bg-sky-900/30 text-sky-800 dark:text-sky-400" 
                : "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400"
            }`}>
              {title}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${
              isExpired ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" : 
              isUrgent ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" : 
              "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
            }`}>
              {isExpired ? t.common.expired : `${daysRemaining}${t.common.daysRemaining}`}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-cockpit-muted font-medium shrink-0">({formattedDate})</span>
          </div>
        </div>
      </div>
      
      <motion.a 
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 500, damping: 20 }}
        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm self-end sm:self-center"
        title={t.alerts.remindWhatsApp}
      >
        <MessageSquare className="w-3.5 h-3.5" />
        <span>{t.common.remind}</span>
      </motion.a>
    </motion.div>
  );
}
