"use server";

import { headers } from "next/headers";
import {
  bulkDeleteService,
  createUpdateService,
  deleteService,
  getLangService,
  getListService,
  getOneService,
  getService,
  getSubListService,
  setLangService,
} from "@/services/services";
import { Locale } from "@/i18n/config";

export async function getList(
  api: string,
  page: number,
  limit: number,
  search: string,
  sort: string,
  order: string,
  filters?: Record<string, string | number>
) {
  const res = await getListService(api, page, limit, search, sort, order, filters);
  return res;
}

export async function getMeta() {
  const getHeader = await headers();
  const title = getHeader.get("x-metadata-title");
  const description = getHeader.get("x-metadata-description");
  const data = { title: title, description: description };
  return data;
}

export async function getSubList(
  api: string,
  parent: string,
  parentId: string | number,
  page: number,
  limit: number,
  search: string,
  sort: string,
  order: string
) {
  const res = await getSubListService(api, parent, parentId, page, limit, search, sort, order);
  return res;
}

export async function get(api: string) {
  const res = await getService(api);
  return res;
}

export async function getOne(api: string, id: number) {
  const res = await getOneService(api, id);
  return res;
}

export async function updateField(api: string, id: number, field: string, status: boolean | number) {
  const payload = { formMethod: "update", api, id, [field]: status };
  const res = await createUpdateService(payload);
  return res;
}

export async function updateHls(api: string, id: number) {
  const payload = { formMethod: "update", api, id };
  const res = await createUpdateService(payload);
  return res;
}

export async function deleteAction(api: string, id: number) {
  const res = await deleteService(api, id);
  return res;
}

export async function bulkDeleteAction(api: string, ids: Array<number>) {
  const res = await bulkDeleteService(api, ids);
  return res;
}

export async function getLang() {
  const data = await getLangService();
  return data;
}

export async function setLang(newLang: Locale) {
  const data = await setLangService(newLang);
  return data;
}
