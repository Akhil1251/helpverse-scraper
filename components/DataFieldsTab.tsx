"use client";

import React from "react";
import { FieldKey, AVAILABLE_FIELDS } from "@/lib/types";
import { CheckSquare, Square, Check, Sparkles, Phone, Mail, Globe, Star, MessageSquare, MapPin, Tag, Share2 } from "lucide-react";

interface Props {
  selectedFields: FieldKey[];
  onFieldsChange: (fields: FieldKey[]) => void;
}

export default function DataFieldsTab({ selectedFields, onFieldsChange }: Props) {
  const areAllSelected = selectedFields.length === AVAILABLE_FIELDS.length;

  const toggleSelectAll = () => {
    if (areAllSelected) {
      onFieldsChange([]);
    } else {
      onFieldsChange(AVAILABLE_FIELDS.map((f) => f.key));
    }
  };

  const toggleField = (key: FieldKey) => {
    if (selectedFields.includes(key)) {
      onFieldsChange(selectedFields.filter((f) => f !== key));
    } else {
      onFieldsChange([...selectedFields, key]);
    }
  };

  const getFieldIcon = (key: FieldKey) => {
    switch (key) {
      case "phone":
        return <Phone className="w-4 h-4 text-emerald-600" />;
      case "email":
        return <Mail className="w-4 h-4 text-red-600" />;
      case "website":
        return <Globe className="w-4 h-4 text-blue-600" />;
      case "rating":
        return <Star className="w-4 h-4 text-amber-500 fill-amber-500" />;
      case "reviewsCount":
        return <MessageSquare className="w-4 h-4 text-purple-600" />;
      case "fullAddress":
        return <MapPin className="w-4 h-4 text-rose-600" />;
      case "category":
        return <Tag className="w-4 h-4 text-indigo-600" />;
      case "socials":
        return <Share2 className="w-4 h-4 text-pink-600" />;
      case "mapsUrl":
        return <MapPin className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-xs font-bold text-slate-800">
            Select Output Data Columns ({selectedFields.length} of {AVAILABLE_FIELDS.length} selected)
          </p>
          <p className="text-[11px] text-slate-500">
            Selected fields will automatically become the table headers and export columns below.
          </p>
        </div>

        <button
          type="button"
          onClick={toggleSelectAll}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
            areAllSelected
              ? "bg-red-600 text-white shadow-sm hover:bg-red-700"
              : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 shadow-sm"
          }`}
        >
          {areAllSelected ? (
            <>
              <CheckSquare className="w-3.5 h-3.5" />
              Deselect All
            </>
          ) : (
            <>
              <Square className="w-3.5 h-3.5" />
              Select All
            </>
          )}
        </button>
      </div>

      {/* Field Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
        {AVAILABLE_FIELDS.map((field) => {
          const isSelected = selectedFields.includes(field.key);
          return (
            <div
              key={field.key}
              onClick={() => toggleField(field.key)}
              className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                isSelected
                  ? "bg-red-50/70 border-red-400 shadow-xs"
                  : "bg-white border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 shadow-xs"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 mt-0.5">
                  {getFieldIcon(field.key)}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-bold ${isSelected ? "text-slate-900" : "text-slate-700"}`}>
                      {field.label}
                    </span>
                    {field.isEnriched && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                        <Sparkles className="w-2.5 h-2.5" />
                        AI / Deep
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">{field.description}</p>
                </div>
              </div>

              <div
                className={`w-4 h-4 rounded shrink-0 flex items-center justify-center transition-colors mt-0.5 ${
                  isSelected ? "bg-red-600 text-white" : "border border-slate-300 bg-white"
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
