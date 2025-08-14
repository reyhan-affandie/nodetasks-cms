"use client";

import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ApiPayload, Dispatcher } from "@/types/apiResult.type";
import { DefaultStateType, FORM_INITIAL_STATE } from "@/constants/global";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatAmount, safeFormatDateTime } from "@/lib/utils";

export function ModuleView({
  alertViewOpen,
  setAlertViewOpen,
  api,
  setFormTitle,
  setData,
  selectedData,
  setSelectedDataId,
  setSelectedDataIds,
  setSelectCount,
  setSelectedData,
}: {
  alertViewOpen: boolean;
  setAlertViewOpen: Dispatcher<boolean>;
  api: string;
  setFormTitle: Dispatcher<string>;
  setData: Dispatcher<Array<ApiPayload>>;
  selectedData: DefaultStateType;
  setSelectedDataId: Dispatcher<number>;
  setSelectedDataIds: Dispatcher<Array<number>>;
  setSelectCount: Dispatcher<number>;
  setSelectedData: Dispatcher<DefaultStateType>;
}) {
  const t = useTranslations();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = selectedData?.data as any;

  const resetState = () => {
    setSelectedDataId(0);
    setSelectedDataIds([]);
    setSelectedData({ ...FORM_INITIAL_STATE });
    setSelectCount(0);
    setFormTitle("");
    setAlertViewOpen(false);
    setData((prevData) =>
      prevData.map((item) => ({
        ...item,
        x: false,
      }))
    );
  };

  const amountWithCurrency = () => {
    const symbol = data?.currency?.symbol ?? "";
    const pretty = formatAmount(data?.amount);
    return pretty === "-" ? "-" : `${symbol ? symbol + " " : ""}${pretty}`;
  };

  // Build fields for display
  const fields: Array<[string, React.ReactNode]> = [
    ["user", data?.user?.name],
    ["client", data?.client?.name],
    ["stage", data?.stage?.name],
    ["currency", data?.currency ? `${data?.currency?.name} ${data?.currency?.symbol ? `(${data.currency.symbol})` : ""}` : "-"],
    ["transaction_date", safeFormatDateTime(data?.transactionDate)],
    ["amount", amountWithCurrency()],
    ["notes", data?.notes],
    ["sheet", data?.sheet],
    ["tab", data?.tab],
    ["tabname", data?.tabname],
    ["sheetrow", data?.sheetrow],
    ["createdAt", safeFormatDateTime(data?.createdAt)],
    ["updatedAt", safeFormatDateTime(data?.updatedAt)],
  ];

  return (
    <AlertDialog open={alertViewOpen}>
      <AlertDialogContent className="max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("view")} {api}
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-4">
          {fields.map(([key, value]) => (
            <div key={key}>
              <Label>{t(key)}</Label>
              <p>{value !== undefined && value !== null && value !== "" ? value : "-"}</p>
            </div>
          ))}
        </div>

        <AlertDialogFooter>
          <Button className="cursor-pointer" variant="destructive" onClick={resetState}>
            {t("close")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
