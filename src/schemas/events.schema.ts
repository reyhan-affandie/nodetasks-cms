import { MethodSchema } from "@/constants/global";
import { z } from "zod";
import { regexNumber, regexString, regexTime } from "@/lib/regex";

// This function accepts a translation function 't'
export function schema(t: (key: string) => string) {
  const ModuleSchema = z.enum(["events"]);

  return z
    .object({
      formMethod: MethodSchema,
      api: ModuleSchema,
      id: z.string().optional(),

      user: z.string().regex(regexNumber, { message: `${t("user")} ${t("required_field")}` }),

      title: z
        .string()
        .min(1, { message: `${t("title")} ${t("min_characters")} 1` })
        .max(191, { message: `${t("title")} ${t("max_characters")} 191` })
        .regex(regexString, { message: `${t("title")} ${t("invalid_format")}` }),

      dataDate: z
        .string()
        .min(1, { message: `${t("date")} ${t("required_field")}` })
        .regex(/^\d{4}-\d{2}-\d{2}$/, { message: `${t("date")} ${t("invalid_format")}` }),

      startTime: z
        .string()
        .min(1, { message: `${t("start_time")} ${t("required_field")}` })
        .regex(regexTime, { message: `${t("start_time")} ${t("invalid_format")}` }),

      endTime: z
        .string()
        .min(1, { message: `${t("end_time")} ${t("required_field")}` })
        .regex(regexTime, { message: `${t("end_time")} ${t("invalid_format")}` }),

      status: z
        .enum(["true", "false"], {
          errorMap: () => ({ message: `${t("status")} ${t("invalid_format")}` }),
        })
        .refine((val) => val === "true" || val === "false", {
          message: `${t("status")} ${t("required_field")}`,
        }),
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

      // Validate endTime is not before startTime
      const parseTime = (time: string) => {
        const [h, m] = time.split(":").map(Number);
        return h * 60 + m;
      };

      if (data.startTime && data.endTime) {
        const start = parseTime(data.startTime);
        const end = parseTime(data.endTime);

        if (end < start) {
          ctx.addIssue({
            path: ["endTime"],
            code: z.ZodIssueCode.custom,
            message: `${t("end_time")} ${t("invalid_format")}: ${t("end_time")} < ${t("start_time")}`,
          });
        }
      }
    });
}
