"use client";

import { rolesAction } from "@/actions/roles.actions";
import { DefaultStateType, FORM_INITIAL_STATE } from "@/constants/global";
import { useActionState, useEffect, useState } from "react";
import { ErrorsHandling, ErrorsZod } from "@/components/customs/errors";
import { SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { JustLogo } from "@/components/customs/logo";
import { SubmitButton } from "@/components/customs/button.submit";
import { ApiPayload, Dispatcher } from "@/types/apiResult.type";
import { Button } from "@/components/ui/button";
import { toastMessage } from "@/components/customs/toast.message";
import { useTranslations } from "next-intl";

export function ModuleForm({
  api,
  formTitle,
  setFormTitle,
  setSheetOpen,
  setData,
  selectedData,
  setSelectedDataId,
  setSelectedDataIds,
  setSelectCount,
  setSelectedData,
  reload,
}: {
  api: string;
  formTitle: string;
  setFormTitle: Dispatcher<string>;
  setSheetOpen: Dispatcher<boolean>;
  setData: Dispatcher<Array<ApiPayload>>;
  selectedData: DefaultStateType;
  setSelectedDataId: Dispatcher<number>;
  setSelectedDataIds: Dispatcher<Array<number>>;
  setSelectCount: Dispatcher<number>;
  setSelectedData: Dispatcher<DefaultStateType>;
  reload: () => void;
}) {
  const t = useTranslations();
  const [formState, formAction] = useActionState(rolesAction, selectedData);
  const [name, setName] = useState(selectedData?.data?.name);
  const [description, setDescription] = useState(selectedData?.data?.description);
  const resetState = () => {
    setSelectedDataId(0);
    setSelectedDataIds([]);
    setSelectedData({ ...FORM_INITIAL_STATE });
    setSelectCount(0);
    setFormTitle("");
    setSheetOpen(false);
    formState.data = null;
    formState.zodErrors = null;
    formState.error = null;
    formState.message = null;
    setData((prevData) =>
      prevData.map((item) => ({
        ...item,
        x: false,
      }))
    );
  };

  useEffect(() => {
    if (formState?.error === true) {
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
        description: formTitle === "create" ? "Data successfully created" : "Data successfully updated",
      });
      reload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState]);

  useEffect(() => {
    if (selectedData?.data !== null && formTitle === "update") {
      setName(selectedData.data.name);
      setDescription(selectedData.data.description);
    } else {
      setName("");
      setDescription("");
    }
  }, [selectedData, formTitle]);

  return (
    <SheetContent side={"left"} className="bg-blue-50 pt-12 max-h-screen overflow-auto">
      <form action={formAction} className="p-4 border border-gray-300 rounded-md space-y-4">
        <SheetHeader>
          <SheetTitle className="bg-blue-950 text-white p-2 font-normal rounded-md">
            <div className="flex flex-row">
              <JustLogo />
              <div className="flex flex-1 px-2 items-center">
                {formTitle} {api}
              </div>
            </div>
          </SheetTitle>
          <SheetDescription>&nbsp;</SheetDescription>
        </SheetHeader>
        <input id="formMethod" name="formMethod" type="hidden" defaultValue={formTitle} />
        <input id="api" name="api" type="hidden" defaultValue={api} />
        <input id="id" name="id" type="hidden" defaultValue={selectedData?.data?.id} />
        <div>
          <Label htmlFor="name" className="flex items-center gap-1 mb-1" required>
            {t("name")}
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder={t("name_placeholder")}
            className="border-blue-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={191}
          />
          <ErrorsZod error={formState?.zodErrors?.name} />
        </div>
        <div>
          <Label htmlFor="description" className="flex items-center gap-1 mb-1" required>
            {t("description")}
          </Label>
          <Input
            id="description"
            name="description"
            type="text"
            placeholder={t("description_placeholder")}
            className="border-blue-400"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <ErrorsZod error={formState?.zodErrors?.description} />
        </div>
        <SheetFooter className="flex flex-row space-x-1">
          <SheetClose asChild className="flex flex-1">
            <SubmitButton text={t("save")} loadingText="Loading" />
          </SheetClose>
          <SheetClose asChild className="flex flex-1">
            <Button variant={"destructive"} onClick={resetState}>
              {t("close")}
            </Button>
          </SheetClose>
        </SheetFooter>
        <ErrorsHandling error={formState?.message} />
      </form>
    </SheetContent>
  );
}
