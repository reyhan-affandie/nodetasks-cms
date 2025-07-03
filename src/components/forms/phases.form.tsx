"use client";

import { phasesValidation, phasesAction } from "@/actions/phases.actions";
import { DefaultStateType, FORM_INITIAL_STATE } from "@/constants/global";
import { useActionState, useEffect, useRef, useState } from "react";
import { ErrorsHandling, ErrorsZod } from "@/components/customs/errors";
import { SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { JustLogo } from "@/components/customs/logo";
import { ApiPayload, Dispatcher } from "@/types/apiResult.type";
import { Button } from "@/components/ui/button";
import { toastMessage } from "@/components/customs/toast.message";
import { SpecialSubmitButton } from "@/components/customs/button.submit";
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
  const [formState, formAction] = useActionState(phasesAction, selectedData);
  const [errors, setErrors] = useState<typeof formState | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState(selectedData?.data?.name ?? "");
  const [name_en, setNameEn] = useState(selectedData?.data?.name_en ?? "");
  const [name_id, setNameId] = useState(selectedData?.data?.name_id ?? "");
  const [name_ph, setNamePh] = useState(selectedData?.data?.name_ph ?? "");

  const formRef = useRef<HTMLFormElement>(null);

  const resetState = () => {
    setErrors(null);
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
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState]);

  useEffect(() => {
    if (selectedData?.data !== null && formTitle === "update") {
      setName(selectedData.data.name ?? "");
      setNameEn(selectedData.data.name_en ?? "");
      setNameId(selectedData.data.name_id ?? "");
      setNamePh(selectedData.data.name_ph ?? "");
    } else if (formTitle === "create") {
      setName("");
      setNameEn("");
      setNameId("");
      setNamePh("");
    }
  }, [selectedData, formTitle]);

  const handleSubmit = async () => {
    setIsLoading(true);
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);

    const result = await phasesValidation(formData);
    if (result) {
      setErrors(result);
      toastMessage({ api, variant: "destructive", status: formState?.status, statusText: formState?.statusText });
      setIsLoading(false);
      return;
    }
    setErrors(null);
    formRef.current.requestSubmit();
  };

  return (
    <SheetContent side="left" className="bg-blue-50 pt-12 max-h-screen overflow-auto">
      <form ref={formRef} action={formAction} className="p-4 border border-gray-300 rounded-md space-y-4">
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

        {[
          ["name", name, setName, 191],
          ["name_en", name_en, setNameEn, 191],
          ["name_id", name_id, setNameId, 191],
          ["name_ph", name_ph, setNamePh, 191],
        ].map(([key, value, setter, maxLength]) => (
          <div key={key as string}>
            <Label htmlFor={key as string} className="flex items-center gap-1 mb-1" required>
              {t(key as string)}
            </Label>
            <Input
              id={key as string}
              name={key as string}
              type="text"
              placeholder={t(`${key as string}_placeholder`)}
              className="border-blue-400"
              value={value as string}
              maxLength={maxLength as number}
              onChange={(e) => setter(e.target.value)}
              required
            />
            <ErrorsZod error={errors?.zodErrors?.[key as string]} />
          </div>
        ))}

        <SheetFooter className="flex flex-row space-x-1">
          <SheetClose asChild className="flex flex-1">
            <SpecialSubmitButton text={t("save")} onClick={() => handleSubmit()} loading={isLoading} loadingText="Loading" />
          </SheetClose>
          <SheetClose asChild className="flex flex-1">
            <Button variant={"destructive"} onClick={resetState}>
              {t("close")}
            </Button>
          </SheetClose>
        </SheetFooter>
        <ErrorsHandling error={errors?.message} />
        <ErrorsHandling error={formState?.message} />
      </form>
    </SheetContent>
  );
}
