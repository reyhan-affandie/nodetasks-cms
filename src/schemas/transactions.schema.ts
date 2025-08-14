import { MethodSchema } from "@/constants/global";
import { z } from "zod";
import { regexDateTime, regexNumber, regexString } from "@/lib/regex";

// This function accepts a translation function 't'
export function schema(t: (key: string) => string) {
  const ModuleSchema = z.enum(["transactions"]);

  return z
    .object({
      formMethod: MethodSchema,
      api: ModuleSchema,
      id: z.string().optional(),

      // required FKs
      user: z.string().regex(regexNumber, { message: `${t("user")} ${t("required_field")}` }),
      client: z.string().regex(regexNumber, { message: `${t("client")} ${t("required_field")}` }),
      stage: z.string().regex(regexNumber, { message: `${t("stage")} ${t("required_field")}` }),
      currency: z.string().regex(regexNumber, { message: `${t("currency")} ${t("required_field")}` }),

      // data fields
      transactionDate: z
        .string()
        .min(1, { message: `${t("transaction_date")} ${t("required_field")}` })
        .regex(regexDateTime, { message: `${t("transaction_date")} ${t("invalid_format")}` }),

      amount: z
        .string()
        .optional()
        .or(z.literal("")) // allow empty
        .refine((v) => v === undefined || v === "" || regexNumber.test(v), {
          message: `${t("amount")} ${t("invalid_format")}`,
        }),

      notes: z
        .string()
        .optional()
        .refine((v) => v === undefined || v.length <= 5000, {
          message: `${t("notes")} ${t("max_characters")} 5000`,
        }),

      sheet: z
        .string()
        .optional()
        .refine((v) => v === undefined || v.length <= 191, {
          message: `${t("sheet")} ${t("max_characters")} 191`,
        }),

      tab: z
        .string()
        .optional()
        .refine((v) => v === undefined || v === "" || regexNumber.test(v), {
          message: `${t("tab")} ${t("invalid_format")}`,
        }),

      tabname: z
        .string()
        .optional()
        .refine((v) => v === undefined || v.length <= 191, {
          message: `${t("tabname")} ${t("max_characters")} 191`,
        }),

      sheetrow: z
        .string()
        .optional()
        .refine((v) => v === undefined || v === "" || regexNumber.test(v), {
          message: `${t("sheetrow")} ${t("invalid_format")}`,
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

      // Ensure amount, if provided, is >= 0 (BigInt style, integers only)
      if (data.amount && data.amount !== "") {
        try {
          const n = BigInt(data.amount);
          if (n < BigInt(0)) {
            ctx.addIssue({
              path: ["amount"],
              code: z.ZodIssueCode.custom,
              message: `${t("amount")} ${t("must_be_non_negative")}`,
            });
          }
        } catch {
          ctx.addIssue({
            path: ["amount"],
            code: z.ZodIssueCode.custom,
            message: `${t("amount")} ${t("invalid_format")}`,
          });
        }
      }

      // If any of sheet/tab/sheetrow is provided, require all three (to satisfy the unique tuple logic cleanly)
      const anyProvided = (data.sheet && data.sheet !== "") || (data.tab && data.tab !== "") || (data.sheetrow && data.sheetrow !== "");

      if (anyProvided) {
        if (!data.sheet || data.sheet === "") {
          ctx.addIssue({
            path: ["sheet"],
            code: z.ZodIssueCode.custom,
            message: `${t("sheet")} ${t("required_field")}`,
          });
        }
        if (!data.tab || data.tab === "") {
          ctx.addIssue({
            path: ["tab"],
            code: z.ZodIssueCode.custom,
            message: `${t("tab")} ${t("required_field")}`,
          });
        }
        if (!data.sheetrow || data.sheetrow === "") {
          ctx.addIssue({
            path: ["sheetrow"],
            code: z.ZodIssueCode.custom,
            message: `${t("sheetrow")} ${t("required_field")}`,
          });
        }
      }

      // Optional: forbid tabname without sheet/tab/sheetrow context
      if (data.tabname && !anyProvided) {
        ctx.addIssue({
          path: ["tabname"],
          code: z.ZodIssueCode.custom,
          message: `${t("tabname")} ${t("requires")} ${t("sheet")}/${t("tab")}/${t("sheetrow")}`,
        });
      }

      // Basic string safety for notes and tabname if you want to keep your regexString rule
      if (data.notes && !regexString.test(data.notes)) {
        ctx.addIssue({
          path: ["notes"],
          code: z.ZodIssueCode.custom,
          message: `${t("notes")} ${t("invalid_format")}`,
        });
      }
      if (data.tabname && !regexString.test(data.tabname)) {
        ctx.addIssue({
          path: ["tabname"],
          code: z.ZodIssueCode.custom,
          message: `${t("tabname")} ${t("invalid_format")}`,
        });
      }
    });
}
