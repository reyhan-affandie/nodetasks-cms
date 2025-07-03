import { MethodSchema } from "@/constants/global";
import { z } from "zod";
import { regexNumber, regexPhone, regexString } from "@/lib/regex";

const ModuleSchema = z.enum(["messages"]);

export const schema = z.object({
  formMethod: MethodSchema,
  api: ModuleSchema,
  id: z.string().optional(),
  media: z
    .any()
    .optional()
    .refine((file) => file instanceof File, {
      message: "media must be a valid image or file.",
    }),
  from: z
    .string()
    .min(6, { message: "from must have at least 6 characters" })
    .max(20, { message: "from must have max 20 characters" })
    .regex(regexNumber, { message: "Invalid phone format" }),
  to: z
    .string()
    .min(6, { message: "to must have at least 6 characters" })
    .max(20, { message: "to must have max 20 characters" })
    .regex(regexPhone, { message: "Invalid phone format" }),
  message: z
    .string()
    .min(1, { message: "message must have at least 1 characters" })
    .max(4096, { message: "message must have max 4096 characters" })
    .regex(regexString, { message: "Invalid message format" }),
  status: z.string().max(191).optional(),
});
