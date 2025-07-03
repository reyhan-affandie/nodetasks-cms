import { MethodSchema } from "@/constants/global";
import { z } from "zod";
import { regexAddress, regexEmail, regexPassword, regexPhone, regexString } from "@/lib/regex";

const ModuleSchema = z.enum(["auth/register"]);

export const registerSchema = z.object({
  formMethod: MethodSchema,
  api: ModuleSchema,
  photo: z
    .any()
    .optional()
    .refine((file) => !file || file instanceof File, {
      message: "Photo must be a valid file if provided.",
    })
    .refine((file) => !file || file.size <= 10 * 1024 * 1024, {
      message: "Photo must be less than or equal to 10MB.",
    }),

  name: z
    .string()
    .min(6, { message: "name must have at least 6 characters" })
    .max(191, { message: "name must have max 191 characters" })
    .regex(regexString, { message: "Invalid name format" }),
  email: z
    .string()
    .min(6, { message: "email must have at least 6 characters" })
    .max(191, { message: "email must have max 191 characters" })
    .regex(regexEmail, { message: "Invalid email format" }),
  phone: z
    .string()
    .min(6, { message: "phone must have at least 6 characters" })
    .max(20, { message: "phone must have max 20 characters" })
    .regex(regexPhone, { message: "Invalid phone format" }),
  password: z
    .string()
    .min(6, { message: "Password must have at least 6 characters" })
    .max(191, { message: "Password must have max 191 characters" })
    .regex(regexPassword, { message: "Invalid password format" }),
  address: z
    .string()
    .min(6, { message: "address must have at least 6 characters" })
    .max(191, { message: "address must have max 191 characters" })
    .regex(regexAddress, { message: "Invalid address format" }),
});
