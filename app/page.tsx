"use client";

import React, { useState, useRef } from "react";
import {
  Search,
  MapPin,
  ShieldCheck,
  Play,
  Square,
  Layers,
  AlertCircle,
  Database,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Sliders,
  Radio,
} from "lucide-react";
import LocationTab from "@/components/LocationTab";
import DataFieldsTab from "@/components/DataFieldsTab";
import DynamicResultsTable from "@/components/DynamicResultsTable";
import AntiBotModal from "@/components/AntiBotModal";
import SearchSubjectAutocomplete from "@/components/SearchSubjectAutocomplete";
import PortalLoaderBadge from "@/components/PortalLoaderBadge";
import WebsiteSplashLoader from "@/components/WebsiteSplashLoader";
import LiveMapsInspectorModal from "@/components/LiveMapsInspectorModal";
import ExhaustionNoticeModal, { ExhaustionNoticeData } from "@/components/ExhaustionNoticeModal";
import * as XLSX from "xlsx";
import { INDIA_LOCATIONS } from "@/data/locations";
import {
  FieldKey,
  ScrapedLead,
  AntiBotSettings,
  ScrapeRequestPayload,
} from "@/lib/types";

export default function ScraperDashboard() {
  // Search Query
  const [keyword, setKeyword] = useState("Chartered Consultant");

  // Active Tab: 'location' | 'fields'
  const [activeTab, setActiveTab] = useState<"location" | "fields">("location");

  // Location State
  const [selectedState, setSelectedState] = useState("Uttar Pradesh");
  const [selectedCity, setSelectedCity] = useState("Noida");

  // Lead Exhaustion Modal State
  const [exhaustionNotice, setExhaustionNotice] = useState<ExhaustionNoticeData | null>(null);
  const [isExhaustionModalOpen, setIsExhaustionModalOpen] = useState(false);

  // Data Fields State
  const [selectedFields, setSelectedFields] = useState<FieldKey[]>([
    "phone",
    "email",
    "website",
    "rating",
    "reviewsCount",
    "fullAddress",
  ]);

  // Scraping Controls
  const [limit, setLimit] = useState(25);
  const [leads, setLeads] = useState<ScrapedLead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live Maps Inspector Modal
  const [isMapsInspectorOpen, setIsMapsInspectorOpen] = useState(false);
  const [currentPincode, setCurrentPincode] = useState<string>("");
  const [currentScrapingLead, setCurrentScrapingLead] = useState<ScrapedLead | null>(null);

  // Anti-Bot & Proxy Settings
  const [isAntiBotModalOpen, setIsAntiBotModalOpen] = useState(false);
  const [antiBotSettings, setAntiBotSettings] = useState<AntiBotSettings>({
    useProxy: false,
    proxyUrl: "",
    requestDelayMs: 600,
    rotateUserAgents: true,
    deepEmailExtraction: true,
    timeoutSeconds: 15,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleExportExcel = () => {
    if (leads.length === 0) return;
    const dataToExport = leads.map((lead) => {
      const row: Record<string, any> = {
        "Business Name": lead.name,
        State: lead.state,
        City: lead.city,
        Pincode: lead.pincode,
      };
      if (selectedFields.includes("phone")) row["Phone Number"] = lead.phone || "";
      if (selectedFields.includes("email")) row["Email Address"] = lead.email || "";
      if (selectedFields.includes("website")) row["Website"] = lead.website || "";
      if (selectedFields.includes("rating")) row["Rating"] = lead.rating || "";
      if (selectedFields.includes("reviewsCount")) row["Reviews Count"] = lead.reviewsCount || "";
      if (selectedFields.includes("fullAddress")) row["Full Address"] = lead.fullAddress || "";
      if (selectedFields.includes("category")) row["Category"] = lead.category || "";
      if (selectedFields.includes("mapsUrl")) row["Google Maps Link"] = lead.mapsUrl || "";
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
    XLSX.writeFile(workbook, `Helpverse_Leads_${selectedCity}_${Date.now()}.xlsx`);
  };

  const startScraping = async () => {
    if (!keyword.trim()) {
      setErrorMessage("Please enter a search keyword (e.g., 'Chartered Consultant').");
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);
    setStatusMessage(`Connecting to Maps Scraper Engine for ${selectedCity}...`);
    setProgressPercent(5);
    setCurrentPincode(selectedCity);
    setIsMapsInspectorOpen(true); // Automatically open the live Maps viewport window!

    abortControllerRef.current = new AbortController();

    const payload: ScrapeRequestPayload = {
      keyword: keyword.trim(),
      state: selectedState,
      city: selectedCity,
      selectedFields,
      limit,
      antiBot: antiBotSettings,
    };

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`Scraper request failed with status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        const newLeadsBatch: ScrapedLead[] = [];

        for (const line of lines) {
          if (!line.trim().startsWith("data:")) continue;
          const jsonStr = line.replace(/^data:\s*/, "").trim();
          try {
            const event = JSON.parse(jsonStr);

            if (event.type === "lead") {
              newLeadsBatch.unshift(event.data);
              setCurrentScrapingLead(event.data);
            } else if (event.type === "status") {
              setStatusMessage(event.data.message);
              if (typeof event.data.progress === "number") {
                setProgressPercent(event.data.progress);
              }
              if (event.data.isDone) {
                setIsLoading(false);
              }
            } else if (event.type === "exhaustion_notice") {
              setExhaustionNotice(event.data);
              setIsExhaustionModalOpen(true);
            } else if (event.type === "info") {
              setStatusMessage(event.data.message);
              if (event.data.currentPincode) {
                setCurrentPincode(event.data.currentPincode);
              }
            } else if (event.type === "error") {
              setErrorMessage(event.data.message);
              setIsLoading(false);
            }
          } catch (e) {
            console.warn("Failed to parse SSE event:", jsonStr);
          }
        }

        if (newLeadsBatch.length > 0) {
          setLeads((prev) => [...newLeadsBatch, ...prev]);
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        setStatusMessage("Scraping task paused by user.");
      } else {
        setErrorMessage(err.message || "Failed to complete scraping task.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const stopScraping = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      setStatusMessage("Scraping stopped.");
    }
  };

  const clearAllResults = () => {
    if (confirm("Are you sure you want to clear current scraped leads?")) {
      setLeads([]);
      setProgressPercent(0);
      setStatusMessage("");
      setErrorMessage(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 bg-ambient-pattern text-zinc-900 pb-20 selection:bg-red-500 selection:text-white">
      {/* Website Loading Splash Overlay */}
      <WebsiteSplashLoader />

      {/* 1. Frosted Glass Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-zinc-200/70 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Helpverse Portal Loader Logo Badge */}
            <PortalLoaderBadge size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight text-zinc-900">
                  Helpverse <span className="text-gradient-crimson">Maps Scraper</span>
                </h1>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200/60">
                  SaaS Pro
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 hidden sm:block font-medium">
                Targeted B2B Maps Extractor & Automated Email Enrichment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Live Maps Inspector Trigger */}
            <button
              onClick={() => setIsMapsInspectorOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition shadow-2xs"
              title="Open Google Maps live search viewport"
            >
              <Radio className={`w-3.5 h-3.5 text-red-600 ${isLoading ? "animate-pulse" : ""}`} />
              <span>Maps Live Inspector</span>
            </button>

            {/* Anti-Bot & Proxy Status Button */}
            <button
              onClick={() => setIsAntiBotModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition shadow-2xs ${
                antiBotSettings.useProxy
                  ? "bg-red-50/80 text-red-700 border-red-200 hover:bg-red-100/60"
                  : "bg-white text-zinc-700 border-zinc-200/80 hover:bg-zinc-50"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-red-600" />
              <span>{antiBotSettings.useProxy ? "Proxy: Active" : "Anti-Bot Settings"}</span>
            </button>

            {leads.length > 0 && (
              <button
                onClick={clearAllResults}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200/60 transition"
                title="Clear Data"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {/* Hero Headline Section */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200/60">
            <Sparkles className="w-3 h-3 text-red-600" />
            <span>High-Speed Maps Lead Generator</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900">
            Extract Verified Client Leads <span className="text-gradient-crimson">with Maps & Emails</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 font-normal">
            Choose state, city, and pincodes to micro-target local businesses with automatic email and phone enrichment.
          </p>
        </div>

        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50/80 border border-red-200 text-red-800 text-xs flex items-center justify-between shadow-2xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span className="font-semibold">{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-600 hover:text-red-900 font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* Search & Configuration Card */}
        <div className="stripe-card rounded-2xl p-5 border border-zinc-200/80 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search Bar with 200 Google Maps Subjects Autocomplete */}
            <SearchSubjectAutocomplete
              value={keyword}
              onChange={setKeyword}
              placeholder="Search or pick from 200 subjects (e.g., Real estate brokers, NEET coaching, Dentists)..."
            />

            {/* Limit Selector */}
            <div className="flex items-center gap-2 bg-zinc-50/70 border border-zinc-200 rounded-xl px-3.5 py-2.5 shadow-2xs">
              <span className="text-xs text-zinc-500 font-bold shrink-0">Limit:</span>
              <select
                value={limit >= 999999 ? "unlimited" : limit}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "unlimited") {
                    setLimit(999999);
                  } else {
                    setLimit(Number(val));
                  }
                }}
                className="bg-transparent text-xs text-zinc-900 font-extrabold focus:outline-none cursor-pointer"
              >
                <option value={10}>10 Leads</option>
                <option value={25}>25 Leads</option>
                <option value={50}>50 Leads</option>
                <option value={100}>100 Leads</option>
                <option value={250}>250 Leads</option>
                <option value={500}>500 Leads</option>
                <option value={1000}>1,000 Leads</option>
                <option value={2500}>2,500 Leads</option>
                <option value={5000}>5,000 Leads</option>
                <option value={10000}>10,000 Leads</option>
                <option value="unlimited">Unlimited (∞</option>
              </select>

              {limit < 999999 && (
                <input
                  type="number"
                  min="1"
                  max="100000"
                  value={limit}
                  onChange={(e) => setLimit(Math.max(1, Number(e.target.value)))}
                  className="w-16 px-1.5 py-0.5 text-xs text-center font-bold bg-white border border-zinc-300 rounded focus:outline-none focus:border-red-500"
                  title="Or type exact number of leads"
                />
              )}
            </div>

            {/* Run / Stop Button */}
            {!isLoading ? (
              <button
                onClick={startScraping}
                className="flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-black tracking-wide uppercase transition shadow-md shadow-red-600/20 hover:scale-[1.01] active:scale-[0.99]"
              >
                <Play className="w-4 h-4 fill-white" />
                Run Scraper
              </button>
            ) : (
              <button
                onClick={stopScraping}
                className="flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-black tracking-wide uppercase transition shadow-sm"
              >
                <Square className="w-4 h-4 fill-white" />
                Stop Scraper
              </button>
            )}
          </div>

          {/* Preset Niches */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
            <span className="text-zinc-400 font-semibold text-[11px]">Popular Niches:</span>
            {[
              "Chartered Consultant",
              "Real Estate Consultant",
              "Digital Marketing Agency",
              "Dental Clinic",
              "Advocate & Legal Firm",
            ].map((niche) => (
              <button
                key={niche}
                type="button"
                onClick={() => setKeyword(niche)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  keyword === niche
                    ? "bg-red-50 text-red-700 border border-red-200 font-bold"
                    : "bg-zinc-50 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200/70"
                }`}
              >
                {niche}
              </button>
            ))}
          </div>
        </div>

        {/* Minimalist Segmented Tabs Card */}
        <div className="stripe-card rounded-2xl border border-zinc-200/80 overflow-hidden">
          {/* Segmented Control Bar */}
          <div className="p-3 bg-zinc-50/50 border-b border-zinc-200/70 flex items-center justify-between">
            <div className="bg-zinc-200/60 p-1 rounded-xl inline-flex gap-1">
              <button
                onClick={() => setActiveTab("location")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                  activeTab === "location"
                    ? "bg-white text-zinc-900 shadow-xs border border-zinc-200/70"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/40"
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-red-600" />
                <span>1. City & State Location</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200/60">
                  {selectedCity}, {selectedState}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("fields")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                  activeTab === "fields"
                    ? "bg-white text-zinc-900 shadow-xs border border-zinc-200/70"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/40"
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-red-600" />
                <span>2. Data Fields Customizer</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200/60">
                  {selectedFields.length} Columns
                </span>
              </button>
            </div>

            <span className="text-[11px] text-zinc-400 font-medium hidden md:inline">
              Selected fields automatically format as table columns below
            </span>
          </div>

          {/* Tab Content Body */}
          <div className="p-5">
            {activeTab === "location" ? (
              <LocationTab
                selectedState={selectedState}
                onStateChange={setSelectedState}
                selectedCity={selectedCity}
                onCityChange={setSelectedCity}
              />
            ) : (
              <DataFieldsTab
                selectedFields={selectedFields}
                onFieldsChange={setSelectedFields}
              />
            )}
          </div>
        </div>

        {/* Live Status Banner if scraping is active */}
        {isLoading && (
          <div className="p-4 rounded-xl border border-red-200 bg-red-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-zinc-900">{statusMessage || "Scraping in progress..."}</p>
                <p className="text-[11px] text-zinc-500">
                  Target: {keyword} across {selectedCity}, {selectedState} (Full City Coverage)
                </p>
              </div>
            </div>
            <div className="text-xs font-mono text-red-700 font-extrabold bg-white px-3 py-1.5 rounded-lg border border-red-200 shadow-2xs">
              {limit >= 999999 ? `${leads.length} Leads (Unlimited Mode)` : `${leads.length} / ${limit} Leads Gathered`}
            </div>
          </div>
        )}

        {/* Dynamic Results Table (Selected tabs become table headers) */}
        <DynamicResultsTable
          leads={leads}
          selectedFields={selectedFields}
          isLoading={isLoading}
          statusMessage={statusMessage}
          progress={progressPercent}
        />
      </main>

      {/* Anti-Bot & Proxy Modal */}
      <AntiBotModal
        isOpen={isAntiBotModalOpen}
        onClose={() => setIsAntiBotModalOpen(false)}
        settings={antiBotSettings}
        onChange={setAntiBotSettings}
      />

      {/* Live Google Maps Inspector Window */}
      <LiveMapsInspectorModal
        isOpen={isMapsInspectorOpen}
        onClose={() => setIsMapsInspectorOpen(false)}
        isLoading={isLoading}
        keyword={keyword}
        city={selectedCity}
        state={selectedState}
        currentPincode={currentPincode}
        currentScrapingLead={currentScrapingLead}
        scrapedLeads={leads}
      />

      {/* Exhaustion Notice Popup Modal */}
      <ExhaustionNoticeModal
        isOpen={isExhaustionModalOpen}
        onClose={() => setIsExhaustionModalOpen(false)}
        data={exhaustionNotice}
        onExportExcel={handleExportExcel}
      />
    </div>
  );
}
