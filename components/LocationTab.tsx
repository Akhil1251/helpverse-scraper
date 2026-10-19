"use client";

import React from "react";
import { INDIA_LOCATIONS } from "@/data/locations";
import { MapPin, Globe, CheckCircle2, Navigation, Layers, ShieldCheck } from "lucide-react";

interface Props {
  selectedState: string;
  onStateChange: (state: string) => void;
  selectedCity: string;
  onCityChange: (city: string) => void;
}

export default function LocationTab({
  selectedState,
  onStateChange,
  selectedCity,
  onCityChange,
}: Props) {
  const currentStateObj =
    INDIA_LOCATIONS.find((s) => s.state === selectedState) || INDIA_LOCATIONS[0];

  const handleStateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newState = e.target.value;
    onStateChange(newState);
    const stateData = INDIA_LOCATIONS.find((s) => s.state === newState);
    if (stateData && stateData.cities.length > 0) {
      const defaultCity = stateData.cities[0].name;
      onCityChange(defaultCity);
    }
  };

  const handleCitySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCity = e.target.value;
    onCityChange(newCity);
  };

  return (
    <div className="space-y-5">
      {/* State and City Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* State Dropdown - All 36 States & UTs */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-red-600" />
              State / Union Territory ({INDIA_LOCATIONS.length} Available)
            </label>
            <span className="text-[11px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200/60">
              {currentStateObj.code}
            </span>
          </div>
          <select
            value={selectedState}
            onChange={handleStateSelect}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-semibold cursor-pointer shadow-2xs transition"
          >
            {INDIA_LOCATIONS.map((loc) => (
              <option key={loc.state} value={loc.state}>
                {loc.state} ({loc.cities.length} cities)
              </option>
            ))}
          </select>
        </div>

        {/* City Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-red-600" />
            Select City in {selectedState} ({currentStateObj.cities.length} Cities)
          </label>
          <select
            value={selectedCity}
            onChange={handleCitySelect}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-semibold cursor-pointer shadow-2xs transition"
          >
            {currentStateObj.cities.map((city) => (
              <option key={city.name} value={city.name}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* City-Wide Automated Coverage Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-50 via-red-50/20 to-zinc-50 border border-red-100 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-red-600 text-white rounded-lg shadow-sm">
              <Navigation className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider">
                Full City-Wide Coverage Active
              </h4>
              <p className="text-[11px] text-zinc-500">
                Pincodes are no longer required — automatically scanning all zones across {selectedCity}
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200/60 font-mono">
            <CheckCircle2 className="w-3 h-3 text-red-600" />
            AUTO-SCAN
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 bg-white rounded-xl border border-zinc-200/80 text-xs space-y-1">
            <span className="font-extrabold text-zinc-800 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-red-600" />
              All Sectors & Hubs
            </span>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Scrapes commercial centers, industrial zones, and business clusters across {selectedCity}.
            </p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-zinc-200/80 text-xs space-y-1">
            <span className="font-extrabold text-zinc-800 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-red-600" />
              No Pincode Restrictions
            </span>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              No manual pincode checking needed. Scrapes every registered listing in the city up to your limit.
            </p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-zinc-200/80 text-xs space-y-1">
            <span className="font-extrabold text-zinc-800 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Real Google Maps Data
            </span>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Extracts genuine business names, real telephone numbers, websites, and place links.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
