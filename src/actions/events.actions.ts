"use server";

import { schema } from "@/schemas/events.schema";
import { createUpdateService } from "@/services/services";
import { getTranslations } from "next-intl/server";

// Validation function for events
export async function eventsValidation(formData: FormData, locale: string) {
  const t = await getTranslations({ locale });

  const data: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    data[key] = String(value);
  });

  const validatedFields = schema(t).safeParse(data);

  if (!validatedFields.success) {
    return {
      data,
      zodErrors: validatedFields.error.flatten().fieldErrors,
      message: t("please_fix_error_fields"),
      error: true,
    };
  }

  return null;
}

// Action handler for events form
export async function eventsAction(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prevState: any,
  formData: FormData,
  locale: string
) {
  const t = await getTranslations({ locale });

  const data: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    data[key] = String(value);
  });

  const validatedFields = schema(t).safeParse(data);

  if (!validatedFields.success) {
    return {
      ...prevState,
      data,
      zodErrors: validatedFields.error.flatten().fieldErrors,
      message: t("please_fix_error_fields"),
    };
  }

  const res = await createUpdateService(validatedFields.data);

  if (res?.error === true) {
    return {
      ...prevState,
      data,
      zodErrors: null,
      error: res.status,
      message: res.statusText,
    };
  }

  return {
    ...prevState,
    data: null,
    zodErrors: null,
    error: false,
    message: null,
  };
}
