import { MethodSchema } from "@/constants/global";
import { z } from "zod";
import { regexDateTime, regexString } from "@/lib/regex";

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

      startDateTime: z
        .string()
        .min(1, { message: `${t("start_date_time")} ${t("required_field")}` })
        .regex(regexDateTime, { message: `${t("start_date_time")} ${t("invalid_format")}` }),

      endDateTime: z
        .string()
        .min(1, { message: `${t("end_date_time")} ${t("required_field")}` })
        .regex(regexDateTime, { message: `${t("end_date_time")} ${t("invalid_format")}` }),
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

      if (data.startDateTime && data.endDateTime) {
        const start = parseTime(data.startDateTime);
        const end = parseTime(data.endDateTime);

        if (end < start) {
          ctx.addIssue({
            path: ["endDateTime"],
            code: z.ZodIssueCode.custom,
            message: `${t("endDateTime")} ${t("invalid_format")}: ${t("endDateTime")} < ${t("startDateTime")}`,
          });
        }
      }
    });
}
