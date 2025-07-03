"use client";

import { usersValidation, usersAction } from "@/actions/users.actions";
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
import { Eye, EyeOff } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/customs/image.upload";
import { useTranslations } from "next-intl";
import { getList } from "@/actions/actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SpecialSubmitButton } from "@/components/customs/button.submit";

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
  const [formState, formAction] = useActionState(usersAction, selectedData);
  const [errors, setErrors] = useState<typeof formState | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [photo, setPhoto] = useState(selectedData?.data?.photo);
  const [name, setName] = useState(selectedData?.data?.name);
  const [email, setEmail] = useState(selectedData?.data?.email);
  const [password, setPassword] = useState(selectedData?.data?.password);
  const [phone, setPhone] = useState(selectedData?.data?.phone);
  const [address, setAddress] = useState(selectedData?.data?.address);
  const [role, setRole] = useState(selectedData?.data?.roleId);
  const [roles, setRoles] = useState<ApiPayload[]>([]);
  const [showPassword, setShowPassword] = useState(false);

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
      setPhoto(selectedData.data.photo);
      setName(selectedData.data.name);
      setEmail(selectedData.data.email);
      setPhone(selectedData.data.phone);
      setAddress(selectedData.data.address);
      setRole(selectedData.data.roleId);
    } else {
      setPhoto("");
      setName("");
      setEmail("");
      setPassword("");
      setPhone("");
      setAddress("");
      setRole("");
    }
  }, [selectedData, formTitle]);

  useEffect(() => {
    const loadRoles = async () => {
      const res = await getList("roles", 1, 100, "", "updatedAt", "desc");
      setRoles(res?.data?.data);
    };
    loadRoles();
  }, []);

  const handleSubmit = async () => {
    setIsLoading(true);
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    if (photo instanceof File) {
      formData.set("photo", photo);
    }

    const result = await usersValidation(formData);
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
    <SheetContent side={"left"} className="bg-blue-50 pt-12 max-h-screen overflow-auto">
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

        <div>
          <Label htmlFor="photo" className="flex items-center gap-1 mb-1">
            {t("photo")}
          </Label>
          <span>(10mb max)</span>
          <ImageUpload id="photo" name="photo" value={photo} onChange={setPhoto} />
          <ErrorsZod error={errors?.zodErrors?.photo} />
        </div>

        {[
          {
            name: "role",
            value: role,
            setter: setRole,
            options: roles,
            labelKey: "role",
          },
        ].map(({ name, value, setter, options, labelKey }) => (
          <div key={name}>
            <Label htmlFor={name} className="flex items-center gap-1 mb-1" required>
              {t(labelKey)}
            </Label>
            <Select name={name} value={String(value)} onValueChange={setter as (v: string) => void}>
              <SelectTrigger className="border-blue-400">
                <SelectValue placeholder={t(labelKey)} />
              </SelectTrigger>
              <SelectContent>
                {(options as Array<{ id: number | string; name?: string; text?: string }>)?.map((opt) => (
                  <SelectItem key={`${name}_${opt.id}`} value={String(opt.id)}>
                    {opt.name || opt.text || "-"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name={name} value={value ?? ""} />
            <ErrorsZod error={errors?.zodErrors?.name} />
          </div>
        ))}

        {[
          ["name", name, setName, 191],
          ["email", email, setEmail, 191],
          ["phone", phone, setPhone, 20],
        ].map(([key, value, setter, maxLength]) => (
          <div key={key as string}>
            <Label htmlFor={key as string} className="flex items-center gap-1 mb-1" required>
              {t(key as string)}
            </Label>
            <Input
              id={key as string}
              name={key as string}
              type={key === "email" ? "email" : "text"}
              placeholder={t(`${key as string}_placeholder`)}
              className="border-blue-400"
              value={value as string}
              maxLength={maxLength as number}
              onChange={(e) => setter(e.target.value)}
            />
            <ErrorsZod error={errors?.zodErrors?.[key as string]} />
          </div>
        ))}

        {formTitle === "create" && (
          <div>
            <div className="flex items-center">
              <Label htmlFor="password" required>
                Password
              </Label>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("password_placeholder")}
                className="border-blue-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={191}
              />
              <ErrorsZod error={errors?.zodErrors?.password} />
              <div className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-gray-700">
                {showPassword ? <Eye onClick={() => setShowPassword(!showPassword)} /> : <EyeOff onClick={() => setShowPassword(!showPassword)} />}
              </div>
            </div>
          </div>
        )}
        <div>
          <Label htmlFor="address" className="flex items-center gap-1 mb-1" required>
            {t("address")}
          </Label>
          <Textarea
            id="address"
            name="address"
            placeholder={t("address_placeholder")}
            className="border-blue-400"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            maxLength={191}
          />
          <ErrorsZod error={errors?.zodErrors?.address} />
        </div>
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
