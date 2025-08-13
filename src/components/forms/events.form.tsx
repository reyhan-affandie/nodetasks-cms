/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CalendarIcon } from "lucide-react";

import { eventsAction, eventsValidation } from "@/actions/events.actions";
import { DefaultStateType, FORM_INITIAL_STATE } from "@/constants/global";
import { ApiPayload, Dispatcher } from "@/types/apiResult.type";

import { SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";

import { JustLogo } from "@/components/customs/logo";
import { SpecialSubmitButton } from "@/components/customs/button.submit";
import { ErrorsHandling, ErrorsZod } from "@/components/customs/errors";
import UserPicker from "@/components/pickers/users.picker";
import { toast } from "sonner";

/** Helpers to format local date/time */
const pad = (n: number) => String(n).padStart(2, "0");
const formatLocalDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const formatLocalTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

/** Combine a picked calendar date + "HH:mm" into a UTC ISO string */
function combineLocalISO(date?: Date, hhmm?: string) {
  if (!date || !hhmm) return "";
  const [hh, mm] = hhmm.split(":").map((n) => parseInt(n, 10));
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hh || 0, mm || 0, 0, 0);
  return d.toISOString();
}

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

  // Initial values
  const initialStartDate = selectedData?.data?.startDateTime ? new Date(String(selectedData.data.startDateTime)) : undefined;
  const initialEndDate = selectedData?.data?.endDateTime ? new Date(String(selectedData.data.endDateTime)) : undefined;

  const [title, setTitle] = useState<string>(selectedData?.data?.title || "");
  const [user, setUser] = useState<string | number>(selectedData?.data?.userId ?? "");
  const [userName, setUserName] = useState<string>(selectedData?.data?.user?.name ?? "");
  const [status, setStatus] = useState<boolean>(Boolean(selectedData?.data?.status));

  const [startDate, setStartDate] = useState<Date | undefined>(initialStartDate);
  const [endDate, setEndDate] = useState<Date | undefined>(initialEndDate);
  const [startTime, setStartTime] = useState<string>(initialStartDate ? formatLocalTime(initialStartDate) : "");
  const [endTime, setEndTime] = useState<string>(initialEndDate ? formatLocalTime(initialEndDate) : "");
  const [openStartDate, setOpenStartDate] = useState(false);
  const [openEndDate, setOpenEndDate] = useState(false);

  const startISO = useMemo(() => combineLocalISO(startDate, startTime), [startDate, startTime]);
  const endISO = useMemo(() => combineLocalISO(endDate, endTime), [endDate, endTime]);

  const [userPickerOpen, setUserPickerOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (selectedData?.data !== null && formTitle === "update") {
      const s = selectedData.data.startDateTime ? new Date(String(selectedData.data.startDateTime)) : undefined;
      const e = selectedData.data.endDateTime ? new Date(String(selectedData.data.endDateTime)) : undefined;

      setTitle(selectedData.data.title || "");
      setUser(selectedData.data.userId ?? "");
      setUserName(selectedData.data.user?.name ?? "");
      setStartDate(s);
      setEndDate(e);
      setStartTime(s ? formatLocalTime(s) : "");
      setEndTime(e ? formatLocalTime(e) : "");
      setStatus(Boolean(selectedData.data.status));
    } else if (formTitle === "create") {
      setTitle("");
      setUser("");
      setUserName("");
      setStartDate(undefined);
      setEndDate(undefined);
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
    formState.data = null as any;
    formState.zodErrors = null as any;
    formState.error = null as any;
    formState.message = null as any;
    setData((prev) => prev.map((item) => ({ ...item, x: false })));
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

  const handleSubmit = async () => {
    setIsLoading(true);
    if (!formRef.current) return;

    const fd = new FormData(formRef.current);
    fd.set("user", String(user));
    fd.set("startDateTime", startISO);
    fd.set("endDateTime", endISO);
    fd.set("status", status ? "true" : "false");

    const result = await eventsValidation(fd, locale);
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

        <div>
          <Label htmlFor="title" className="flex items-center gap-1 mb-1" required>
            {t("title")}
          </Label>
          <Input id="title" name="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={191} className="border-blue-400" />
          <ErrorsZod error={errors?.zodErrors?.title} />
        </div>

        {/* Date / Time grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Start Date */}
          <div>
            <Label htmlFor="startDate" className="flex items-center gap-1 mb-1" required>
              {t("start_date")}
            </Label>
            <Popover open={openStartDate} onOpenChange={setOpenStartDate}>
              <PopoverTrigger asChild>
                <Button
                  id="startDate"
                  type="button"
                  variant="outline"
                  className={`cursor-pointer w-full justify-start text-left border-blue-400 bg-blue-50 ${!startDate ? "text-muted-foreground" : ""}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? formatLocalDate(startDate) : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border border-blue-400 bg-white shadow-md rounded-md" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  captionLayout="dropdown"
                  onSelect={(d) => {
                    setStartDate(d || undefined);
                    setOpenStartDate(false);
                  }}
                  hidden={[{ before: new Date(2000, 0, 1) }, { after: new Date(new Date().getFullYear() + 10, 11, 31) }]}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Start Time */}
          <div>
            <Label htmlFor="startClock" className="flex items-center gap-1 mb-1" required>
              {t("start_time")}
            </Label>
            <Input type="time" id="startClock" step={60} value={startTime} onChange={(e) => setStartTime(e.target.value)} className="border-blue-400" />
            <ErrorsZod error={errors?.zodErrors?.startDateTime} />
          </div>

          {/* End Date */}
          <div>
            <Label htmlFor="endDate" className="flex items-center gap-1 mb-1" required>
              {t("end_date")}
            </Label>
            <Popover open={openEndDate} onOpenChange={setOpenEndDate}>
              <PopoverTrigger asChild>
                <Button
                  id="endDate"
                  type="button"
                  variant="outline"
                  className={`cursor-pointer w-full justify-start text-left border-blue-400 bg-blue-50 ${!endDate ? "text-muted-foreground" : ""}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? formatLocalDate(endDate) : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border border-blue-400 bg-white shadow-md rounded-md" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  captionLayout="dropdown"
                  onSelect={(d) => {
                    setEndDate(d || undefined);
                    setOpenEndDate(false);
                  }}
                  hidden={[{ before: new Date(2000, 0, 1) }, { after: new Date(new Date().getFullYear() + 10, 11, 31) }]}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* End Time */}
          <div>
            <Label htmlFor="endClock" className="flex items-center gap-1 mb-1" required>
              {t("end_time")}
            </Label>
            <Input type="time" id="endClock" step={60} value={endTime} onChange={(e) => setEndTime(e.target.value)} className="border-blue-400" />
            <ErrorsZod error={errors?.zodErrors?.endDateTime} />
          </div>
        </div>

        {/* User picker */}
        <div>
          <Label htmlFor="user" className="flex items-center gap-1 mb-1">
            {t("name")}
          </Label>
          <div className="flex gap-2 items-center">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer flex-1 border-blue-400 bg-blue-50 justify-start text-left"
              onClick={() => setUserPickerOpen(true)}
            >
              {userName ? userName : t("choose_user")}
            </Button>
          </div>
          <input type="hidden" name="user" value={user ? String(user) : ""} />
          <ErrorsZod error={errors?.zodErrors?.user} />
        </div>

        {/* Status */}
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

        <input type="hidden" name="startDateTime" value={startISO} />
        <input type="hidden" name="endDateTime" value={endISO} />

        {userPickerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <UserPicker
              onSelect={(u) => {
                setUser(u.id);
                setUserName(u.name);
                setUserPickerOpen(false);
              }}
              onClose={() => setUserPickerOpen(false)}
            />
          </div>
        )}

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
