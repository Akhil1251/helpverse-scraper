"use client";

import React, { useState, useMemo } from "react";
import { INDIA_LOCATIONS, StateData } from "@/data/locations";
import {
  MapPin,
  Globe,
  CheckCircle2,
  Navigation,
  Layers,
  ShieldCheck,
  Check,
  Search,
  Sliders,
  ChevronDown,
  ChevronUp,
  X,
  ListFilter,
  CheckSquare,
  Square,
  Sparkles,
} from "lucide-react";
import { LocationTarget } from "@/lib/types";

interface Props {
  selectedStates: string[];
  onStatesChange: (states: string[]) => void;
  selectedCities: LocationTarget[];
  onCitiesChange: (cities: LocationTarget[]) => void;
  limitPerCity: number;
  onLimitPerCityChange: (limit: number) => void;
}

const POPULAR_STATES = [
  "Uttar Pradesh",
  "Delhi NCR",
  "Maharashtra",
  "Karnataka",
  "Tamil Nadu",
  "Telangana",
  "Gujarat",
  "Haryana",
  "Rajasthan",
  "West Bengal",
];

export default function LocationTab({
  selectedStates,
  onStatesChange,
  selectedCities,
  onCitiesChange,
  limitPerCity,
  onLimitPerCityChange,
}: Props) {
  const [stateSearch, setStateSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [collapsedStates, setCollapsedStates] = useState<Record<string, boolean>>({});

  // Filtered states based on search query
  const filteredStates = useMemo(() => {
    if (!stateSearch.trim()) return INDIA_LOCATIONS;
    const q = stateSearch.toLowerCase();
    return INDIA_LOCATIONS.filter(
      (s) =>
        s.state.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.cities.some((c) => c.name.toLowerCase().includes(q))
    );
  }, [stateSearch]);

  // Available cities from the currently selected states
  const availableStatesData = useMemo(() => {
    return INDIA_LOCATIONS.filter((s) => selectedStates.includes(s.state));
  }, [selectedStates]);

  // Total available cities count across selected states
  const totalAvailableCitiesCount = useMemo(() => {
    return availableStatesData.reduce((acc, s) => acc + s.cities.length, 0);
  }, [availableStatesData]);

  // Helper to toggle a single state
  const toggleState = (stateName: string) => {
    if (selectedStates.includes(stateName)) {
      // Remove state and remove its cities
      const nextStates = selectedStates.filter((s) => s !== stateName);
      const nextCities = selectedCities.filter((c) => c.state !== stateName);
      onStatesChange(nextStates);
      onCitiesChange(nextCities);
    } else {
      // Add state and automatically include its cities by default
      const nextStates = [...selectedStates, stateName];
      const stateObj = INDIA_LOCATIONS.find((s) => s.state === stateName);
      const newCities = stateObj ? stateObj.cities.map((c) => ({ state: stateName, city: c.name })) : [];
      // Append only unique
      const existingKeySet = new Set(selectedCities.map((c) => `${c.state}::${c.city}`));
      const citiesToAdd = newCities.filter((c) => !existingKeySet.has(`${c.state}::${c.city}`));
      onStatesChange(nextStates);
      onCitiesChange([...selectedCities, ...citiesToAdd]);
    }
  };

  // Select ALL States
  const handleSelectAllStates = () => {
    const allStateNames = INDIA_LOCATIONS.map((s) => s.state);
    const allCities: LocationTarget[] = [];
    INDIA_LOCATIONS.forEach((s) => {
      s.cities.forEach((c) => {
        allCities.push({ state: s.state, city: c.name });
      });
    });
    onStatesChange(allStateNames);
    onCitiesChange(allCities);
  };

  // Clear ALL States
  const handleClearStates = () => {
    onStatesChange([]);
    onCitiesChange([]);
  };

  // Helper to toggle a single city
  const toggleCity = (stateName: string, cityName: string) => {
    const exists = selectedCities.some((c) => c.state === stateName && c.city === cityName);
    if (exists) {
      onCitiesChange(selectedCities.filter((c) => !(c.state === stateName && c.city === cityName)));
    } else {
      onCitiesChange([...selectedCities, { state: stateName, city: cityName }]);
    }
  };

  // Select ALL cities across all currently selected states
  const handleSelectAllCities = () => {
    const allCitiesInSelectedStates: LocationTarget[] = [];
    availableStatesData.forEach((s) => {
      s.cities.forEach((c) => {
        allCitiesInSelectedStates.push({ state: s.state, city: c.name });
      });
    });
    onCitiesChange(allCitiesInSelectedStates);
  };

  // Clear ALL cities
  const handleClearCities = () => {
    onCitiesChange([]);
  };

  // Toggle all cities of a specific state
  const toggleAllCitiesForState = (stateName: string) => {
    const stateObj = INDIA_LOCATIONS.find((s) => s.state === stateName);
    if (!stateObj) return;

    const currentCitiesInState = selectedCities.filter((c) => c.state === stateName);
    const allStateCitiesCount = stateObj.cities.length;

    if (currentCitiesInState.length === allStateCitiesCount) {
      // Deselect all cities in this state
      onCitiesChange(selectedCities.filter((c) => c.state !== stateName));
    } else {
      // Select all cities in this state
      const stateTargetCities = stateObj.cities.map((c) => ({ state: stateName, city: c.name }));
      const otherCities = selectedCities.filter((c) => c.state !== stateName);
      onCitiesChange([...otherCities, ...stateTargetCities]);
    }
  };

  const isCitySelected = (stateName: string, cityName: string) => {
    return selectedCities.some((c) => c.state === stateName && c.city === cityName);
  };

  const totalCalculatedTarget = selectedCities.length * limitPerCity;

  return (
    <div className="space-y-6">
      {/* 1. Multi-State Selector Section */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-red-600 text-white rounded-lg shadow-sm">
              <Globe className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-zinc-900 tracking-tight">
                  1. Select States / Union Territories
                </h3>
                <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200/60 font-mono">
                  {selectedStates.length} / {INDIA_LOCATIONS.length} Selected
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Choose one or multiple states to include their commercial cities
              </p>
            </div>
          </div>

          {/* Quick Action Buttons for States */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAllStates}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-50 text-red-700 hover:bg-red-100 border border-red-200/70 transition shadow-2xs flex items-center gap-1.5"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Select All States ({INDIA_LOCATIONS.length})</span>
            </button>
            {selectedStates.length > 0 && (
              <button
                type="button"
                onClick={handleClearStates}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 border border-zinc-200 transition"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Popular States Quick Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-bold text-zinc-400 mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-red-600" />
            Quick Pick:
          </span>
          {POPULAR_STATES.map((st) => {
            const isSelected = selectedStates.includes(st);
            return (
              <button
                key={st}
                type="button"
                onClick={() => toggleState(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-red-600 text-white font-bold shadow-xs"
                    : "bg-zinc-50 text-zinc-700 hover:bg-zinc-100 border border-zinc-200/80"
                }`}
              >
                {isSelected ? <Check className="w-3 h-3 text-white" /> : null}
                <span>{st}</span>
              </button>
            );
          })}
        </div>

        {/* Search States Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search state (e.g., Delhi, Uttar Pradesh, Maharashtra)..."
            value={stateSearch}
            onChange={(e) => setStateSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50/70 border border-zinc-200 rounded-xl text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-red-500"
          />
        </div>

        {/* States Checkbox Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-52 overflow-y-auto pr-1">
          {filteredStates.map((loc) => {
            const isChecked = selectedStates.includes(loc.state);
            return (
              <div
                key={loc.state}
                onClick={() => toggleState(loc.state)}
                className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer select-none transition ${
                  isChecked
                    ? "bg-red-50/90 border-red-300 text-red-900 font-bold shadow-2xs"
                    : "bg-white border-zinc-200/70 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50/60"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border transition ${
                      isChecked
                        ? "bg-red-600 border-red-600 text-white"
                        : "border-zinc-300 bg-white"
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </span>
                  <span className="truncate">{loc.state}</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 ml-1 shrink-0">
                  {loc.code}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Multi-City Selector Section */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-red-600 text-white rounded-lg shadow-sm">
              <MapPin className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-zinc-900 tracking-tight">
                  2. Select Cities Across Chosen States
                </h3>
                <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200/60 font-mono">
                  {selectedCities.length} Cities Selected
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Data will be scraped sequentially for each city and combined in the same CSV/Excel
              </p>
            </div>
          </div>

          {/* Quick Action Buttons for Cities */}
          {selectedStates.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAllCities}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-50 text-red-700 hover:bg-red-100 border border-red-200/70 transition shadow-2xs flex items-center gap-1.5"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Select All Cities ({totalAvailableCitiesCount})</span>
              </button>
              {selectedCities.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearCities}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 border border-zinc-200 transition"
                >
                  Clear Cities
                </button>
              )}
            </div>
          )}
        </div>

        {selectedStates.length === 0 ? (
          <div className="py-8 text-center text-zinc-400 bg-zinc-50/50 rounded-xl border border-dashed border-zinc-200">
            <Globe className="w-7 h-7 mx-auto text-zinc-300 mb-1.5" />
            <p className="text-xs font-semibold text-zinc-700">No State Selected</p>
            <p className="text-[11px] text-zinc-400">
              Please select at least one State or Union Territory above to view and select cities.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Search Cities Across Selected States */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search city across selected states (e.g., Noida, Gurugram, Mumbai, Lucknow)..."
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50/70 border border-zinc-200 rounded-xl text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Cities Container Grouped by State */}
            <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
              {availableStatesData.map((stData) => {
                const citiesInState = stData.cities.filter((c) =>
                  !citySearch.trim() || c.name.toLowerCase().includes(citySearch.toLowerCase())
                );
                if (citiesInState.length === 0) return null;

                const selectedInThisState = selectedCities.filter((c) => c.state === stData.state);
                const allSelected = selectedInThisState.length === stData.cities.length;
                const isCollapsed = collapsedStates[stData.state] || false;

                return (
                  <div
                    key={stData.state}
                    className="rounded-xl border border-zinc-200/80 bg-zinc-50/30 overflow-hidden"
                  >
                    {/* State City Header */}
                    <div className="px-3.5 py-2 bg-zinc-100/70 border-b border-zinc-200/60 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-zinc-800">
                          {stData.state}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-white rounded border border-zinc-200 text-zinc-600">
                          {selectedInThisState.length}/{stData.cities.length} Selected
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleAllCitiesForState(stData.state)}
                          className="text-[11px] font-bold text-red-600 hover:text-red-800 hover:underline"
                        >
                          {allSelected ? "Deselect State Cities" : `Select All in ${stData.state}`}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setCollapsedStates((prev) => ({ ...prev, [stData.state]: !isCollapsed }))
                          }
                          className="text-zinc-400 hover:text-zinc-700"
                        >
                          {isCollapsed ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronUp className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* City Chips for this State */}
                    {!isCollapsed && (
                      <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {citiesInState.map((city) => {
                          const isChecked = isCitySelected(stData.state, city.name);
                          return (
                            <div
                              key={city.name}
                              onClick={() => toggleCity(stData.state, city.name)}
                              className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer select-none transition ${
                                isChecked
                                  ? "bg-red-50 border-red-300 text-red-900 font-bold shadow-2xs"
                                  : "bg-white border-zinc-200/70 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50/60"
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span
                                  className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border transition ${
                                    isChecked
                                      ? "bg-red-600 border-red-600 text-white"
                                      : "border-zinc-300 bg-white"
                                  }`}
                                >
                                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                </span>
                                <span className="truncate">{city.name}</span>
                              </div>
                              <span className="text-[10px] font-mono text-zinc-400 shrink-0 ml-1">
                                {city.pincodes.length} pins
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. Limit per Location / City Configuration & Sequential Plan */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-50 via-red-50/25 to-zinc-50 border border-red-100 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-red-600 text-white rounded-lg shadow-sm">
              <Sliders className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider">
                Target Limit per City & Sequential Execution Plan
              </h4>
              <p className="text-[11px] text-zinc-500">
                Specify how many verified business leads to extract from each city before moving to the next
              </p>
            </div>
          </div>

          {/* Quick Preset Buttons for Limit per City */}
          <div className="flex items-center gap-1.5">
            {[25, 50, 100, 250, 500].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onLimitPerCityChange(preset)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  limitPerCity === preset
                    ? "bg-red-600 text-white shadow-xs"
                    : "bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200"
                }`}
              >
                {preset}
              </button>
            ))}
            <input
              type="number"
              min="1"
              max="5000"
              value={limitPerCity}
              onChange={(e) => onLimitPerCityChange(Math.max(1, Number(e.target.value)))}
              className="w-16 px-2 py-1 text-xs text-center font-extrabold bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-red-500 shadow-2xs"
              title="Type custom leads limit per city"
            />
            <span className="text-xs font-bold text-zinc-600">leads / city</span>
          </div>
        </div>

        {/* Live Calculation & Sequential Pipeline Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 bg-white rounded-xl border border-zinc-200/80 text-xs space-y-1">
            <span className="font-extrabold text-zinc-800 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-red-600" />
              Selected Locations
            </span>
            <p className="text-sm font-black text-zinc-900">
              {selectedCities.length} Cities
            </p>
            <p className="text-[11px] text-zinc-500 truncate">
              Across {selectedStates.length} States/UTs
            </p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-zinc-200/80 text-xs space-y-1">
            <span className="font-extrabold text-zinc-800 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-red-600" />
              Per-City Quota
            </span>
            <p className="text-sm font-black text-red-600">
              {limitPerCity} Leads per City
            </p>
            <p className="text-[11px] text-zinc-500">
              Scrapes commercial sectors & zones
            </p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-red-200 text-xs space-y-1 bg-red-50/40">
            <span className="font-extrabold text-red-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Unified Single CSV / Excel Output
            </span>
            <p className="text-sm font-black text-zinc-900">
              {totalCalculatedTarget.toLocaleString()} Total Target Leads
            </p>
            <p className="text-[11px] text-zinc-600">
              All cities stored in 1 unified sheet
            </p>
          </div>
        </div>

        {/* Step-by-Step Execution Sequence Indicator */}
        {selectedCities.length > 0 && (
          <div className="p-3 bg-white/80 rounded-xl border border-zinc-200/60 text-xs flex flex-wrap items-center gap-2">
            <span className="font-bold text-zinc-500 text-[11px] flex items-center gap-1">
              <Navigation className="w-3 h-3 text-red-600" />
              Execution Order:
            </span>
            {selectedCities.slice(0, 5).map((loc, idx) => (
              <span
                key={`${loc.state}-${loc.city}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 text-[11px] font-semibold"
              >
                <span className="font-mono text-[10px] text-red-600 font-bold">{idx + 1}.</span>
                <span>{loc.city}</span>
              </span>
            ))}
            {selectedCities.length > 5 && (
              <span className="text-[11px] text-zinc-500 font-bold">
                + {selectedCities.length - 5} more cities...
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
