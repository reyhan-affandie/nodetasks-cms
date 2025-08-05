import { MethodSchema } from "@/constants/global";
import { z } from "zod";
import { regexString, regexTime } from "@/lib/regex";

export function schema(t: (key: string) => string) {
  const ModuleSchema = z.enum(["schedules"]);

  return z
    .object({
      formMethod: MethodSchema,
      api: ModuleSchema,
      id: z.string().optional(),

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
