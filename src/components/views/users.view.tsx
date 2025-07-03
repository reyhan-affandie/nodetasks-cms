"use client";

import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ApiPayload, Dispatcher } from "@/types/apiResult.type";
import { DefaultStateType, FORM_INITIAL_STATE } from "@/constants/global";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { API_URL } from "@/constants/env";
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
          <div>
            <Label>{t("photo")}</Label>
            {data?.photo ? (
              <Image
                src={`${API_URL}/${data?.photo}`}
                alt="Uploaded File"
                width={200}
                height={200}
                className="border border-gray-300 h-auto object-contain rounded"
              />
            ) : (
              <p className="text-gray-500">-</p>
            )}
          </div>
          {[
            ["role", data?.role?.name],
            ["name", data?.name],
            ["email", data?.email],
            ["phone", data?.phone],
            ["address", data?.address],
            ["createdAt", data?.createdAt ? format(new Date(data.createdAt as Date), "MMM dd, yyyy HH:mm:ss") : "-"],
            ["updatedAt", data?.updatedAt ? format(new Date(data.updatedAt as Date), "MMM dd, yyyy HH:mm:ss") : "-"],
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
