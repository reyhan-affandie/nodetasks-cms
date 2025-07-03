"use server";

import { UNAUTHORIZED_RESPONSE } from "@/constants/global";
import { API_URL } from "@/constants/env";
import { cookies } from "next/headers";
import { engineGet } from "@/services/engine.services";

export async function getAuthTokenService() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("token")?.value;
  return authToken;
}

export async function getAuthUserService() {
  const url = API_URL + "/api/auth";
  const authToken = await getAuthTokenService();
  let res = UNAUTHORIZED_RESPONSE;
  if (!authToken) {
    return res;
  } else {
    res = await engineGet(authToken, url);
  }
  return res;
}

export async function refreshTokenService() {
  const url = API_URL + "/api/auth/refresh";
  const authToken = await getAuthTokenService();
  let res = UNAUTHORIZED_RESPONSE;
  if (!authToken) {
    return res;
  } else {
    res = await engineGet(authToken, url);
  }
  return res;
}
