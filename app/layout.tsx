import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Helpverse Maps Scraper | B2B Lead Generator SaaS",
  description: "Enterprise Google Maps Scraper with Location Cascader, Email Enrichment, and Proxy Anti-bot Engine.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased selection:bg-red-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
