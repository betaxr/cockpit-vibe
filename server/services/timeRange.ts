export function resolveRange(from?: string, to?: string, range?: "day" | "week" | "month", defaultRange: "day" | "week" = "day") {
  if (from && to) {
    return { fromDate: new Date(from), toDate: new Date(to) };
  }

  const now = new Date();
  const effectiveRange = range ?? defaultRange;

  if (effectiveRange === "day") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return { fromDate: start, toDate: end };
  }

  if (effectiveRange === "week") {
    const start = new Date(now);
    const day = start.getDay();
    const diff = start.getDay() === 0 ? -6 : 1 - day; // Monday start
    start.setDate(start.getDate() + diff);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { fromDate: start, toDate: end };
  }

  // month
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { fromDate: start, toDate: end };
}
