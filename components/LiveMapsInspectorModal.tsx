"use client";

import React, { useState } from "react";
import { ScrapedLead } from "@/lib/types";
import {
  MapPin,
  ExternalLink,
  Minimize2,
  Maximize2,
  X,
  Radio,
  Building,
  Phone,
  Mail,
  Globe,
  Star,
  CheckCircle2,
  Eye,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  keyword: string;
  city: string;
  state: string;
  currentPincode?: string;
  currentScrapingLead: ScrapedLead | null;
  scrapedLeads: ScrapedLead[];
}

export default function LiveMapsInspectorModal({
  isOpen,
  onClose,
  isLoading,
  keyword,
  city,
  state,
  currentPincode,
  currentScrapingLead,
  scrapedLeads,
}: Props) {
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isOpen) return null;

  const currentQuery = currentPincode && !currentPincode.includes(city)
    ? `${keyword} in ${city} ${currentPincode} ${state}`.trim()
    : `${keyword} in ${city} ${state}`.trim();
  const mapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    currentQuery
  )}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  // If minimized to Picture-in-Picture in bottom right corner
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 bg-white/95 backdrop-blur-md rounded-2xl border border-zinc-300 shadow-2xl p-3 w-80 animate-in slide-in-from-bottom-5">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
            <span className="text-xs font-black text-zinc-900">Maps Live Inspector</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(false)}
              className="p-1 text-zinc-500 hover:text-zinc-900 rounded"
              title="Expand window"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1 text-zinc-500 hover:text-zinc-900 rounded"
              title="Close window"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="pt-2 text-xs space-y-1">
          <p className="font-semibold text-zinc-800 truncate">
            {currentScrapingLead ? currentScrapingLead.name : `Scanning ${city}...`}
          </p>
          <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
            <span>{scrapedLeads.length} leads extracted</span>
            <span className="text-red-600 font-bold">LIVE</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[85vh] max-h-[750px] bg-white rounded-3xl border border-zinc-200 shadow-2xl flex flex-col overflow-hidden">
        {/* Browser Top Window Bar */}
        <div className="px-4 py-3 bg-zinc-900 text-white flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-3">
            {/* Mac style window dots */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={onClose}
                className="w-3 h-3 rounded-full bg-red-500 hover:opacity-80 transition"
                title="Close Window"
              />
              <button
                onClick={() => setIsMinimized(true)}
                className="w-3 h-3 rounded-full bg-amber-500 hover:opacity-80 transition"
                title="Minimize Window"
              />
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>

            <div className="flex items-center gap-2 pl-2">
              <Radio className="w-4 h-4 text-red-500 animate-pulse" />
              <span className="text-xs font-black tracking-wide text-zinc-100 uppercase">
                Google Maps Live Scraping Viewport
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600/30 text-red-400 border border-red-500/30 font-mono">
                {isLoading ? "LIVE EXTRACTING" : "STANDBY"}
              </span>
            </div>
          </div>

          {/* Browser Address Bar Simulator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-zinc-800/90 rounded-lg text-xs font-mono text-zinc-300 max-w-md truncate border border-zinc-700/60">
            <span className="text-zinc-500">maps.google.com/search?q=</span>
            <span className="text-red-400 font-semibold truncate">{currentQuery}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
              title="Minimize to Picture-in-Picture"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
              title="Close Inspector"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content: Split View between Google Maps Embed and Live Extractor Feed */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-zinc-100">
          {/* Left: Interactive Maps Viewport (7 cols) */}
          <div className="lg:col-span-7 relative h-full bg-zinc-200 border-r border-zinc-300 overflow-hidden">
            {/* Live Radar Scanner Overlay */}
            {isLoading && (
              <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-300 shadow-md flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                <span className="text-xs font-bold text-zinc-900 font-mono">
                  Scanning {currentPincode ? `Pincode: ${currentPincode}` : city}...
                </span>
              </div>
            )}

            {/* Embedded Google Maps Viewport */}
            <iframe
              src={mapsEmbedUrl}
              className="w-full h-full border-0"
              title="Google Maps Live Search"
              loading="lazy"
              allowFullScreen
            />

            {/* Overlay Banner at bottom of map */}
            <div className="absolute bottom-3 left-3 right-3 bg-zinc-900/90 backdrop-blur-md rounded-xl p-3 text-white text-xs border border-white/10 flex items-center justify-between z-10 shadow-lg">
              <div className="flex items-center gap-2 truncate">
                <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                <span className="font-semibold truncate">
                  Searching: <span className="text-red-400">{currentQuery}</span>
                </span>
              </div>
              <span className="font-mono text-zinc-400 text-[11px] shrink-0 font-bold">
                {scrapedLeads.length} Captured
              </span>
            </div>
          </div>

          {/* Right: Live Extractor Feed (5 cols) */}
          <div className="lg:col-span-5 flex flex-col h-full bg-white overflow-hidden">
            <div className="p-3.5 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-red-600" />
                  Live Card Extraction Stream
                </h4>
                <p className="text-[11px] text-zinc-500">
                  Data points captured from Google Maps in real time
                </p>
              </div>
              <span className="text-xs font-bold font-mono bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-200">
                {scrapedLeads.length} Leads
              </span>
            </div>

            {/* Live Feed Cards List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y divide-transparent">
              {scrapedLeads.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center text-zinc-400 space-y-2">
                  <Building className="w-10 h-10 text-zinc-300 animate-pulse" />
                  <p className="text-xs font-bold text-zinc-700">Connecting to Google Maps...</p>
                  <p className="text-[11px] text-zinc-400 max-w-xs">
                    As each card is scraped from Google Maps, it will flash and show all extracted fields right here.
                  </p>
                </div>
              ) : (
                scrapedLeads.map((lead, idx) => (
                  <div
                    key={lead.id || idx}
                    className={`p-3 rounded-xl border transition-all ${
                      idx === 0
                        ? "bg-red-50/70 border-red-400 shadow-sm animate-in slide-in-from-top-3"
                        : "bg-white border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold text-zinc-900 truncate">
                            {lead.name}
                          </span>
                          {idx === 0 && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-red-600 text-white uppercase animate-pulse">
                              NEW
                            </span>
                          )}
                        </div>

                        {/* Location & Pincode */}
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-red-500" />
                            {lead.city}, {lead.pincode}
                          </span>
                          {lead.rating && (
                            <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                              <Star className="w-3 h-3 fill-amber-500" />
                              {lead.rating}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-zinc-400 font-bold shrink-0">
                        #{scrapedLeads.length - idx}
                      </span>
                    </div>

                    {/* Extracted Details Pill Row */}
                    <div className="mt-2.5 pt-2 border-t border-zinc-100 grid grid-cols-2 gap-1.5 text-[11px]">
                      {lead.phone && (
                        <div className="flex items-center gap-1 text-zinc-700 truncate">
                          <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="font-mono truncate">{lead.phone}</span>
                        </div>
                      )}

                      {lead.email && (
                        <div className="flex items-center gap-1 text-red-700 truncate font-semibold">
                          <Mail className="w-3 h-3 text-red-600 shrink-0" />
                          <span className="truncate">{lead.email}</span>
                        </div>
                      )}

                      {lead.website && (
                        <div className="flex items-center gap-1 text-blue-600 truncate">
                          <Globe className="w-3 h-3 text-blue-500 shrink-0" />
                          <span className="truncate">{lead.website.replace(/^https?:\/\/(www\.)?/, "")}</span>
                        </div>
                      )}

                      {lead.status === "verified" && (
                        <div className="flex items-center gap-1 text-emerald-700 font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>Verified Lead</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
