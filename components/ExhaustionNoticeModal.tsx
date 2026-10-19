"use client";

import React from "react";
import {
  CheckCircle2,
  Info,
  X,
  Building,
  MapPin,
  Layers,
  FileSpreadsheet,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export interface ExhaustionNoticeData {
  requestedLimit: number;
  totalYielded: number;
  keyword: string;
  city: string;
  state: string;
  reason: "exhausted" | "completed";
  message: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: ExhaustionNoticeData | null;
  onExportExcel: () => void;
}

export default function ExhaustionNoticeModal({
  isOpen,
  onClose,
  data,
  onExportExcel,
}: Props) {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header gradient banner */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition"
            title="Close Notice"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <span className="p-1.5 bg-white/20 rounded-xl backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </span>
            <span className="text-xs font-black tracking-widest uppercase text-red-100">
              City Sweep Complete
            </span>
          </div>

          <h3 className="text-xl font-black tracking-tight text-white">
            Search Terminated: Available Lead Pool Exhausted
          </h3>
          <p className="text-xs text-red-100 mt-1">
            Google Maps indexing for &quot;{data.keyword}&quot; across {data.city}, {data.state}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Metrics comparison */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-center">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                Target Limit
              </span>
              <span className="text-2xl font-black text-zinc-900 font-mono mt-1 block">
                {data.requestedLimit}
              </span>
              <span className="text-[11px] text-zinc-400">Leads requested</span>
            </div>

            <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200 text-center">
              <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider block">
                Leads Extracted
              </span>
              <span className="text-2xl font-black text-red-600 font-mono mt-1 block">
                {data.totalYielded}
              </span>
              <span className="text-[11px] text-red-600/80 font-semibold">
                100% of available Google listings
              </span>
            </div>
          </div>

          {/* Explanation Alert Card */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-amber-950">
              <p className="font-extrabold text-amber-900">
                Why did scraping finish at {data.totalYielded} instead of {data.requestedLimit}?
              </p>
              <p className="leading-relaxed text-amber-800">
                Our engine automatically scanned all commercial sectors, main business hubs, and
                zones across <strong>{data.city}</strong>. Google Maps only has{" "}
                <strong>{data.totalYielded} verified business listings</strong> registered for{" "}
                &quot;{data.keyword}&quot; in this entire city.
              </p>
              <p className="text-[11px] text-amber-700 pt-1">
                Rather than generating fake entries or hanging, the scraper cleanly finalized and
                saved all {data.totalYielded} authentic leads for you.
              </p>
            </div>
          </div>

          {/* Location Scope Details */}
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-zinc-100/70 border border-zinc-200/60 text-xs text-zinc-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-600" />
              <span>
                Coverage Scope: <strong>Entire City of {data.city}</strong> ({data.state})
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-white border border-zinc-200 text-[10px] font-bold text-zinc-700">
              Complete Scan
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => {
                onExportExcel();
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold transition flex items-center gap-2 border border-zinc-300 shadow-2xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Export {data.totalYielded} to Excel
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm"
            >
              <span>View In Table</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
