"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Image from "next/image";
import { motion } from "framer-motion";
import { login } from "@/app/actions/authActions";
import { Lock, User, AlertCircle, Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";

// Client-side wrapper for the submit button
function SubmitButton({ authenticatingText, accessControlText }: { authenticatingText: string; accessControlText: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full group relative flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl text-sm font-semibold text-white transition-all duration-200 shadow-lg ${
        pending
          ? "bg-blue-900/60 cursor-not-allowed opacity-75 border border-blue-500/30"
          : "bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-900/40 hover:shadow-blue-500/30 active:scale-[0.98] border border-blue-400/30"
      }`}
    >
      {pending ? (
        <>
          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>{authenticatingText}</span>
        </>
      ) : (
        <>
          <Lock className="w-4 h-4 text-blue-200 transition-transform group-hover:scale-110" />
          <span>{accessControlText}</span>
          <ArrowRight className="w-4 h-4 text-white/70 ml-1 transition-transform group-hover:translate-x-0.5" />
        </>
      )}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(login, null);
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-x-hidden selection:bg-blue-500 selection:text-white">
      {/* 1. Full-screen fixed background image positioned to frame students perfectly */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-[center_20%] md:bg-[center_22%] bg-no-repeat bg-fixed"
        style={{ backgroundImage: "url('/background_login.png')" }}
      />

      {/* 2. Rich AMTC Navy Blue overlay with backdrop-blur */}
      <div className="fixed inset-0 z-0 bg-[#011E60]/85 backdrop-blur-sm pointer-events-none" />

      {/* Subtle aviation ambient glow & depth gradient */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/15 via-transparent to-black/40 pointer-events-none" />

      {/* 3. Centered sleek glassmorphic login card with smooth Framer Motion entrance */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md my-auto"
      >
        <div className="relative backdrop-blur-xl bg-slate-900/65 border border-white/20 rounded-3xl p-6 sm:p-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden">
          
          {/* Top highlight reflection bar */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          {/* Language Toggle - top right corner of card */}
          <div className="absolute top-4 right-4 z-20">
            <LanguageToggle variant="login" />
          </div>

          {/* Header & AMTC Branding */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="flex items-center justify-center px-4 py-2.5 mb-5 bg-white/10 border border-white/15 rounded-2xl shadow-inner backdrop-blur-md">
              <Image
                src="/amtc-logo-dark.png"
                alt="AMTC Executive Portal"
                width={180}
                height={50}
                className="h-10 w-auto object-contain"
                priority
                unoptimized
              />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-200 text-xs font-semibold mb-3 tracking-wide uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {t.login.secureAccess}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {t.login.commandCenter}
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-300">
              {t.login.platformAdmin}
            </p>
          </div>

          {/* Form */}
          <form action={formAction} className="space-y-5">
            {state?.error && (
              <div className="rounded-xl bg-red-500/20 border border-red-500/40 p-4 backdrop-blur-md flex items-start gap-3 text-red-200 animate-fade-in">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-white">{t.login.authFailed}</h3>
                  <p className="mt-0.5 text-xs text-red-200 leading-relaxed">{state.error}</p>
                </div>
              </div>
            )}

            {/* Admin Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2"
              >
                {t.login.adminEmail}
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-300">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:bg-white/15 transition-all duration-200"
                  placeholder="admin911@amtc.ma"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2"
              >
                {t.login.password}
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-300">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="block w-full pl-10 pr-11 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:bg-white/15 transition-all duration-200"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-300 hover:text-white transition-colors"
                  aria-label={showPassword ? t.login.hidePassword : t.login.showPassword}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4 text-slate-300" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/30 bg-white/10 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2.5 block text-xs font-medium text-slate-200 cursor-pointer select-none"
                >
                  {t.login.keepVerified}
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <SubmitButton
              authenticatingText={t.login.authenticating}
              accessControlText={t.login.accessControl}
            />
          </form>

          {/* Security badge footer inside card */}
          <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-center gap-2 text-slate-300/80 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{t.login.encryptionBadge}</span>
          </div>
        </div>

        {/* Global Footer info */}
        <p className="mt-6 text-center text-xs text-slate-300/70 font-medium tracking-wide">
          AMTC Aviation &copy; {new Date().getFullYear()} &bull; {t.login.authorizedOnly}
        </p>
      </motion.div>
    </div>
  );
}
