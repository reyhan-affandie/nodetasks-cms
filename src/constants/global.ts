import { ApiResultType } from "@/types/apiResult.type";
import { z } from "zod";

export const LANGUAGES = ["en", "id", "ph"];

export interface DefaultStateType {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  zodErrors: Record<string, string[]> | null;
  error: boolean | null;
  message: string | null;
  status?: number | undefined;
  statusText?: string | undefined;
}

export const FORM_INITIAL_STATE: DefaultStateType = {
  data: null,
  zodErrors: null,
  error: null,
  message: null,
};

export const MethodSchema = z.enum(["create", "update"]);

export const UNAUTHORIZED_RESPONSE: ApiResultType = {
  error: true,
  status: 401,
  statusText: "Unauthorized",
  data: "Unauthorized",
};

export const NOTFOUND_RESPONSE: ApiResultType = {
  error: true,
  status: 404,
  statusText: "Not Found",
  data: "Not Found",
};