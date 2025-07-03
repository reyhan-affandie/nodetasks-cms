"use server";

import { API_URL } from "@/constants/env";
import { getAuthTokenService } from "@/services/auth.services";
import { UNAUTHORIZED_RESPONSE } from "@/constants/global";
import { engineBulkDelete, engineCreateUpdate, engineCreateUpdateNoAuth, engineDelete, engineGet } from "@/services/engine.services";
import { ApiPayload } from "@/types/apiResult.type";
import { cookies } from "next/headers";
import { cookiesConfig } from "@/lib/utils";
import { headers } from "next/headers";
import { setRequestLocale } from "next-intl/server";
import { Locale, locales, defaultLocale } from "@/i18n/config";

export async function checkLangService() {
  try {
    const cookieStore = await cookies();
    const lang = cookieStore.get("NEXT_LOCALE")?.value;
    return lang;
  } catch (error) {
    console.error("Error accessing cookies:", error);
  }
}

const isSupportedLocale = (lang: string): lang is Locale => {
  return (locales as readonly string[]).includes(lang);
};

export async function getLangService() {
  try {
    const cookieStore = await cookies();
    let lang = cookieStore.get("NEXT_LOCALE")?.value;

    if (!lang || !isSupportedLocale(lang)) {
      const requestHeaders = await headers();
      const pathname = requestHeaders.get("x-pathname") || "";
      const pathLocale = pathname.split("/")[1];

      lang = isSupportedLocale(pathLocale) ? pathLocale : defaultLocale;
    }

    setRequestLocale(lang as Locale);
    return lang as Locale;
  } catch (error) {
    console.error("Error accessing cookies:", error);
    setRequestLocale(defaultLocale);
    return defaultLocale;
  }
}

export async function setLangService(newLang: Locale) {
  try {
    const cookieStore = await cookies();
    const langToSet = isSupportedLocale(newLang) ? newLang : defaultLocale;
    cookieStore.set("NEXT_LOCALE", langToSet, cookiesConfig);
    setRequestLocale(langToSet);
    return langToSet;
  } catch (error) {
    console.error("Error accessing cookies:", error);
    setRequestLocale(defaultLocale);
    return defaultLocale;
  }
}

export async function getListService(
  api: string,
  page: number,
  limit: number,
  search: string,
  sort: string,
  order: string,
  filters?: Record<string, string | number>
) {
  // Build URL with all params
  const baseUrl = `${API_URL}/api/${api}`;
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    search: search ?? "",
    sort: sort ?? "",
    order: order ?? "",
  });
  // Add filter fields
  if (filters) {
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        params.append(k, String(v));
      }
    });
  }
  const url = `${baseUrl}?${params.toString()}`;
  let res = UNAUTHORIZED_RESPONSE;
  if (url && url !== "") {
    const authToken = await getAuthTokenService();
    if (!authToken) {
      return res;
    } else {
      res = await engineGet(authToken, url);
    }
    return res;
  }
  return res;
}

export async function getService(api: string) {
  const url = `${API_URL}/api/${api}`;
  let res = UNAUTHORIZED_RESPONSE;
  if (url && url !== "") {
    const authToken = await getAuthTokenService();
    if (!authToken) {
      return res;
    } else {
      res = await engineGet(authToken, url);
    }
    return res;
  }
  return res;
}

export async function getOneService(api: string, id: number) {
  const url = `${API_URL}/api/${api}/${id}`;
  let res = UNAUTHORIZED_RESPONSE;
  if (url && url !== "") {
    const authToken = await getAuthTokenService();
    if (!authToken) {
      return res;
    } else {
      res = await engineGet(authToken, url);
    }
    return res;
  }
  return res;
}

export async function getSubListService(
  api: string,
  parent: string,
  parentId: string | number,
  page: number,
  limit: number,
  search: string,
  sort: string,
  order: string
) {
  const url = `${API_URL}/api/${api}?${parent}=${parentId}&page=${page}&limit=${limit}&search=${search}&sort=${sort}&order=${order}`;
  let res = UNAUTHORIZED_RESPONSE;
  if (url && url !== "") {
    const authToken = await getAuthTokenService();
    if (!authToken) {
      return res;
    } else {
      res = await engineGet(authToken, url);
    }
    return res;
  }
  return res;
}

export async function createUpdateNoAuthService(payload: ApiPayload) {
  const url = `${API_URL}/api/${payload.api}`;
  let res = UNAUTHORIZED_RESPONSE;
  if (url && url !== "") {
    res = await engineCreateUpdateNoAuth(String(payload.formMethod), url, payload);
    return res;
  }
  return res;
}

export async function createUpdatePostTokenService(payload: ApiPayload) {
  const url = `${API_URL}/api/${payload.api}`;
  let res = UNAUTHORIZED_RESPONSE;
  if (url && url !== "") {
    const authToken = String(payload?.token);
    if (!authToken) {
      return res;
    } else {
      res = await engineCreateUpdate(String(payload.formMethod), authToken, url, payload);
    }
    return res;
  }
  return res;
}

export async function createUpdateService(payload: ApiPayload) {
  const url = `${API_URL}/api/${payload.api}`;
  let res = UNAUTHORIZED_RESPONSE;
  if (url && url !== "") {
    const authToken = await getAuthTokenService();
    if (!authToken) {
      return res;
    } else {
      res = await engineCreateUpdate(String(payload.formMethod), authToken, url, payload);
    }
    return res;
  }
  return res;
}

export async function deleteService(api: string, id: number) {
  const url = `${API_URL}/api/${api}`;
  let res = UNAUTHORIZED_RESPONSE;
  if (url && url !== "") {
    const authToken = await getAuthTokenService();
    if (!authToken) {
      return res;
    } else {
      res = await engineDelete(authToken, url, id);
    }
    return res;
  }
  return res;
}

export async function bulkDeleteService(api: string, ids: Array<number>) {
  const url = `${API_URL}/api/${api}/bulk`;
  let res = UNAUTHORIZED_RESPONSE;
  if (url && url !== "") {
    const authToken = await getAuthTokenService();
    if (!authToken) {
      return res;
    } else {
      res = await engineBulkDelete(authToken, url, ids);
    }
    return res;
  }
  return res;
}
