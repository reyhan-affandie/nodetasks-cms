"use client";

import { phasesValidation, phasesAction } from "@/actions/phases.actions";
import { DefaultStateType, FORM_INITIAL_STATE } from "@/constants/global";
import { useActionState, useEffect, useRef, useState } from "react";
import { ErrorsHandling, ErrorsZod } from "@/components/customs/errors";
import { SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { JustLogo } from "@/components/customs/logo";
import { ApiPayload, Dispatcher } from "@/types/apiResult.type";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
  const [name_de, setNameDe] = useState(selectedData?.data?.name_de ?? "");
  const [name_id, setNameId] = useState(selectedData?.data?.name_id ?? "");
  const [name_nl, setNameNl] = useState(selectedData?.data?.name_nl ?? "");
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
      toast.error(api, {
        description: formState?.status + " | " + formState?.statusText,
      });
    }
    if (formState?.error === false) {
      resetState();
      toast.success(formTitle + " | " + api, {
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
      setNameEn(selectedData.data.name_de ?? "");
      setNameEn(selectedData.data.name_nl ?? "");
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
      toast.error(api, {
        description: result?.message,
      });
      setIsLoading(false);
      return;
    }
    setErrors(null);
    formRef.current.requestSubmit();
  };

  return (
    <SheetContent side="left" className="bg-blue-50 pt-12 max-h-screen overflow-auto">
      <form ref={formRef} action={formAction} className="p-4 mx-4 border border-gray-300 rounded-md space-y-4">
        <SheetHeader className="bg-blue-950 p-2 w-full font-normal rounded-md">
          <SheetTitle className="text-white px-1">
            <div className="flex flex-row">
              <JustLogo />
              <div className="flex flex-1 px-4 items-center">
                {formTitle} {api}
              </div>
            </div>
          </SheetTitle>
        </SheetHeader>
        <input id="formMethod" name="formMethod" type="hidden" defaultValue={formTitle} />
        <input id="api" name="api" type="hidden" defaultValue={api} />
        <input id="id" name="id" type="hidden" defaultValue={selectedData?.data?.id} />

        {[
          ["name", name, setName, 191],
          ["en", name_en, setNameEn, 191],
          ["de", name_de, setNameDe, 191],
          ["nl", name_nl, setNameNl, 191],
          ["id", name_id, setNameId, 191],
          ["ph", name_ph, setNamePh, 191],
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

        <SheetFooter className="flex flex-row w-full p-0 m-0">
          <SpecialSubmitButton className="flex flex-1" text={t("save")} onClick={() => handleSubmit()} loading={isLoading} loadingText="Loading" />
          <SheetClose asChild className="flex flex-1">
            <Button className="cursor-pointer" variant="destructive" onClick={resetState}>
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
