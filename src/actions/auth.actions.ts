"use server";

import { cookies } from "next/headers";
import { getAuthTokenService, getAuthUserService } from "@/services/auth.services";
import { cookiesConfig } from "@/lib/utils";
import { createUpdateNoAuthService, createUpdatePostTokenService } from "@/services/services";
import { registerSchema } from "@/schemas/register.schema";
import { loginSchema } from "@/schemas/login.schema";
import { forgotPasswordSchema } from "@/schemas/forgot.password.schema";
import { verifyForgotPasswordSchema } from "@/schemas/verify.forgot.password.schema";

export async function registerValidation(formData: FormData) {
  const data: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    if (key === "photo") {
      data[key] = value;
    } else {
      data[key] = String(value);
    }
  });

  const validatedFields = registerSchema.safeParse(data);
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
export async function registerAction(prevState: any, formData: FormData) {
  const data: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    if (key === "photo") {
      data[key] = value;
    } else {
      data[key] = String(value);
    }
  });

  const validatedFields = registerSchema.safeParse(data);
  if (!validatedFields.success) {
    return {
      ...prevState,
      data,
      zodErrors: validatedFields.error.flatten().fieldErrors,
      message: "Please fix error fields.",
    };
  }
  const res = await createUpdateNoAuthService(validatedFields.data);
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
      return { redirect: "/thanks/register/success" };
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function loginAction(prevState: any, formData: FormData) {
  const data: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    data[key] = String(value);
  });

  const validatedFields = loginSchema.safeParse(data);
  if (!validatedFields.success) {
    return {
      ...prevState,
      data,
      zodErrors: validatedFields.error.flatten().fieldErrors,
      message: "Please fix error fields.",
    };
  }
  const res = await createUpdateNoAuthService(validatedFields.data);
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
      const cookieStore = await cookies();
      cookieStore.set("token", res.data.token, cookiesConfig);
      return { success: true };
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sendForgotPasswordAction(prevState: any, formData: FormData) {
  const data: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    data[key] = String(value);
  });

  const validatedFields = forgotPasswordSchema.safeParse(data);
  if (!validatedFields.success) {
    return {
      ...prevState,
      data,
      zodErrors: validatedFields.error.flatten().fieldErrors,
      message: "Please fix error fields.",
    };
  }
  const res = await createUpdateNoAuthService(validatedFields.data);
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
      return { redirect: "/thanks/forgot-password/send" };
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function verifyForgotPasswordAction(prevState: any, formData: FormData) {
  const data: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    data[key] = String(value);
  });

  const validatedFields = verifyForgotPasswordSchema.safeParse(data);
  if (!validatedFields.success) {
    return {
      ...prevState,
      data,
      zodErrors: validatedFields.error.flatten().fieldErrors,
      message: "Please fix error fields.",
    };
  }
  const res = await createUpdatePostTokenService(validatedFields.data);
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
      return { redirect: "/thanks/forgot-password/success" };
    }
  }
}
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.set("token", "", { ...cookiesConfig, maxAge: 0 });
  return { success: true };
}

export async function getAuthToken() {
  const data = await getAuthTokenService();
  return data;
}

export async function getAuthUser() {
  const data = await getAuthUserService();
  return data;
}
