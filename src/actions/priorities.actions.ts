"use server";

import { schema } from "@/schemas/priorities.schema";
import { createUpdateService } from "@/services/services";

export async function prioritiesValidation(formData: FormData) {
  const data: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    data[key] = String(value);
  });

  const validatedFields = schema.safeParse(data);
  if (!validatedFields.success) {
    return {
      data,
      zodErrors: validatedFields.error.flatten().fieldErrors,
      message: "Please fix error fields.",
      error: true,
    };
  }
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function prioritiesAction(prevState: any, formData: FormData) {
  const data: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    data[key] = String(value);
  });

  const validatedFields = schema.safeParse(data);
  if (!validatedFields.success) {
    return {
      ...prevState,
      data,
      zodErrors: validatedFields.error.flatten().fieldErrors,
      message: "Please fix error fields.",
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
