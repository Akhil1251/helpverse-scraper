"use client";

import React, { useState } from "react";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Sparkles,
} from "lucide-react";
import PortalLoaderBadge from "./PortalLoaderBadge";

interface Props {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess: (user: { email: string; role: string }) => void;
  isMandatory?: boolean;
}

export default function LoginModal({
  isOpen,
  onClose,
  onSuccess,
  isMandatory = true,
}: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both ID and Password.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed. Access denied.");
      }

      onSuccess(data.user);
      if (onClose) onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to log in.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-zinc-200/90 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Gradient Banner */}
        <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white p-6 relative text-center border-b border-zinc-800">
          <div className="flex justify-center mb-3">
            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/20 shadow-inner backdrop-blur-md">
              <PortalLoaderBadge size="md" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 text-[11px] font-extrabold uppercase tracking-widest mb-2 font-mono">
            <Lock className="w-3 h-3 text-red-500" />
            Restricted System Lock
          </div>

          <h2 className="text-xl font-black tracking-tight text-white">
            Helpverse Scraper Portal
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Please authenticate with authorized credentials to unlock scraping operations.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5 animate-in slide-in-from-top-1">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-extrabold block">Authentication Failed</span>
                <span className="text-[11px] leading-relaxed block">{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Email / ID Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 flex items-center justify-between">
              <span>Admin ID / Email</span>
              <span className="text-[10px] font-mono text-zinc-400">Required</span>
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Admin@helpverse.in"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-300 text-sm text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-medium transition"
                required
                autoFocus
              />
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 flex items-center justify-between">
              <span>Password</span>
              <span className="text-[10px] font-mono text-zinc-400">Bcrypt Protected</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-50 border border-zinc-300 text-sm text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-medium transition"
                required
              />
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-zinc-400 hover:text-zinc-700 absolute right-3 top-2.5 transition"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Unlock Scraper Access</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Security Footer */}
          <div className="pt-3 border-t border-zinc-100 flex items-center justify-center gap-2 text-[11px] text-zinc-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted Session • Bcrypt 12-Round Salting</span>
          </div>
        </form>
      </div>
    </div>
  );
}
