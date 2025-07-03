"use client";

import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ApiPayload, Dispatcher } from "@/types/apiResult.type";
import { DefaultStateType, FORM_INITIAL_STATE } from "@/constants/global";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

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

  const data = selectedData?.data;

  return (
    <AlertDialog open={alertViewOpen}>
      <AlertDialogContent className="max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("view")} {api}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <div className="space-y-4">
          {[
            ["name", data?.name],
            ["description", data?.description],
            ["create", data?.featureCreate ? t("active") : t("inactive")],
            ["read", data?.featureRead ? t("active") : t("inactive")],
            ["update", data?.featureUpdate ? t("active") : t("inactive")],
            ["delete", data?.featureDelete ? t("active") : t("inactive")],
            ["createdAt", data?.createdAt ? format(new Date(data.createdAt), "MMM dd, yyyy HH:mm:ss") : "-"],
            ["updatedAt", data?.updatedAt ? format(new Date(data.updatedAt), "MMM dd, yyyy HH:mm:ss") : "-"],
          ].map(([key, value]) => (
            <div key={key}>
              <Label>{t(key)}</Label>
              <p>{value || "-"}</p>
            </div>
          ))}
        </div>
        <AlertDialogFooter>
          <Button variant={"destructive"} onClick={resetState}>
            {t("close")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
