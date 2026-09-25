"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Users, UserPlus, CheckCircle, Upload, LayoutDashboard, X, AlertTriangle, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { logout } from "@/app/actions/authActions";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";

interface SidebarProps {
  isMobileOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isMobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { name: t.nav.dashboard, href: "/admin", icon: LayoutDashboard },
    { name: t.nav.students, href: "/admin/students", icon: Users },
    { name: t.nav.addStudent, href: "/admin/students/new", icon: UserPlus },
    { name: t.nav.alerts, href: "/admin/alerts", icon: AlertTriangle },
    { name: t.nav.eligibility, href: "/admin/eligibility", icon: CheckCircle },
    { name: t.nav.import, href: "/admin/import", icon: Upload },
  ];

  return (
    <aside
      className={cn(
        "flex h-screen flex-col bg-amtc-navy border-r border-amtc-navyDark/80 shadow-nav select-none shrink-0 transition-transform duration-300 ease-in-out z-50",
        // Mobile Drawer styles
        "fixed inset-y-0 left-0 w-72 lg:static lg:w-64 lg:translate-x-0",
        isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
      )}
    >
      {/* Executive Branding Header & Logo */}
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between mb-3 lg:hidden">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">{t.nav.navigation}</span>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center justify-center px-3.5 py-2.5 mb-4 bg-white/5 border border-white/10 rounded-xl shadow-inner backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-200">
          <Image
            alt="AMTC Executive Portal"
            className="object-contain w-full h-[52px]"
            height={65}
            priority
            src="/amtc-logo-dark.png"
            unoptimized
            width={200}
          />
        </div>

        <div className="flex items-center justify-between px-1.5 pb-2 border-b border-white/10">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
              {t.nav.executiveConsole}
            </span>
          </div>
          <span className="text-[10px] font-semibold text-amtc-blue bg-amtc-blue/15 px-2 py-0.5 rounded border border-amtc-blue/30 tracking-wide">
            {t.nav.portal}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex flex-1 flex-col overflow-y-auto px-3 py-2">
        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : item.href === "/admin/students"
                ? pathname === "/admin/students" ||
                  (pathname.startsWith("/admin/students/") && pathname !== "/admin/students/new")
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <motion.div
                key={item.href}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15 }}
              >
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-amtc-blue text-white shadow-lg shadow-amtc-blue/25 font-semibold"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeSidebarIndicator"
                      className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-white shadow-sm"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  <item.icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0 transition-colors duration-200",
                      isActive
                        ? "text-white"
                        : "text-slate-400 group-hover:text-amtc-blueLight"
                    )}
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </div>
      
      {/* Sidebar Language Switcher & Active Admin Session Profile */}
      <div className="p-3 border-t border-white/10 bg-black/20 backdrop-blur-sm space-y-2">
        <LanguageToggle variant="sidebar" />

        <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5 group">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amtc-blue to-amtc-navy text-white border border-amtc-blue/40 font-bold text-xs shadow-sm">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-white truncate">{t.nav.director}</p>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amtc-blue/20 text-amtc-blue border border-amtc-blue/30 tracking-wider">
                {t.nav.admin}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">admin911@amtc.ma</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400/40"
              title={t.nav.logout}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
