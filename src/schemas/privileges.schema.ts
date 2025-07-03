import { MethodSchema } from "@/constants/global";
import { z } from "zod";
import { regexNumber } from "@/lib/regex";

const ModuleSchema = z.enum(["privileges"]);

export const schema = z
  .object({
    formMethod: MethodSchema,
    api: ModuleSchema,
    id: z.string().optional(),
    role: z.string().regex(regexNumber, { message: "Invalid parent ID format" }),
    feature: z.string().regex(regexNumber, { message: "Invalid parent ID format" }),
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
