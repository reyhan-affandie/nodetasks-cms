import { MethodSchema } from "@/constants/global";
import { z } from "zod";
import { regexEmail, regexPassword } from "@/lib/regex";

const ModuleSchema = z.enum(["auth/login"]);

export const loginSchema = z.object({
  formMethod: MethodSchema,
  api: ModuleSchema,
  email: z
    .string()
    .min(6, { message: "email must have at least 6 characters" })
    .max(191, { message: "email must have max 191 characters" })
    .regex(regexEmail, { message: "Invalid email format" }),
  password: z
    .string()
    .min(6, { message: "Password must have at least 6 characters" })
    .max(191, { message: "Password must have max 191 characters" })
    .regex(regexPassword, { message: "Invalid password format" }),
});
