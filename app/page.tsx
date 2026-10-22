"use client";

import React, { useState, useRef, useEffect } from "react";
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
  Lock,
  LogOut,
  UserCheck,
  Globe,
  FileSpreadsheet,
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
import LoginModal from "@/components/LoginModal";
import * as XLSX from "xlsx";
import {
  FieldKey,
  ScrapedLead,
  AntiBotSettings,
  ScrapeRequestPayload,
  LocationTarget,
} from "@/lib/types";

export default function ScraperDashboard() {
  // Search Query
  const [keyword, setKeyword] = useState("Chartered Consultant");

  // Active Tab: 'location' | 'fields'
  const [activeTab, setActiveTab] = useState<"location" | "fields">("location");

  // Multi-Location State (Multiple States and Multiple Cities)
  const [selectedStates, setSelectedStates] = useState<string[]>(["Uttar Pradesh"]);
  const [selectedCities, setSelectedCities] = useState<LocationTarget[]>([
    { state: "Uttar Pradesh", city: "Noida" },
  ]);
  const [limitPerCity, setLimitPerCity] = useState<number>(100);

  // Active City during scraping
  const [activeCity, setActiveCity] = useState<string>("Noida");
  const [activeState, setActiveState] = useState<string>("Uttar Pradesh");

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<{ email: string; role: string } | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Check authentication on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await fetch("/api/auth/check");
        const data = await res.json();
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        } else {
          setIsLoginModalOpen(true); // Mandatory lock on load!
        }
      } catch {
        setIsLoginModalOpen(true);
      } finally {
        setIsAuthLoading(false);
      }
    };
    checkAuthStatus();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    } finally {
      setCurrentUser(null);
      setIsLoginModalOpen(true);
    }
  };

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

  const totalCalculatedLimit = selectedCities.length * limitPerCity;

  // Normalizes phone numbers to standard 10-digit digits for unique ID checks
  const normalizePhone = (phone?: string) => {
    if (!phone) return "";
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
    if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
    return digits;
  };

  // Single-sheet export for all cities with 100% UNIQUE mobile numbers (no duplicates)
  const handleExportExcel = () => {
    if (leads.length === 0) return;

    // Filter leads to strictly unique mobile numbers and business names
    const seenPhones = new Set<string>();
    const seenNames = new Set<string>();
    const uniqueLeads = leads.filter((lead) => {
      const normPhone = normalizePhone(lead.phone);
      const normName = lead.name.toLowerCase().trim();

      if (normPhone) {
        if (seenPhones.has(normPhone)) return false;
        seenPhones.add(normPhone);
      } else {
        if (seenNames.has(normName)) return false;
        seenNames.add(normName);
      }
      return true;
    });

    const getCityState = (lead: ScrapedLead) => {
      let city = (lead.city || "").trim();
      let state = (lead.state || "").trim();

      if (!city && lead.fullAddress) {
        const parts = lead.fullAddress.split(",").map((p) => p.trim());
        if (parts.length >= 2) {
          city = parts[parts.length - 2] || "";
        }
      }
      if (!state && lead.fullAddress) {
        const parts = lead.fullAddress.split(",").map((p) => p.trim());
        if (parts.length >= 1) {
          state = parts[parts.length - 1].replace(/\d{6}/, "").trim() || "";
        }
      }

      return {
        city: city || selectedCities[0]?.city || "Noida",
        state: state || selectedCities[0]?.state || "Uttar Pradesh",
      };
    };

    const dataToExport = uniqueLeads.map((lead) => {
      const { city, state } = getCityState(lead);
      const row: Record<string, any> = {
        "Business Name": lead.name || "",
        "City": city,
        "State": state,
        "Pincode": lead.pincode || "",
        "Phone / Mobile Number (Unique)": lead.phone || "",
      };
      if (selectedFields.includes("email")) row["Email Address"] = lead.email || "";
      if (selectedFields.includes("website")) row["Website"] = lead.website || "";
      if (selectedFields.includes("rating")) row["Rating"] = lead.rating || "";
      if (selectedFields.includes("reviewsCount")) row["Reviews Count"] = lead.reviewsCount || "";
      if (selectedFields.includes("fullAddress")) row["Full Address"] = lead.fullAddress || "";
      if (selectedFields.includes("category")) row["Category"] = lead.category || "";
      if (selectedFields.includes("socials")) {
        row["LinkedIn"] = lead.socials?.linkedin || "";
        row["Instagram"] = lead.socials?.instagram || "";
        row["Facebook"] = lead.socials?.facebook || "";
      }
      if (selectedFields.includes("mapsUrl")) row["Google Maps Link"] = lead.mapsUrl || "";
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Unique Leads");

    const maxCols = Object.keys(dataToExport[0] || {}).map((key) => ({
      wch: Math.max(key.length, 18),
    }));
    worksheet["!cols"] = maxCols;

    const fileCityLabel =
      selectedCities.length === 1
        ? selectedCities[0].city
        : `${selectedCities.length}_Cities`;
    XLSX.writeFile(workbook, `Helpverse_Unique_Leads_${fileCityLabel}_${Date.now()}.xlsx`);
  };

  const startScraping = async () => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      setErrorMessage("Unauthorized: Please log in with admin credentials to use the scraper.");
      return;
    }

    if (!keyword.trim()) {
      setErrorMessage("Please enter a search keyword (e.g., 'Chartered Consultant').");
      return;
    }

    if (selectedCities.length === 0) {
      setErrorMessage("Please select at least one City in the Location tab.");
      setActiveTab("location");
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);
    const firstCity = selectedCities[0].city;
    const firstState = selectedCities[0].state;
    setActiveCity(firstCity);
    setActiveState(firstState);
    setCurrentPincode(firstCity);

    setStatusMessage(
      `Initializing multi-city scraper for ${selectedCities.length} locations (${limitPerCity} leads each)...`
    );
    setProgressPercent(3);
    setIsMapsInspectorOpen(true); // Automatically open the live Maps viewport window!

    abortControllerRef.current = new AbortController();

    const payload: ScrapeRequestPayload = {
      keyword: keyword.trim(),
      targets: selectedCities,
      limitPerCity,
      limit: totalCalculatedLimit,
      state: firstState,
      city: firstCity,
      selectedFields,
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
              if (event.data.city) setActiveCity(event.data.city);
              if (event.data.state) setActiveState(event.data.state);
            } else if (event.type === "status") {
              setStatusMessage(event.data.message);
              if (typeof event.data.progress === "number") {
                setProgressPercent(event.data.progress);
              }
              if (event.data.currentCity) setActiveCity(event.data.currentCity);
              if (event.data.currentState) setActiveState(event.data.currentState);
              if (event.data.isDone) {
                setIsLoading(false);
              }
            } else if (event.type === "exhaustion_notice") {
              setExhaustionNotice(event.data);
              setIsExhaustionModalOpen(true);
            } else if (event.type === "info") {
              setStatusMessage(event.data.message);
              if (event.data.currentCity) setActiveCity(event.data.currentCity);
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
          setLeads((prev) => {
            const existingPhones = new Set(
              prev.map((l) => normalizePhone(l.phone)).filter(Boolean)
            );
            const existingNames = new Set(prev.map((l) => l.name.toLowerCase().trim()));
            const uniqueIncoming: ScrapedLead[] = [];

            for (const lead of newLeadsBatch) {
              const normPhone = normalizePhone(lead.phone);
              const normName = lead.name.toLowerCase().trim();
              if (normPhone && existingPhones.has(normPhone)) continue;
              if (existingNames.has(normName)) continue;

              if (normPhone) existingPhones.add(normPhone);
              existingNames.add(normName);
              uniqueIncoming.push(lead);
            }
            return [...uniqueIncoming, ...prev];
          });
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
                  Multi-City SaaS Pro
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 hidden sm:block font-medium">
                Sequential Multi-City Maps Extractor & Automated Email Enrichment
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

            {/* Admin User Authentication Badge & Action */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-zinc-200">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-100/90 text-zinc-800 text-xs font-semibold border border-zinc-200 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-[11px] truncate max-w-[140px] font-bold">
                    {currentUser.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-xl text-zinc-500 hover:text-red-600 hover:bg-red-50 border border-zinc-200/80 transition"
                  title="Log out of Admin account"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-red-600 hover:bg-red-700 text-white shadow-sm transition"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Login</span>
              </button>
            )}

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
            <span>High-Speed Multi-City Maps Pipeline</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900">
            Extract Verified B2B Client Leads{" "}
            <span className="text-gradient-crimson">Across Multiple Cities</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 font-normal">
            Select multiple states and cities with custom limits per location. Runs city-by-city sequentially and streams all results into one unified Excel/CSV sheet.
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
              placeholder="Search or pick from 200 subjects (e.g., Real estate brokers, Chartered accountants, Dentists)..."
            />

            {/* Quota Summary Badge */}
            <div className="flex items-center gap-2 bg-zinc-50/80 border border-zinc-200 rounded-xl px-3.5 py-2.5 shadow-2xs shrink-0">
              <span className="text-xs text-zinc-500 font-bold shrink-0">Plan:</span>
              <div className="text-xs font-black text-zinc-900 flex items-center gap-1.5">
                <span className="text-red-600 font-extrabold">{selectedCities.length}</span> Cities ×
                <span className="text-red-600 font-extrabold">{limitPerCity}</span> leads =
                <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200/60 font-mono">
                  {totalCalculatedLimit.toLocaleString()} Leads
                </span>
              </div>
            </div>

            {/* Run / Stop Button */}
            {!isLoading ? (
              <button
                onClick={startScraping}
                className="flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-black tracking-wide uppercase transition shadow-md shadow-red-600/20 hover:scale-[1.01] active:scale-[0.99] shrink-0"
              >
                <Play className="w-4 h-4 fill-white" />
                Run Scraper
              </button>
            ) : (
              <button
                onClick={stopScraping}
                className="flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-black tracking-wide uppercase transition shadow-sm shrink-0"
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
                <span>1. Multi-City & State Location</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200/60">
                  {selectedCities.length} Cities Selected
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
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200/60">
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
                selectedStates={selectedStates}
                onStatesChange={setSelectedStates}
                selectedCities={selectedCities}
                onCitiesChange={setSelectedCities}
                limitPerCity={limitPerCity}
                onLimitPerCityChange={setLimitPerCity}
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
                  Target: {keyword} across {selectedCities.length} cities ({limitPerCity} leads each) • Active: {activeCity}, {activeState}
                </p>
              </div>
            </div>
            <div className="text-xs font-mono text-red-700 font-extrabold bg-white px-3 py-1.5 rounded-lg border border-red-200 shadow-2xs shrink-0">
              {leads.length} / {totalCalculatedLimit} Leads Gathered
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
        city={activeCity}
        state={activeState}
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

      {/* Mandatory Admin Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          if (currentUser) setIsLoginModalOpen(false);
        }}
        onSuccess={(user) => {
          setCurrentUser(user);
          setIsLoginModalOpen(false);
          setErrorMessage(null);
        }}
      />
    </div>
  );
}
