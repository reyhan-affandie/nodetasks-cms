"use server";

import { schema } from "@/schemas/tasks.schema";
import { createUpdateService } from "@/services/services";
import { getTranslations } from "next-intl/server";

// Validation function for tasks
export async function tasksValidation(formData: FormData, locale: string) {
  const t = await getTranslations({ locale }); // no namespace needed

  const data: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    if (key === "image" || key === "file") {
      data[key] = value;
    } else {
      data[key] = String(value);
    }
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

// Action handler for form
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function tasksAction(prevState: any, formData: FormData, locale: string) {
  const t = await getTranslations({ locale });

  const data: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    if (key === "image" || key === "file") {
      data[key] = value;
    } else {
      data[key] = String(value);
    }
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

  if (res) {
    if (res.error === true) {
      return {
        ...prevState,
        data,
        zodErrors: null,
        error: res.status,
        message: res.statusText,
      };
    } else {
      return {
        ...prevState,
        data: null,
        zodErrors: null,
        error: false,
        message: null,
      };
    }
  }
}
