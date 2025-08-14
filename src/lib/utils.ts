/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function debug(data: any) {
  try {
    return JSON.stringify(data, getCircularReplacer(), 2);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return String(data);
  }
}

export function getCircularReplacer() {
  const seen = new WeakSet();
  return (key: string, value: any) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) return "[Circular]";
      seen.add(value);
    }
    return value;
  };
}

export const cookiesConfig = {
  maxAge: 60 * 60 * 24 * 3, // 3 days
  path: "/",
  httpOnly: true,
  secure: true,
};

export const safeFormatDateTime = (dt?: string | Date) => {
  if (!dt) return "-";
  const d = new Date(dt);
  return isNaN(d.getTime()) ? "-" : format(d, "MMM dd, yyyy HH:mm");
  // If you prefer localised formatting later, you can swap format out.
};

export const safeFormatDate = (dt?: string | Date) => {
  if (!dt) return "-";
  const d = new Date(dt);
  return isNaN(d.getTime()) ? "-" : format(d, "MMM dd, yyyy");
  // If you prefer localised formatting later, you can swap format out.
};

export const formatAmount = (v: unknown) => {
  if (v === undefined || v === null || v === "") return "-";
  try {
    // Handle bigint / string / number safely without BigInt literals
    let s: string;
    if (typeof v === "bigint") s = v.toString();
    else if (typeof v === "number") s = Math.trunc(v).toString();
    else s = String(v);

    // Strip non-digits just in case input contains commas or spaces
    const digits = s.replace(/[^\d-]/g, "");
    if (!digits) return "-";

    // Keep as string to avoid precision loss on very large values
    // Add basic thousands separators
    const negative = digits.startsWith("-");
    const body = negative ? digits.slice(1) : digits;
    const withSep = body.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return `${negative ? "-" : ""}${withSep}`;
  } catch {
    return "-";
  }
};

export const formatAmountInput = (value: string) => {
  // integers only (BigInt-compatible). If you need decimals later, say the word.
  const raw = (value ?? "").replace(/[^\d-]/g, "");
  if (!raw) return { formatted: "", raw: "" };

  const negative = raw.startsWith("-");
  const body = negative ? raw.slice(1) : raw;
  const formatted = `${negative ? "-" : ""}${body.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

  return { formatted, raw };
};

export function formatNumberInput(value: string) {
  const raw = value.replace(/,/g, "");
  if (isNaN(Number(raw))) return { formatted: "", raw: "" };

  const parts = raw.split(".");
  const integer = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const decimal = parts[1] ? `.${parts[1].slice(0, 2)}` : "";

  return {
    formatted: `${integer}${decimal}`,
    raw,
  };
}

export const formatNumericValue = (value: unknown): string => {
  if (typeof value === "number" || typeof value === "bigint") {
    return Number(value).toLocaleString("en-US");
  }

  if (typeof value === "string" && /^[0-9]+$/.test(value)) {
    return Number(value).toLocaleString("en-US");
  }

  return String(value);
};

export const buildFeatureAccessMap = (user: any) => {
  const map: Record<
    string,
    {
      privilegeCreate: boolean;
      privilegeRead: boolean;
      privilegeUpdate: boolean;
      privilegeDelete: boolean;
    }
  > = {};

  user?.role?.privileges?.forEach((p: any) => {
    map[p.feature.name] = {
      privilegeCreate: p.privilegeCreate,
      privilegeRead: p.privilegeRead,
      privilegeUpdate: p.privilegeUpdate,
      privilegeDelete: p.privilegeDelete,
    };
  });

  return map;
};

export const hasAnyPermission = (access?: { privilegeCreate?: boolean; privilegeRead?: boolean; privilegeUpdate?: boolean; privilegeDelete?: boolean }) =>
  !!(access?.privilegeCreate || access?.privilegeRead || access?.privilegeUpdate || access?.privilegeDelete);
