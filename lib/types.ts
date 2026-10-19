export interface ScrapedLead {
  id: string;
  name: string;
  state: string;
  city: string;
  pincode: string;
  phone?: string;
  website?: string;
  email?: string;
  rating?: number | string;
  reviewsCount?: number | string;
  fullAddress?: string;
  category?: string;
  mapsUrl?: string;
  socials?: {
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  emailVerified?: boolean;
  status: "verified" | "unverified" | "enriched";
}

export type FieldKey =
  | "phone"
  | "email"
  | "website"
  | "rating"
  | "reviewsCount"
  | "fullAddress"
  | "category"
  | "mapsUrl"
  | "socials";

export interface FieldDefinition {
  key: FieldKey;
  label: string;
  description: string;
  isEnriched?: boolean;
}

export const AVAILABLE_FIELDS: FieldDefinition[] = [
  { key: "phone", label: "Phone Number", description: "Direct business phone from listing" },
  { key: "email", label: "Email Address", description: "Deeply extracted from company website", isEnriched: true },
  { key: "website", label: "Website", description: "Official website domain link" },
  { key: "rating", label: "Rating", description: "Star rating (e.g. 4.8 ★)" },
  { key: "reviewsCount", label: "Reviews Count", description: "Total customer reviews count" },
  { key: "fullAddress", label: "Full Address", description: "Complete street address" },
  { key: "category", label: "Category", description: "Business category / industry tag" },
  { key: "socials", label: "Social Media", description: "LinkedIn, Instagram, Facebook links", isEnriched: true },
  { key: "mapsUrl", label: "Google Maps URL", description: "Direct link to Google Maps card" },
];

export interface AntiBotSettings {
  useProxy: boolean;
  proxyUrl: string; // e.g. http://username:password@proxy.example.com:8080
  requestDelayMs: number; // e.g. 800ms
  rotateUserAgents: boolean;
  deepEmailExtraction: boolean;
  timeoutSeconds: number;
}

export interface ExhaustionNoticeData {
  requestedLimit: number;
  totalYielded: number;
  keyword: string;
  city: string;
  state: string;
  reason: "exhausted" | "completed";
  message: string;
}

export interface ScrapeRequestPayload {
  keyword: string;
  state: string;
  city: string;
  pincodes?: string[];
  selectedFields: FieldKey[];
  limit: number;
  antiBot: AntiBotSettings;
}
