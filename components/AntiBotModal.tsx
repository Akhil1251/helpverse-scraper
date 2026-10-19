"use client";

import React from "react";
import { AntiBotSettings } from "@/lib/types";
import { ShieldCheck, X, Zap, Globe, Sliders } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: AntiBotSettings;
  onChange: (settings: AntiBotSettings) => void;
}

export default function AntiBotModal({ isOpen, onClose, settings, onChange }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 border border-slate-200 shadow-2xl text-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-100 text-red-600 border border-red-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                <span className="text-gradient-red">Anti-Bot & Proxy Engine</span>
              </h3>
              <p className="text-xs text-slate-500">Configure proxies and scraper throttling for unlimited leads</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 py-5 text-sm">
          {/* Proxy Toggle */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-red-600" />
                <span className="font-bold text-slate-800">Enable Custom / Rotating Proxy</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.useProxy}
                  onChange={(e) => onChange({ ...settings, useProxy: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>

            {settings.useProxy && (
              <div className="space-y-1.5 pt-2">
                <label className="text-xs text-slate-700 font-semibold">Proxy Connection URL (HTTP / HTTPS / SOCKS5)</label>
                <input
                  type="text"
                  placeholder="http://username:password@proxy-service.com:8080"
                  value={settings.proxyUrl}
                  onChange={(e) => onChange({ ...settings, proxyUrl: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-red-500 font-mono shadow-sm"
                />
                <p className="text-[11px] text-slate-500">
                  Compatible with BrightData, Webshare, SmartProxy, and Oxylabs residential proxies.
                </p>
              </div>
            )}
          </div>

          {/* Request Delay Slider */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-red-600" />
                <span className="font-bold text-slate-800">Anti-Bot Throttling Delay</span>
              </div>
              <span className="font-mono text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded border border-red-200">
                {settings.requestDelayMs} ms
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="3000"
              step="100"
              value={settings.requestDelayMs}
              onChange={(e) => onChange({ ...settings, requestDelayMs: Number(e.target.value) })}
              className="w-full accent-red-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-medium">
              <span>0ms (Turbo)</span>
              <span>1500ms (Safe)</span>
              <span>3000ms (Stealth)</span>
            </div>
          </div>

          {/* Deep Email Crawl Toggle */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="font-bold text-slate-800">Deep Website Email Extraction</span>
              </div>
              <p className="text-xs text-slate-500">Crawls website contact & footer pages for emails & socials</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.deepEmailExtraction}
                onChange={(e) => onChange({ ...settings, deepEmailExtraction: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          {/* User-Agent Rotation */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-800">Rotate Browser Fingerprints & Headers</span>
              <p className="text-xs text-slate-500">Emulates real Chrome, Safari, and Firefox desktop clients</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.rotateUserAgents}
                onChange={(e) => onChange({ ...settings, rotateUserAgents: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 font-bold text-xs text-white transition shadow-sm"
          >
            Save & Apply Settings
          </button>
        </div>
      </div>
    </div>
  );
}
