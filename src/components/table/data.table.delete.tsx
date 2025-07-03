"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { bulkDeleteAction, deleteAction } from "@/actions/actions";
import { ApiResultType, Dispatcher } from "@/types/apiResult.type";
import { useEffect, useState } from "react";
import { toastMessage } from "@/components/customs/toast.message";
import { DefaultStateType, FORM_INITIAL_STATE } from "@/constants/global";
import { AlertDialogDescription } from "@radix-ui/react-alert-dialog";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function DataTableDelete({
  alertDeleteOpen,
  setAlertDeleteOpen,
  api,
  setFormTitle,
  setRefreshTableData,
  description,

  selectedDataId,
  setSelectedDataId,

  selectedDataIds,
  setSelectedDataIds,

  selectedDataDescriptions,
  setSelectedDataDescriptions,
  setSelectedData,
  setSelectCount,
}: {
  api: string;
  setFormTitle: Dispatcher<string>;
  setRefreshTableData: Dispatcher<boolean>;
  description: string;

  alertDeleteOpen: boolean;
  setAlertDeleteOpen: Dispatcher<boolean>;

  selectedDataId: number;
  setSelectedDataId: Dispatcher<number>;

  selectedDataIds: Array<number>;
  setSelectedDataIds: Dispatcher<Array<number>>;

  selectedDataDescriptions: Array<string>;
  setSelectedDataDescriptions: Dispatcher<Array<string>>;
  setSelectedData: Dispatcher<DefaultStateType>;
  setSelectCount: Dispatcher<number>;
}) {
  const t = useTranslations();
  const [formState, setFormState] = useState<ApiResultType>();
  const deleteData = async (selectedDataId: number) => {
    const deletedData = await deleteAction(api, selectedDataId);
    setFormState(deletedData);
  };
  const bulkDeleteData = async () => {
    const bulkDeletedData = await bulkDeleteAction(api, selectedDataIds);
    setFormState(bulkDeletedData);
  };

  const resetState = () => {
    setSelectedDataId(0);
    setSelectedDataIds([]);
    setSelectedDataDescriptions([]);
    setSelectedData({ ...FORM_INITIAL_STATE });
    setSelectCount(0);
    setFormTitle("");
    setRefreshTableData(true);
    setAlertDeleteOpen(false);
  };
  useEffect(() => {
    if (formState?.error === true) {
      resetState();
      toastMessage({
        api: api,
        variant: "destructive",
        status: formState?.status,
        statusText: formState?.statusText,
      });
    }
    if (formState?.error === false) {
      resetState();
      toastMessage({
        api: api,
        variant: "default",
        description: "Data successfuly deleted",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState]);

  let deleteDescription = description;
  if (selectedDataDescriptions.length > 0) {
    deleteDescription = "";
    let key: keyof Array<string>;
    for (key in selectedDataDescriptions) {
      const isLast = Number(key) === selectedDataDescriptions.length - 1;
      deleteDescription += selectedDataDescriptions[key] + (isLast ? "" : ", ");
    }
  }
  return (
    <AlertDialog open={alertDeleteOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("delete_confirmation")} {api}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription className="font-bold">{deleteDescription}</AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={() => {
              if (setSelectCount.length > 0) {
                bulkDeleteData();
              } else {
                deleteData(selectedDataId);
              }
            }}
          >
            {t("yes")}
          </AlertDialogAction>
          <Button variant={"destructive"} onClick={resetState}>
            {t("no")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
