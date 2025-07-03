import { MethodSchema } from "@/constants/global";
import { z } from "zod";
import { regexPassword, regexString } from "@/lib/regex";

const ModuleSchema = z.enum(["auth/password/forgot"]);

export const verifyForgotPasswordSchema = z
  .object({
    formMethod: MethodSchema,
    api: ModuleSchema,
    token: z
      .string()
      .min(50, { message: "Token must have at least 50 characters" })
      .max(1024, { message: "Token must have max 1024 characters" })
      .regex(regexString, { message: "Invalid password format" }),
    password: z
      .string()
      .min(6, { message: "Password must have at least 6 characters" })
      .max(191, { message: "Password must have max 191 characters" })
      .regex(regexPassword, { message: "Invalid password format" }),
    confirmPassword: z
      .string()
      .min(6, { message: "Password must have at least 6 characters" })
      .max(191, { message: "Password must have max 191 characters" })
      .regex(regexPassword, { message: "Invalid password format" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
