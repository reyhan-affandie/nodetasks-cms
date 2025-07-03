import { MethodSchema } from "@/constants/global";
import { z } from "zod";
import { regexAddress, regexEmail, regexNumber, regexPassword, regexPhone, regexString } from "@/lib/regex";

const ModuleSchema = z.enum(["users"]);

export const schema = z
  .object({
    formMethod: MethodSchema,
    api: ModuleSchema,
    id: z.string().optional(),

    role: z.string().regex(regexNumber, { message: "Invalid parent ID format" }),

    photo: z.any(), // validation will be handled in .superRefine

    name: z
      .string()
      .min(6, { message: "Name must have at least 6 characters" })
      .max(191, { message: "Name must have max 191 characters" })
      .regex(regexString, { message: "Invalid name format" }),

    email: z
      .string()
      .min(6, { message: "Email must have at least 6 characters" })
      .max(191, { message: "Email must have max 191 characters" })
      .regex(regexEmail, { message: "Invalid email format" }),

    password: z.string().optional(),

    phone: z
      .string()
      .min(6, { message: "Phone must have at least 6 characters" })
      .max(20, { message: "Phone must have max 20 characters" })
      .regex(regexPhone, { message: "Invalid phone format" }),

    address: z
      .string()
      .min(6, { message: "Address must have at least 6 characters" })
      .max(191, { message: "Address must have max 191 characters" })
      .regex(regexAddress, { message: "Invalid address format" }),
  })
  .superRefine((data, ctx) => {
    const isCreate = data.formMethod === "create";
    const isUpdate = data.formMethod === "update";

    if (isUpdate && !data.id) {
      ctx.addIssue({
        path: ["id"],
        code: z.ZodIssueCode.custom,
        message: "ID is required for update",
      });
    }

    // Password required for create, optional on update
    if (isCreate) {
      if (!data.password) {
        ctx.addIssue({
          path: ["password"],
          message: "Password is required when creating a user.",
          code: "custom",
        });
      } else if (!regexPassword.test(data.password)) {
        ctx.addIssue({
          path: ["password"],
          message: "Password format is invalid.",
          code: "custom",
        });
      }
    }

    // File validation (photo)
    const isFile = data.photo instanceof File;
    const isString = typeof data.photo === "string";
    const isEmpty = data.photo === null || data.photo === undefined;

    if (!isFile && !isString && !isEmpty) {
      ctx.addIssue({
        path: ["photo"],
        code: z.ZodIssueCode.custom,
        message: "Photo must be a valid file or an existing file path.",
      });
    }

    if (isFile && data.photo.size > 10 * 1024 * 1024) {
      ctx.addIssue({
        path: ["photo"],
        code: z.ZodIssueCode.custom,
        message: "Photo must be less than or equal to 10MB.",
      });
    }
  });
