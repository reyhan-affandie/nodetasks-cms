/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { eventsValidation, eventsAction } from "@/actions/events.actions";
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
import { useLocale, useTranslations } from "next-intl";
import { SpecialSubmitButton } from "@/components/customs/button.submit";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import UserPicker from "@/components/pickers/users.picker";
import { Switch } from "@/components/ui/switch";

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
  const locale = useLocale();
  const formActionWithLocale: any = async (prevState: any, formData: FormData) => {
    return eventsAction(prevState, formData, locale);
  };

  const [formState, formAction] = useActionState(formActionWithLocale, selectedData);
  const [errors, setErrors] = useState<typeof formState | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [user, setUser] = useState(selectedData?.data?.userId ?? "");
  const [userName, setUserName] = useState(selectedData?.data?.user?.name ?? "");
  const [userPickerOpen, setUserPickerOpen] = useState(false);

  const [dataDate, setDataDate] = useState<Date | undefined>(selectedData?.data?.dataDate ? new Date(selectedData.data.dataDate) : undefined);
  const [startTime, setStartTime] = useState(selectedData?.data?.startTime || "");
  const [endTime, setEndTime] = useState(selectedData?.data?.endTime || "");
  const [title, setTitle] = useState(selectedData?.data?.title || "");
  const [status, setStatus] = useState<boolean>(selectedData?.data?.status ?? false);

  const [openDate, setOpenDate] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (selectedData?.data !== null && formTitle === "update") {
      setTitle(selectedData.data.title || "");
      setUser(selectedData.data.userId ?? "");
      setUserName(selectedData.data.user?.name ?? "");
      setDataDate(selectedData.data.dataDate ? new Date(selectedData.data.dataDate) : undefined);
      setStartTime(selectedData.data.startTime || "");
      setEndTime(selectedData.data.endTime || "");
      setStatus(selectedData.data.status || false);
    } else if (formTitle === "create") {
      setTitle("");
      setUser("");
      setUserName("");
      setDataDate(undefined);
      setStartTime("");
      setEndTime("");
      setStatus(false);
    }
  }, [selectedData, formTitle]);

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
    setData((prevData) => prevData.map((item) => ({ ...item, x: false })));
  };

  useEffect(() => {
    if (formState?.error === true) {
      toastMessage({ api, variant: "destructive", status: formState?.status, statusText: formState?.statusText });
    }
    if (formState?.error === false) {
      resetState();
      toastMessage({ api, variant: "default", description: formTitle === "create" ? "Data successfully created" : "Data successfully updated" });
      reload();
    }
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState]);

  const handleSubmit = async () => {
    setIsLoading(true);
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    formData.set("userId", user ?? "");
    if (dataDate) formData.set("dataDate", format(dataDate, "yyyy-MM-dd"));
    formData.set("startTime", startTime);
    formData.set("endTime", endTime);

    const result = await eventsValidation(formData, locale);
    if (result) {
      setErrors(result);
      toastMessage({
        api,
        variant: "destructive",
        status: formState?.status,
        statusText: formState?.statusText,
      });
      setIsLoading(false);
      return;
    }

    setErrors(null);

    try {
      if (formRef.current?.requestSubmit) {
        formRef.current.requestSubmit(); // will trigger formAction
      } else {
        // fallback if requestSubmit or server action fails
        const result = await eventsAction(null, formData, locale);
        if (result?.error) {
          toastMessage({
            api,
            variant: "destructive",
            status: result.error,
            statusText: result.message,
          });
          setErrors(result);
        } else {
          toastMessage({
            api,
            variant: "default",
            status: 200,
            statusText: "success",
          });
          reload();
          setErrors(null);
          // Optionally close modal here
        }
      }
    } finally {
      setIsLoading(false);
    }
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

        <div>
          <Label htmlFor="title" className="flex items-center gap-1 mb-1" required>
            {t("title")}
          </Label>
          <Input id="title" name="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={191} className="border-blue-400" />
          <ErrorsZod error={errors?.zodErrors?.title} />
        </div>

        <div>
          <Label htmlFor="dataDate" className="flex items-center gap-1 mb-1" required>
            {t("data_date")}
          </Label>
          <Popover open={openDate} onOpenChange={setOpenDate}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-full justify-start text-left font-normal border-blue-400 bg-blue-50 ${!dataDate ? "text-muted-foreground" : ""}`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dataDate ? format(dataDate, "yyyy-MM-dd") : t("choose_date")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border border-blue-400 bg-white shadow-md rounded-md" align="start">
              <Calendar
                mode="single"
                selected={dataDate}
                onSelect={(date) => {
                  setDataDate(date);
                  setOpenDate(false);
                }}
                initialFocus
                captionLayout="dropdown-buttons"
                fromYear={2000}
                toYear={new Date().getFullYear() + 10}
              />
            </PopoverContent>
          </Popover>
          <input type="hidden" name="dataDate" value={dataDate ? format(dataDate, "yyyy-MM-dd") : ""} />
          <ErrorsZod error={errors?.zodErrors?.dataDate} />
        </div>

        <div>
          <Label htmlFor="startTime" className="flex items-center gap-1 mb-1" required>
            {t("start_time")}
          </Label>
          <Input
            id="startTime"
            name="startTime"
            type="text"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            maxLength={5}
            className="border-blue-400"
            placeholder="HH:mm"
          />
          <ErrorsZod error={errors?.zodErrors?.startTime} />
        </div>

        <div>
          <Label htmlFor="endTime" className="flex items-center gap-1 mb-1" required>
            {t("end_time")}
          </Label>
          <Input
            id="endTime"
            name="endTime"
            type="text"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            maxLength={5}
            className="border-blue-400"
            placeholder="HH:mm"
          />
          <ErrorsZod error={errors?.zodErrors?.endTime} />
        </div>

        <div>
          <Label htmlFor="user" className="flex items-center gap-1 mb-1">
            {t("name")}
          </Label>
          <div className="flex gap-2 items-center">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-blue-400 bg-blue-50 justify-start text-left"
              onClick={() => setUserPickerOpen(true)}
            >
              {userName ? userName : t("choose_user")}
            </Button>
          </div>
          <input type="hidden" name="user" value={user ?? ""} />
          <ErrorsZod error={errors?.zodErrors?.user} />
        </div>

        <div>
          <Label htmlFor="status" className="flex items-center gap-1 mb-1">
            {t("status")}
          </Label>
          <div className="flex items-center space-x-2">
            <Switch checked={Boolean(status)} onCheckedChange={() => setStatus(!status)} />
            <input type="hidden" name="status" value={status ? "true" : "false"} />
            <span className="text-sm">{status ? t("paid") : t("unpaid")}</span>
          </div>
        </div>

        {userPickerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <UserPicker
              onSelect={(user) => {
                setUser(user.id);
                setUserName(user.name);
                setUserPickerOpen(false);
              }}
              onClose={() => setUserPickerOpen(false)}
            />
          </div>
        )}

        <SheetFooter className="flex flex-row space-x-1">
          <SheetClose asChild className="flex flex-1">
            <SpecialSubmitButton text={t("save")} {...{ onClick: () => handleSubmit(), loading: isLoading, loadingText: "Loading" }} />
          </SheetClose>
          <SheetClose asChild className="flex flex-1">
            <Button variant="destructive" onClick={resetState}>
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
