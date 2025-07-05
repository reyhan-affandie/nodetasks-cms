"use client";

import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ApiPayload, Dispatcher } from "@/types/apiResult.type";
import { DefaultStateType, FORM_INITIAL_STATE } from "@/constants/global";
import { useTranslations, useLocale } from "next-intl";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { API_URL } from "@/constants/env";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { FileDown } from "lucide-react";

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
  const locale = useLocale();
  const data = selectedData?.data;

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

  // Helper for localized name
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getLocalizedName = (obj: any) => obj?.[`name_${locale}`] || obj?.name || "-";

  // Compose the fields you want to show (in order)
  const fields = [
    ["author", data?.author?.name],
    ["assignee", data?.assignee?.name],
    ["phase", data?.phase ? getLocalizedName(data.phase) : "-"],
    ["priority", data?.priority ? getLocalizedName(data.priority) : "-"],
    ["start", data?.start ? format(new Date(data.start as Date), "yyyy-MM-dd") : "-"],
    ["deadline", data?.deadline ? format(new Date(data.deadline as Date), "yyyy-MM-dd") : "-"],
    ["name", data?.name],
    ["description", data?.description],
    ["createdAt", data?.createdAt ? format(new Date(data.createdAt as Date), "MMM dd, yyyy HH:mm:ss") : "-"],
    ["updatedAt", data?.updatedAt ? format(new Date(data.updatedAt as Date), "MMM dd, yyyy HH:mm:ss") : "-"],
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
          {/* Image field */}
          <div>
            <Label>{t("image")}</Label>
            {data?.image ? (
              <Image
                src={`${API_URL}/${data.image}`}
                alt="Task Image"
                width={200}
                height={200}
                className="border border-gray-300 h-auto object-contain rounded"
              />
            ) : (
              <p className="text-gray-500">-</p>
            )}
          </div>
          {/* File field */}
          <div>
            <Label>{t("file")}</Label>
            <br />
            {data?.file ? (
              <div className="flex flex-col">
                <a
                  href={`${API_URL}/${data.file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded hover:bg-blue-100 transition"
                  title={t("download_file")}
                  style={{ width: 64, height: 64, display: "inline-flex" }}
                >
                  <FileDown className="w-12 h-12 stroke-blue-500" />
                </a>
                <span className="mt-2 text-xs text-gray-600 ">{data.file}</span>
              </div>
            ) : (
              <div className="w-12 h-12 flex">
                <FileDown className="w-12 h-12 stroke-gray-400" />
              </div>
            )}
          </div>

          {/* Loop the rest of fields */}
          {fields.map(([key, value]) => (
            <div key={key as string}>
              <Label>{t(key as string)}</Label>
              <p>{value !== undefined && value !== null && value !== "" ? value : "-"}</p>
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
