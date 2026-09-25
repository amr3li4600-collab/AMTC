"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { PageTransition } from "@/components/PageTransition";
import { ShieldCheck, Menu } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useLanguage();

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Close mobile drawer on Escape key press
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsMobileOpen(false);
      }
    }
    if (isMobileOpen) {
      window.addEventListener("keydown", handleKeyDown);
      // Prevent body scrolling when drawer is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  // Bypass shell for login route
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen h-[100dvh] w-full bg-[#F8FAFC] dark:bg-cockpit-canvas overflow-hidden transition-colors duration-300">
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-200"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Component (Handles both Desktop fixed and Mobile drawer) */}
      <Sidebar isMobileOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Executive Navigation Bar */}
        <header className="h-16 bg-white/95 dark:bg-cockpit-surface/95 backdrop-blur-md border-b border-slate-200/80 dark:border-cockpit-border px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 z-10 transition-colors duration-300">
          <div className="flex items-center gap-3">
            {/* Hamburger Toggle Button for Mobile/Tablet */}
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 -ml-1 text-slate-600 dark:text-slate-400 hover:text-amtc-navy dark:hover:text-white hover:bg-slate-100 dark:hover:bg-cockpit-hover rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amtc-blue/40"
              aria-label="Open sidebar navigation"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Platform Brand Pill */}
            <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-slate-50 dark:bg-cockpit-input border border-slate-200/80 dark:border-cockpit-border shadow-xs transition-colors duration-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 tracking-wider uppercase truncate">
                AMTC CrewEligible
              </span>
              <span className="hidden sm:inline text-slate-300 dark:text-cockpit-border">•</span>
              <span className="hidden sm:inline text-[11px] font-semibold text-amtc-blue truncate">
                {t.nav.executivePortal}
              </span>
            </div>
          </div>

          {/* Session Profile Status + Language Toggle + Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Bilingual Language Switcher */}
            <LanguageToggle />

            {/* Theme Toggle */}
            <ThemeToggle />

            <div className="inline-flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3.5 py-1.5 rounded-full bg-slate-50 dark:bg-cockpit-input border border-slate-200/80 dark:border-cockpit-border text-slate-700 dark:text-slate-300 text-xs font-medium shadow-xs transition-colors duration-300">
              <ShieldCheck className="h-4 w-4 text-amtc-blue shrink-0" />
              <span className="hidden md:inline">
                {t.nav.session}: <strong className="text-amtc-navy dark:text-white font-semibold">{t.nav.directorFull}</strong>
              </span>
              <span className="inline md:hidden font-semibold text-amtc-navy dark:text-white">
                {t.nav.director}
              </span>
              <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400 text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full font-extrabold border border-emerald-200 dark:border-emerald-700/50 tracking-wider">
                {t.nav.fullAccess}
              </span>
            </div>
          </div>
        </header>

        {/* Main Viewport Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative bg-gradient-to-b from-[#F8FAFC] to-[#F1F5F9]/60 dark:from-cockpit-canvas dark:to-cockpit-canvas transition-colors duration-300">
          <div className="max-w-7xl mx-auto pb-12">
            <PageTransition>
              <div className="space-y-6 sm:space-y-8">
                {children}
              </div>
            </PageTransition>
          </div>
        </main>
      </div>
    </div>
  );
}
