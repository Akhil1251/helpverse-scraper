import { HttpsProxyAgent } from "https-proxy-agent";
import { SocksProxyAgent } from "socks-proxy-agent";
import type { AxiosRequestConfig } from "axios";

export function configureProxy(proxyUrl?: string): Partial<AxiosRequestConfig> {
  if (!proxyUrl || !proxyUrl.trim()) {
    return {};
  }

  const cleanUrl = proxyUrl.trim();
  try {
    if (cleanUrl.startsWith("socks4://") || cleanUrl.startsWith("socks5://")) {
      const agent = new SocksProxyAgent(cleanUrl);
      return {
        httpAgent: agent,
        httpsAgent: agent,
      };
    } else {
      const agent = new HttpsProxyAgent(cleanUrl);
      return {
        httpAgent: agent,
        httpsAgent: agent,
      };
    }
  } catch (err) {
    console.error("Invalid proxy configuration:", err);
    return {};
  }
}
