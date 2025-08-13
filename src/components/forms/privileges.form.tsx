"use client";

import { privilegesAction } from "@/actions/privileges.actions";
import { DefaultStateType, FORM_INITIAL_STATE } from "@/constants/global";
import { useActionState, useEffect, useState } from "react";
import { ErrorsHandling, ErrorsZod } from "@/components/customs/errors";
import { SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { JustLogo } from "@/components/customs/logo";
import { SubmitButton } from "@/components/customs/button.submit";
import { ApiPayload, Dispatcher } from "@/types/apiResult.type";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { getList } from "@/actions/actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  parentId,
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
  parentId: number;
}) {
  const t = useTranslations();
  const [formState, formAction] = useActionState(privilegesAction, selectedData);
  const [feature, setFeature] = useState(selectedData?.data?.featureId);
  const [features, setFeatures] = useState<ApiPayload[]>([]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState]);

  useEffect(() => {
    if (selectedData?.data !== null && formTitle === "update") {
      setFeature(selectedData.data.featureId);
    } else {
      setFeature("");
    }
  }, [selectedData, formTitle]);

  useEffect(() => {
    const loadFeatures = async () => {
      const res = await getList("features", 1, 1000, "", "updatedAt", "desc");
      setFeatures(res?.data);
    };
    loadFeatures();
  }, []);

  return (
    <SheetContent side={"left"} className="bg-blue-50 pt-12 max-h-screen overflow-auto">
      <form action={formAction} className="p-4 mx-4 border border-gray-300 rounded-md space-y-4">
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
        <input id="role" name="role" type="hidden" defaultValue={parentId} />

        <div>
          <Label htmlFor="feature" className="flex items-center gap-1 mb-1" required>
            {t("feature")}
          </Label>
          <Select name="feature" value={feature} onValueChange={setFeature}>
            <SelectTrigger className="border-blue-400">
              <SelectValue placeholder={t("feature_placeholder")} />
            </SelectTrigger>
            <SelectContent>
              {features &&
                features.length > 0 &&
                features.map((f) => (
                  <SelectItem key={Number(f.id)} value={String(f.id)}>
                    {String(f.name)}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <ErrorsZod error={formState?.zodErrors?.feature} />
        </div>
        <SheetFooter className="flex flex-row w-full p-0 m-0">
          <SubmitButton className="flex flex-1" text={t("save")} loadingText="Loading" />
          <SheetClose asChild className="flex flex-1">
            <Button className="cursor-pointer" variant="destructive" onClick={resetState}>
              {t("close")}
            </Button>
          </SheetClose>
        </SheetFooter>
        <ErrorsHandling error={formState?.message} />
      </form>
    </SheetContent>
  );
}
