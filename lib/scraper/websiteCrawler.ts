import axios from "axios";
import * as cheerio from "cheerio";
import { getBrowserHeaders } from "./userAgents";
import { configureProxy } from "./proxyHandler";

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

const IGNORED_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".webp",
  ".css",
  ".js",
  ".woff",
  ".woff2",
];

const IGNORED_EMAILS = [
  "example.com",
  "domain.com",
  "email.com",
  "wixpress.com",
  "sentry.io",
  "user@domain",
  "test@test",
  "yourname@",
  "sample@",
];

export interface EnrichedData {
  email?: string;
  socials: {
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

export async function crawlWebsiteForContacts(
  websiteUrl: string,
  proxyUrl?: string,
  timeoutMs: number = 7000
): Promise<EnrichedData> {
  const result: EnrichedData = {
    socials: {},
  };

  if (!websiteUrl || !websiteUrl.startsWith("http")) {
    return result;
  }

  const emailsFound = new Set<string>();

  const proxyConfig = configureProxy(proxyUrl);

  const pagesToScrape = [websiteUrl];
  try {
    const urlObj = new URL(websiteUrl);
    // Add common contact page paths
    pagesToScrape.push(`${urlObj.origin}/contact`);
    pagesToScrape.push(`${urlObj.origin}/contact-us`);
    pagesToScrape.push(`${urlObj.origin}/about`);
  } catch {
    // Ignore invalid url parse
  }

  // Crawl homepage first, and if email not found, crawl contact page
  for (const pageUrl of pagesToScrape.slice(0, 2)) {
    try {
      const response = await axios.get(pageUrl, {
        headers: getBrowserHeaders(pageUrl),
        timeout: timeoutMs,
        maxRedirects: 3,
        validateStatus: (status) => status >= 200 && status < 400,
        ...proxyConfig,
      });

      const html = String(response.data);
      const $ = cheerio.load(html);

      // 1. Look for mailto links
      $('a[href^="mailto:"]').each((_, el) => {
        const href = $(el).attr("href");
        if (href) {
          const rawEmail = href.replace(/^mailto:/i, "").split("?")[0].trim().toLowerCase();
          if (isValidEmail(rawEmail)) {
            emailsFound.add(rawEmail);
          }
        }
      });

      // 2. Regex search in body text
      const matches = html.match(EMAIL_REGEX);
      if (matches) {
        for (const match of matches) {
          const clean = match.toLowerCase().trim();
          if (isValidEmail(clean)) {
            emailsFound.add(clean);
          }
        }
      }

      // 3. Extract social links
      $("a[href]").each((_, el) => {
        const href = $(el).attr("href");
        if (!href) return;

        if (!result.socials.linkedin && (href.includes("linkedin.com/company") || href.includes("linkedin.com/in"))) {
          result.socials.linkedin = href;
        } else if (!result.socials.instagram && href.includes("instagram.com/") && !href.includes("instagram.com/p/")) {
          result.socials.instagram = href;
        } else if (!result.socials.facebook && href.includes("facebook.com/") && !href.includes("sharer.php")) {
          result.socials.facebook = href;
        } else if (!result.socials.twitter && (href.includes("twitter.com/") || href.includes("x.com/"))) {
          result.socials.twitter = href;
        }
      });

      // If we already have email and some socials, no need to crawl more pages
      if (emailsFound.size > 0 && result.socials.linkedin) {
        break;
      }
    } catch {
      // Ignore page fetch errors (timeouts, 404, etc.)
    }
  }

  if (emailsFound.size > 0) {
    result.email = Array.from(emailsFound)[0];
  }

  return result;
}

function isValidEmail(email: string): boolean {
  if (!email || email.length < 5 || email.length > 80) return false;
  if (!email.includes("@") || !email.includes(".")) return false;

  for (const ext of IGNORED_EXTENSIONS) {
    if (email.endsWith(ext)) return false;
  }

  for (const ignored of IGNORED_EMAILS) {
    if (email.includes(ignored)) return false;
  }

  return true;
}
