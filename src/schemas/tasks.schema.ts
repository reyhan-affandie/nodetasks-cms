import { MethodSchema } from "@/constants/global";
import { z } from "zod";
import { regexNumber, regexString } from "@/lib/regex";

// This function accepts a translation function 't'
export function schema(t: (key: string) => string) {
  const ModuleSchema = z.enum(["tasks"]);
  return z
    .object({
      formMethod: MethodSchema,
      api: ModuleSchema,
      id: z.string().optional(),

      image: z.any().optional(),
      file: z.any().optional(),

      priority: z.string().regex(regexNumber, { message: `${t("priority")} ${t("invalid_format")}` }),
      phase: z.string().regex(regexNumber, { message: `${t("phase")} ${t("invalid_format")}` }),

      name: z
        .string()
        .min(1, { message: `${t("name")} ${t("min_characters")} 1` })
        .max(191, { message: `${t("name")} ${t("max_characters")} 191` })
        .regex(regexString, { message: `${t("name")} ${t("invalid_format")}` }),

      description: z
        .string()
        .min(1, { message: `${t("description")} ${t("min_characters")} 1` })
        .max(4096, { message: `${t("description")} ${t("max_characters")} 4096` })
        .regex(regexString, { message: `${t("description")} ${t("invalid_format")}` }),

      assigneeId: z.string().regex(regexNumber, { message: `${t("assignee")} ${t("required_field")}` }),

      start: z
        .string()
        .min(1, { message: `${t("start")} ${t("required_field")}` })
        .regex(/^\d{4}-\d{2}-\d{2}$/, { message: `${t("start")} ${t("invalid_format")}` }),

      deadline: z
        .string()
        .min(1, { message: `${t("deadline")} ${t("required_field")}` })
        .regex(/^\d{4}-\d{2}-\d{2}$/, { message: `${t("deadline")} ${t("invalid_format")}` }),
    })
    .superRefine((data, ctx) => {
      const isUpdate = data.formMethod === "update";
      if (isUpdate && !data.id) {
        ctx.addIssue({
          path: ["id"],
          code: z.ZodIssueCode.custom,
          message: `${t("id")} ${t("required_for_update")}`,
        });
      }

      // Validate that deadline is not before start
      if (data.start && data.deadline) {
        const startDate = new Date(data.start);
        const deadlineDate = new Date(data.deadline);
        if (deadlineDate < startDate) {
          ctx.addIssue({
            path: ["deadline"],
            code: z.ZodIssueCode.custom,
            message: `${t("deadline")} ${t("invalid_format")}: ${t("deadline")} < ${t("start")}`,
          });
        }
      }

      // Image validation (if present)
      if (data.image !== null && data.image !== undefined && data.image !== "") {
        const isFileImage = typeof File !== "undefined" && data.image instanceof File;
        const isStringImage = typeof data.image === "string";
        if (!isFileImage && !isStringImage) {
          ctx.addIssue({
            path: ["image"],
            code: z.ZodIssueCode.custom,
            message: `${t("image")} ${t("invalid_file")}`,
          });
        }
        if (isFileImage && data.image.size > 10 * 1024 * 1024) {
          ctx.addIssue({
            path: ["image"],
            code: z.ZodIssueCode.custom,
            message: `${t("image")} ${t("max_file_size")} 10MB`,
          });
        }
      }

      // File validation (if present)
      if (data.file !== null && data.file !== undefined && data.file !== "") {
        const isFileFile = typeof File !== "undefined" && data.file instanceof File;
        const isStringFile = typeof data.file === "string";
        if (!isFileFile && !isStringFile) {
          ctx.addIssue({
            path: ["file"],
            code: z.ZodIssueCode.custom,
            message: `${t("file")} ${t("invalid_file")}`,
          });
        }
        if (isFileFile && data.file.size > 10 * 1024 * 1024) {
          ctx.addIssue({
            path: ["file"],
            code: z.ZodIssueCode.custom,
            message: `${t("file")} ${t("max_file_size")} 10MB`,
          });
        }
      }
    });
}
