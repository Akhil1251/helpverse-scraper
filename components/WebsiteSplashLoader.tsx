"use client";

import React, { useState, useEffect } from "react";
import PortalLoaderBadge from "./PortalLoaderBadge";

export default function WebsiteSplashLoader() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState("Initializing Helpverse Engine...");

  useEffect(() => {
    // 4-second smooth progress ticker
    const intervalTime = 40; // update every 40ms
    const totalSteps = 4000 / intervalTime; // 100 steps
    let currentStep = 0;

    const progressTimer = setInterval(() => {
      currentStep++;
      const currentPercent = Math.min(100, Math.round((currentStep / totalSteps) * 100));
      setProgress(currentPercent);

      // Dynamic cinematic loading steps
      if (currentPercent < 30) {
        setLoadingStep("Connecting to Google Maps Lead Engine...");
      } else if (currentPercent < 60) {
        setLoadingStep("Loading 36 Indian States & 200 Prospecting Subjects...");
      } else if (currentPercent < 85) {
        setLoadingStep("Calibrating Deep Email Crawler & Proxy Shield...");
      } else {
        setLoadingStep("Helpverse Intelligence Platform Ready.");
      }

      if (currentStep >= totalSteps) {
        clearInterval(progressTimer);
      }
    }, intervalTime);

    // Fade out after exactly 4.0 seconds (4000ms)
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 4000);

    // Remove from DOM after fade animation completes
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 4600);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] w-screen h-screen flex flex-col items-center justify-center bg-[#07090e] text-white transition-all duration-700 select-none overflow-hidden ${
        isFading ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Cinematic Ambient Background Glow */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-red-600/15 via-rose-500/10 to-transparent blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Center Hero Stage */}
      <div className="relative z-10 flex flex-col items-center gap-7 max-w-md w-full px-6">
        {/* Scaled Portal Loader Badge in full spotlight */}
        <div className="relative p-6 rounded-3xl bg-black/60 border border-white/10 shadow-[0_0_50px_rgba(220,38,38,0.25)] backdrop-blur-xl scale-125 sm:scale-150 transition-transform">
          <PortalLoaderBadge size="md" />
        </div>

        {/* Brand Title & Subtext */}
        <div className="flex flex-col items-center text-center space-y-2 pt-2">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-black tracking-[0.25em] text-white uppercase">
              HELPVERSE
            </h1>
            <span className="text-[10px] font-extrabold tracking-widest uppercase px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30">
              MAPS PRO
            </span>
          </div>

          <p className="text-xs font-medium text-zinc-400 tracking-wide transition-all duration-200 h-4">
            {loadingStep}
          </p>
        </div>

        {/* 4-Second Smooth Progress Bar */}
        <div className="w-full max-w-xs space-y-2 pt-1">
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden p-[1px] border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-white rounded-full transition-all duration-75 ease-out shadow-[0_0_12px_rgba(239,68,68,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500">
            <span>4s System Boot</span>
            <span className="text-red-400 font-bold">{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
