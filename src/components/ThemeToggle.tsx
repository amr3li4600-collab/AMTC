"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setMounted(true);
    // Sync state with the actual DOM on mount
    const isDarkInDom = document.documentElement.classList.contains("dark");
    setIsDark(isDarkInDom);
  }, []);

  function toggleTheme() {
    // Directly inspect the DOM class list as the single source of truth
    const isCurrentlyDark = document.documentElement.classList.contains("dark");
    const willBeDark = !isCurrentlyDark;

    if (willBeDark) {
      document.documentElement.classList.add("dark");
      try {
        localStorage.setItem("amtc-theme", "dark");
      } catch (e) {
        console.error("Failed to save theme to localStorage", e);
      }
    } else {
      document.documentElement.classList.remove("dark");
      try {
        localStorage.setItem("amtc-theme", "light");
      } catch (e) {
        console.error("Failed to save theme to localStorage", e);
      }
    }

    setIsDark(willBeDark);
  }

  // Hydration-safe placeholder matching exact dimensions
  if (!mounted) {
    return (
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs font-semibold text-slate-500 dark:text-cockpit-muted hidden sm:inline">
          {t.common.themeToggle}
        </span>
        <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-cockpit-input border border-slate-200/80 dark:border-cockpit-border shrink-0" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <button
        type="button"
        onClick={toggleTheme}
        className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-amtc-blue dark:hover:text-amtc-sky transition-colors cursor-pointer select-none hidden sm:inline"
        title={isDark ? `${t.common.themeToggle} (${t.common.lightMode})` : `${t.common.themeToggle} (${t.common.cockpitMode})`}
      >
        {t.common.themeToggle}
      </button>

      <button
        type="button"
        onClick={toggleTheme}
        className={`
          relative h-9 w-9 rounded-xl flex items-center justify-center
          transition-all duration-300 ease-out
          border shadow-xs shrink-0 cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-amtc-blue/40
          active:scale-[0.92]
          ${isDark
            ? "bg-cockpit-surface border-cockpit-border text-amtc-blue hover:bg-cockpit-hover"
            : "bg-slate-50 border-slate-200/80 text-amber-500 hover:bg-amber-50 hover:border-amber-200/60"
          }
        `}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode (Cockpit Mode)"}
        title={isDark ? "Switch to Light Mode" : "Switch to Cockpit Mode"}
      >
        <div className="relative h-[18px] w-[18px] pointer-events-none">
          {/* Sun icon */}
          <Sun
            className={`absolute inset-0 h-[18px] w-[18px] pointer-events-none transition-all duration-300 ${
              isDark
                ? "opacity-0 rotate-90 scale-0"
                : "opacity-100 rotate-0 scale-100"
            }`}
          />
          {/* Moon icon */}
          <Moon
            className={`absolute inset-0 h-[18px] w-[18px] pointer-events-none transition-all duration-300 ${
              isDark
                ? "opacity-100 rotate-0 scale-100"
                : "opacity-0 -rotate-90 scale-0"
            }`}
          />
        </div>
      </button>
    </div>
  );
}
