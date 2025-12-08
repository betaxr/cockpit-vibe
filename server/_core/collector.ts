import axios from "axios";

const DEFAULT_TIMEOUT_MS = 5000;

export function isCollectorEnabled() {
  return Boolean(process.env.COLLECTOR_BASE_URL);
}

type FetchOptions = {
  path: string;
  timeoutMs?: number;
};

export async function fetchCollector<T>({ path, timeoutMs = DEFAULT_TIMEOUT_MS }: FetchOptions): Promise<T | null> {
  if (!process.env.COLLECTOR_BASE_URL) return null;
  try {
    const url = `${process.env.COLLECTOR_BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
    const res = await axios.get<T>(url, {
      timeout: timeoutMs,
      headers: process.env.COLLECTOR_API_KEY
        ? { Authorization: `Bearer ${process.env.COLLECTOR_API_KEY}` }
        : undefined,
    });
    return res.data;
  } catch (err) {
    console.warn(`[Collector] Fetch failed for ${path}:`, (err as Error).message);
    return null;
  }
}
