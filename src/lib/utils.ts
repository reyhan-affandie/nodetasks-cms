/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const cookiesConfig = {
  maxAge: 60 * 60 * 24 * 3, // 3 days
  path: "/",
  httpOnly: true,
  secure: true,
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
