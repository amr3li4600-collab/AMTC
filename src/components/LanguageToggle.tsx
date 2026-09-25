"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { Globe } from "lucide-react";

interface LanguageToggleProps {
  showLabel?: boolean;
  variant?: "topbar" | "sidebar" | "login";
}

export function LanguageToggle({ showLabel = false, variant = "topbar" }: LanguageToggleProps) {
  const { language, setLanguage, t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hydration-safe placeholder matching exact dimensions
  if (!mounted) {
    return (
      <div className="flex items-center gap-1.5 shrink-0">
        {showLabel && (
          <span className="text-xs font-semibold text-slate-500 dark:text-cockpit-muted hidden sm:inline">
            Language
          </span>
        )}
        <div className="h-9 w-[108px] rounded-xl bg-slate-100 dark:bg-cockpit-input border border-slate-200/80 dark:border-cockpit-border shrink-0" />
      </div>
    );
  }

  if (variant === "login") {
    return (
      <div className="inline-flex items-center bg-white/10 p-0.5 rounded-lg border border-white/20 text-xs backdrop-blur-sm">
        <button
          type="button"
          onClick={() => setLanguage("en")}
          className={`px-2 py-1 rounded-md font-bold transition-all ${language === "en" ? "bg-blue-500 text-white shadow-xs" : "text-slate-300 hover:text-white"}`}
          title="Switch to English"
        >
          🇬🇧 EN
        </button>
        <button
          type="button"
          onClick={() => setLanguage("fr")}
          className={`px-2 py-1 rounded-md font-bold transition-all ${language === "fr" ? "bg-blue-500 text-white shadow-xs" : "text-slate-300 hover:text-white"}`}
          title="Passer en Français"
        >
          🇫🇷 FR
        </button>
      </div>
    );
  }

  if (variant === "sidebar") {
    return (
      <div className="flex items-center justify-between px-3 py-2 bg-white/5 border border-white/10 rounded-xl">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-amtc-blue shrink-0" />
          <span className="text-xs font-medium text-slate-300">
            {t.common.language}
          </span>
        </div>
        <div className="inline-flex items-center bg-black/40 p-0.5 rounded-lg border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setLanguage("en")}
            className={`px-2 py-1 rounded-md font-bold transition-all ${
              language === "en"
                ? "bg-amtc-blue text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
            title="Switch to English"
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLanguage("fr")}
            className={`px-2 py-1 rounded-md font-bold transition-all ${
              language === "fr"
                ? "bg-amtc-blue text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
            title="Passer en Français"
          >
            FR
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      {showLabel && (
        <span className="text-xs font-semibold text-slate-500 dark:text-cockpit-muted hidden sm:inline">
          {t.common.language}
        </span>
      )}

      {/* Segmented Cockpit Language Pill */}
      <div 
        className="relative inline-flex items-center h-9 p-1 rounded-xl bg-slate-100 dark:bg-cockpit-surface border border-slate-200/80 dark:border-cockpit-border shadow-xs transition-colors duration-200"
        role="group"
        aria-label="Language selection"
      >
        <button
          type="button"
          onClick={() => setLanguage("en")}
          className={`relative z-10 flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer select-none focus:outline-none focus:ring-1 focus:ring-amtc-blue/40 ${
            language === "en"
              ? "text-white"
              : "text-slate-600 dark:text-slate-400 hover:text-amtc-navy dark:hover:text-white"
          }`}
          title="Switch to English"
        >
          <span className="text-xs leading-none">🇬🇧</span>
          <span>EN</span>
        </button>

        <button
          type="button"
          onClick={() => setLanguage("fr")}
          className={`relative z-10 flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer select-none focus:outline-none focus:ring-1 focus:ring-amtc-blue/40 ${
            language === "fr"
              ? "text-white"
              : "text-slate-600 dark:text-slate-400 hover:text-amtc-navy dark:hover:text-white"
          }`}
          title="Passer au Français"
        >
          <span className="text-xs leading-none">🇫🇷</span>
          <span>FR</span>
        </button>

        {/* Sliding active pill indicator */}
        <motion.div
          layoutId="activeLangIndicator"
          className="absolute top-1 bottom-1 rounded-lg bg-amtc-navy dark:bg-amtc-blue shadow-xs"
          style={{
            left: language === "en" ? 4 : undefined,
            right: language === "fr" ? 4 : undefined,
            width: "calc(50% - 4px)",
          }}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      </div>
    </div>
  );
}
