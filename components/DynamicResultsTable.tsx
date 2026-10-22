"use client";

import React, { useState } from "react";
import { ScrapedLead, FieldKey, AVAILABLE_FIELDS } from "@/lib/types";
import {
  FileSpreadsheet,
  FileText,
  Search,
  ExternalLink,
  Copy,
  Check,
  Building2,
  MapPin,
  Star,
} from "lucide-react";
import * as XLSX from "xlsx";

interface Props {
  leads: ScrapedLead[];
  selectedFields: FieldKey[];
  isLoading: boolean;
  statusMessage?: string;
  progress?: number;
}

export default function DynamicResultsTable({
  leads,
  selectedFields,
  isLoading,
  statusMessage,
  progress,
}: Props) {
  const [searchFilter, setSearchFilter] = useState("");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const filteredLeads = leads.filter((lead) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      lead.name.toLowerCase().includes(q) ||
      lead.city.toLowerCase().includes(q) ||
      (lead.phone && lead.phone.toLowerCase().includes(q)) ||
      (lead.email && lead.email.toLowerCase().includes(q)) ||
      (lead.website && lead.website.toLowerCase().includes(q)) ||
      (lead.fullAddress && lead.fullAddress.toLowerCase().includes(q))
    );
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const normalizePhone = (phone?: string) => {
    if (!phone) return "";
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
    if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
    return digits;
  };

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
      city: city || "Noida",
      state: state || "Uttar Pradesh",
    };
  };

  const getStrictlyUniqueLeads = () => {
    const seenPhones = new Set<string>();
    const seenNames = new Set<string>();
    return leads.filter((lead) => {
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
  };

  const exportToExcel = () => {
    if (leads.length === 0) return;

    const uniqueLeads = getStrictlyUniqueLeads();

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

    XLSX.writeFile(workbook, `leads_unique_export_${Date.now()}.xlsx`);
  };

  const exportToCsv = () => {
    if (leads.length === 0) return;

    const uniqueLeads = getStrictlyUniqueLeads();

    const headers = ["Business Name", "City", "State", "Pincode", "Phone / Mobile Number (Unique)"];
    selectedFields.forEach((fieldKey) => {
      if (fieldKey === "phone") return;
      const def = AVAILABLE_FIELDS.find((f) => f.key === fieldKey);
      if (def) headers.push(def.label);
    });

    const rows = uniqueLeads.map((lead) => {
      const { city, state } = getCityState(lead);
      const values: string[] = [
        lead.name || "",
        city,
        state,
        lead.pincode || "",
        lead.phone || "",
      ];

      selectedFields.forEach((fieldKey) => {
        if (fieldKey === "phone") return;
        let val = "";
        if (fieldKey === "email") val = lead.email || "";
        else if (fieldKey === "website") val = lead.website || "";
        else if (fieldKey === "rating") val = String(lead.rating || "");
        else if (fieldKey === "reviewsCount") val = String(lead.reviewsCount || "");
        else if (fieldKey === "fullAddress") val = lead.fullAddress || "";
        else if (fieldKey === "category") val = lead.category || "";
        else if (fieldKey === "mapsUrl") val = lead.mapsUrl || "";
        else if (fieldKey === "socials") {
          val = [lead.socials?.linkedin, lead.socials?.instagram, lead.socials?.facebook]
            .filter(Boolean)
            .join(" | ");
        }
        values.push(val);
      });

      return values.map((v) => `"${(v || "").replace(/"/g, '""')}"`).join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leads_unique_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full stripe-card rounded-2xl border border-zinc-200/80 overflow-hidden mt-6">
      {/* Table Header Bar with Live Counter & Export Actions */}
      <div className="p-4 sm:p-5 border-b border-zinc-200/70 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-extrabold text-zinc-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-red-600" />
              <span>Scraped Results Table</span>
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200/60">
              {leads.length} Leads
            </span>
            {isLoading && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                Streaming Live...
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 font-normal">
            Columns dynamically generated based on your selected data tabs.
          </p>
        </div>

        {/* Search & Export Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search in results..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50/80 border border-zinc-200 rounded-xl text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-red-500 shadow-2xs"
            />
          </div>

          <button
            onClick={exportToExcel}
            disabled={leads.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:opacity-40 text-white transition shadow-sm shadow-red-600/20"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Export Excel
          </button>

          <button
            onClick={exportToCsv}
            disabled={leads.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-zinc-50 disabled:opacity-40 text-zinc-700 border border-zinc-200 transition shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-zinc-500" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Real-time progress bar if active */}
      {isLoading && (
        <div className="w-full bg-zinc-100 h-1 overflow-hidden">
          <div
            className="bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 h-full transition-all duration-300"
            style={{ width: `${progress || 10}%` }}
          />
        </div>
      )}

      {/* The Dynamic Table */}
      <div className="overflow-x-auto max-h-[580px] overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-zinc-50/80 text-zinc-600 uppercase tracking-wider text-[11px] sticky top-0 z-10 border-b border-zinc-200">
            <tr>
              <th className="py-3 px-4 font-bold">#</th>
              <th className="py-3 px-4 font-bold min-w-[200px]">Business Name</th>
              <th className="py-3 px-4 font-bold min-w-[120px]">City</th>
              <th className="py-3 px-4 font-bold min-w-[130px]">State</th>
              <th className="py-3 px-4 font-bold min-w-[90px]">Pincode</th>

              {/* Dynamic Header Columns based on Selected Fields */}
              {selectedFields.includes("phone") && (
                <th className="py-3 px-4 font-bold min-w-[140px]">Phone Number</th>
              )}
              {selectedFields.includes("email") && (
                <th className="py-3 px-4 font-bold min-w-[200px]">Enriched Email</th>
              )}
              {selectedFields.includes("website") && (
                <th className="py-3 px-4 font-bold min-w-[160px]">Website</th>
              )}
              {selectedFields.includes("rating") && (
                <th className="py-3 px-4 font-bold min-w-[90px]">Rating</th>
              )}
              {selectedFields.includes("reviewsCount") && (
                <th className="py-3 px-4 font-bold min-w-[90px]">Reviews</th>
              )}
              {selectedFields.includes("fullAddress") && (
                <th className="py-3 px-4 font-bold min-w-[240px]">Full Address</th>
              )}
              {selectedFields.includes("category") && (
                <th className="py-3 px-4 font-bold min-w-[130px]">Category</th>
              )}
              {selectedFields.includes("socials") && (
                <th className="py-3 px-4 font-bold min-w-[140px]">Social Media</th>
              )}
              {selectedFields.includes("mapsUrl") && (
                <th className="py-3 px-4 font-bold min-w-[100px]">Maps Link</th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-100 bg-white text-zinc-700">
            {filteredLeads.length === 0 ? (
              <tr>
                <td
                  colSpan={5 + selectedFields.length}
                  className="py-16 text-center text-zinc-400"
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Building2 className="w-9 h-9 text-zinc-300 mb-1" />
                    <p className="text-sm font-semibold text-zinc-700">
                      {isLoading ? "Fetching and scraping live leads..." : "No leads scraped yet."}
                    </p>
                    <p className="text-xs text-zinc-400 max-w-sm font-normal">
                      Select your target city, choose pincodes, and click "Run Scraper" above to stream leads into this table.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead, idx) => (
                <tr
                  key={lead.id || idx}
                  className="hover:bg-red-50/30 transition-colors group"
                >
                  <td className="py-3 px-4 text-zinc-400 font-mono text-[11px]">{idx + 1}</td>

                  {/* Business Name */}
                  <td className="py-3 px-4 font-bold text-zinc-900 group-hover:text-red-700 transition-colors">
                    <div className="flex items-center gap-1.5">
                      <span>{lead.name}</span>
                      {lead.status === "verified" && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Email Verified" />
                      )}
                    </div>
                  </td>

                  {/* City */}
                  <td className="py-3 px-4 font-bold text-zinc-900">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span>{lead.city || "Noida"}</span>
                    </div>
                  </td>

                  {/* State */}
                  <td className="py-3 px-4 text-zinc-600 font-medium">
                    {lead.state || "Uttar Pradesh"}
                  </td>

                  {/* Pincode */}
                  <td className="py-3 px-4 font-mono text-red-700 font-bold">
                    {lead.pincode}
                  </td>

                  {/* Dynamic Cell: Phone */}
                  {selectedFields.includes("phone") && (
                    <td className="py-3 px-4">
                      {lead.phone ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-zinc-800 font-semibold">{lead.phone}</span>
                          <button
                            onClick={() => handleCopy(lead.phone!)}
                            className="text-zinc-400 hover:text-red-600 transition"
                            title="Copy Phone"
                          >
                            {copiedText === lead.phone ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-zinc-300">-</span>
                      )}
                    </td>
                  )}

                  {/* Dynamic Cell: Email */}
                  {selectedFields.includes("email") && (
                    <td className="py-3 px-4">
                      {lead.email ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-red-700 font-mono text-[11px] font-bold max-w-[180px] truncate" title={lead.email}>
                            {lead.email}
                          </span>
                          <button
                            onClick={() => handleCopy(lead.email!)}
                            className="text-zinc-400 hover:text-red-600 transition"
                            title="Copy Email"
                          >
                            {copiedText === lead.email ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-zinc-400 italic">Not found</span>
                      )}
                    </td>
                  )}

                  {/* Dynamic Cell: Website */}
                  {selectedFields.includes("website") && (
                    <td className="py-3 px-4">
                      {lead.website ? (
                        <a
                          href={lead.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 max-w-[150px] truncate font-medium"
                          title={lead.website}
                        >
                          <span className="truncate">{lead.website.replace(/^https?:\/\/(www\.)?/, "")}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-zinc-300">-</span>
                      )}
                    </td>
                  )}

                  {/* Dynamic Cell: Rating */}
                  {selectedFields.includes("rating") && (
                    <td className="py-3 px-4">
                      {lead.rating ? (
                        <div className="flex items-center gap-1 text-amber-600 font-bold">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>{lead.rating}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-300">-</span>
                      )}
                    </td>
                  )}

                  {/* Dynamic Cell: Reviews Count */}
                  {selectedFields.includes("reviewsCount") && (
                    <td className="py-3 px-4 text-zinc-600">
                      {lead.reviewsCount ? `${lead.reviewsCount} rev.` : "-"}
                    </td>
                  )}

                  {/* Dynamic Cell: Full Address */}
                  {selectedFields.includes("fullAddress") && (
                    <td className="py-3 px-4 text-zinc-500 max-w-[260px] truncate" title={lead.fullAddress}>
                      {lead.fullAddress || "-"}
                    </td>
                  )}

                  {/* Dynamic Cell: Category */}
                  {selectedFields.includes("category") && (
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-[11px] font-medium border border-zinc-200">
                        {lead.category || "Consultancy"}
                      </span>
                    </td>
                  )}

                  {/* Dynamic Cell: Socials */}
                  {selectedFields.includes("socials") && (
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-zinc-500 font-semibold text-[11px]">
                        {lead.socials?.linkedin && (
                          <a
                            href={lead.socials.linkedin}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-blue-700 transition"
                            title="LinkedIn Profile"
                          >
                            LI
                          </a>
                        )}
                        {lead.socials?.instagram && (
                          <a
                            href={lead.socials.instagram}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-pink-600 transition"
                            title="Instagram Profile"
                          >
                            IG
                          </a>
                        )}
                        {lead.socials?.facebook && (
                          <a
                            href={lead.socials.facebook}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-blue-600 transition"
                            title="Facebook Profile"
                          >
                            FB
                          </a>
                        )}
                        {!lead.socials?.linkedin && !lead.socials?.instagram && !lead.socials?.facebook && (
                          <span className="text-zinc-300">-</span>
                        )}
                      </div>
                    </td>
                  )}

                  {/* Dynamic Cell: Maps Link */}
                  {selectedFields.includes("mapsUrl") && (
                    <td className="py-3 px-4">
                      {lead.mapsUrl ? (
                        <a
                          href={lead.mapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-red-600 hover:text-red-800 font-bold"
                        >
                          View Map
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ) : (
                        <span className="text-zinc-300">-</span>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
