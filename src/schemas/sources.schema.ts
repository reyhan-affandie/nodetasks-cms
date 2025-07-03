import { MethodSchema } from "@/constants/global";
import { z } from "zod";
import { regexString } from "@/lib/regex";

const ModuleSchema = z.enum(["sources"]);

export const schema = z
  .object({
    formMethod: MethodSchema,
    api: ModuleSchema,
    id: z.string().optional(),
    name: z
      .string()
      .min(3, { message: "name must have at least 3 characters" })
      .max(191, { message: "name must have max 191 characters" })
      .regex(regexString, { message: "Invalid name format" }),
  })
  .superRefine((data, ctx) => {
    if (data.formMethod === "update" && !data.id) {
      ctx.addIssue({
        path: ["id"],
        code: z.ZodIssueCode.custom,
        message: "ID is required for update",
      });
    }
  });
