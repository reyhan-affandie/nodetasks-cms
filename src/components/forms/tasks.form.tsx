/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { tasksValidation, tasksAction } from "@/actions/tasks.actions";
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
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/customs/image.upload";
import { useLocale, useTranslations } from "next-intl";
import { SpecialSubmitButton } from "@/components/customs/button.submit";
import { FileUpload } from "@/components/customs/file.upload";
import { getList } from "@/actions/actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import UserPicker from "@/components/pickers/users.picker";

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
  const formActionWithLocale = async (prevState: any, formData: FormData) => {
    return tasksAction(prevState, formData, locale);
  };

  const [formState, formAction] = useActionState(formActionWithLocale, selectedData);
  const [errors, setErrors] = useState<typeof formState | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Dropdowns
  const [priorities, setPriorities] = useState<ApiPayload[]>([]);
  const [phases, setPhases] = useState<ApiPayload[]>([]);
  const [priority, setPriority] = useState(selectedData?.data?.priorityId ?? "");
  const [phase, setPhase] = useState(selectedData?.data?.phaseId ?? "");

  // User Picker
  const [assignee, setAssignee] = useState(selectedData?.data?.assigneeId ?? "");
  const [assigneeName, setAssigneeName] = useState(selectedData?.data?.assignee?.name ?? "");
  const [assigneePickerOpen, setAssigneePickerOpen] = useState(false);

  // Date pickers
  const [start, setStart] = useState<Date | undefined>(selectedData?.data?.start ? new Date(selectedData.data.start) : undefined);
  const [deadline, setDeadline] = useState<Date | undefined>(selectedData?.data?.deadline ? new Date(selectedData.data.deadline) : undefined);
  const [openDate, setOpenDate] = useState<{ [key: string]: boolean }>({ start: false, deadline: false });

  // Other fields
  const [name, setName] = useState(selectedData?.data?.name || "");
  const [description, setDescription] = useState(selectedData?.data?.description || "");
  const [image, setImage] = useState(selectedData?.data?.image || "");
  const [file, setFile] = useState(selectedData?.data?.file || "");

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // Load dropdown options
    const loadOptions = async () => {
      const [priorityRes, phaseRes] = await Promise.all([getList("priorities", 1, 20, "", "id", "asc"), getList("phases", 1, 20, "", "id", "asc")]);
      setPriorities(priorityRes?.data?.data ?? []);
      setPhases(phaseRes?.data?.data ?? []);
    };
    loadOptions();
  }, []);

  useEffect(() => {
    if (selectedData?.data !== null && formTitle === "update") {
      setName(selectedData.data.name || "");
      setDescription(selectedData.data.description || "");
      setPriority(selectedData.data.priorityId ?? "");
      setPhase(selectedData.data.phaseId ?? "");
      setAssignee(selectedData.data.assigneeId ?? "");
      setAssigneeName(selectedData.data.assignee?.name ?? "");
      setImage(selectedData.data.image || "");
      setFile(selectedData.data.file || "");
      setStart(selectedData.data.start ? new Date(selectedData.data.start) : undefined);
      setDeadline(selectedData.data.deadline ? new Date(selectedData.data.deadline) : undefined);
    } else if (formTitle === "create") {
      setName("");
      setDescription("");
      setPriority("");
      setPhase("");
      setAssignee("");
      setAssigneeName("");
      setImage("");
      setFile("");
      setStart(undefined);
      setDeadline(undefined);
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

  // Submit handler
  const handleSubmit = async () => {
    setIsLoading(true);
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    if (image instanceof File) formData.set("image", image);
    if (file instanceof File) formData.set("file", file);
    formData.set("priority", priority);
    formData.set("phase", phase);
    formData.set("assigneeId", assignee ?? "");
    if (start) formData.set("start", format(start, "yyyy-MM-dd"));
    if (deadline) formData.set("deadline", format(deadline, "yyyy-MM-dd"));

    const result = await tasksValidation(formData, locale);
    if (result) {
      setErrors(result);
      toastMessage({ api, variant: "destructive", status: formState?.status, statusText: formState?.statusText });
      setIsLoading(false);
      return;
    }
    setErrors(null);
    formRef.current.requestSubmit();
  };

  // Dropdown config array
  const dropdowns = [
    {
      name: "priority",
      value: priority,
      setter: setPriority,
      options: priorities,
      labelKey: "priority",
    },
    {
      name: "phase",
      value: phase,
      setter: setPhase,
      options: phases,
      labelKey: "phase",
    },
  ];

  // Date pickers config
  const dates = [
    {
      name: "start",
      value: start,
      setter: setStart,
      open: openDate.start,
      setOpen: (v: boolean) => setOpenDate((prev) => ({ ...prev, start: v })),
      labelKey: "start",
    },
    {
      name: "deadline",
      value: deadline,
      setter: setDeadline,
      open: openDate.deadline,
      setOpen: (v: boolean) => setOpenDate((prev) => ({ ...prev, deadline: v })),
      labelKey: "deadline",
    },
  ];

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
          <Label htmlFor="image" className="flex items-center gap-1 mb-1">
            {t("image")}
          </Label>
          <span>(10mb max)</span>
          <ImageUpload id="image" name="image" value={image} onChange={setImage} />
          <ErrorsZod error={errors?.zodErrors?.image} />
        </div>

        <div>
          <Label htmlFor="file" className="flex items-center gap-1 mb-1">
            {t("file")}
          </Label>
          <span>(10mb max)</span>
          <FileUpload id="file" name="file" value={file} onChange={setFile} />
          <ErrorsZod error={errors?.zodErrors?.file} />
        </div>

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
            maxLength={191}
            onChange={(e) => setName(e.target.value)}
          />
          <ErrorsZod error={errors?.zodErrors?.name} />
        </div>

        <div>
          <Label htmlFor="description" className="flex items-center gap-1 mb-1">
            {t("description")}
          </Label>
          <Textarea
            id="description"
            name="description"
            placeholder={t("description_placeholder")}
            className="border-blue-400"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={4096}
          />
          <ErrorsZod error={errors?.zodErrors?.description} />
        </div>

        {/* PRIORITY & PHASE DROPDOWNS */}
        {dropdowns.map(({ name, value, setter, options, labelKey }) => (
          <div key={name}>
            <Label htmlFor={name} className="flex items-center gap-1 mb-1" required>
              {t(labelKey)}
            </Label>
            <Select name={name} value={String(value)} onValueChange={setter as (v: string) => void}>
              <SelectTrigger className="border-blue-400">
                <SelectValue placeholder={t(labelKey)} />
              </SelectTrigger>
              <SelectContent>
                {(options as Array<{ id: number | string; name?: string }>)?.map((opt) => (
                  <SelectItem key={`${name}_${opt.id}`} value={String(opt.id)}>
                    {(opt as any)[`name_${locale}`] || opt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name={name} value={value ?? ""} />
            <ErrorsZod error={errors?.zodErrors?.[name]} />
          </div>
        ))}

        {/* DATE PICKERS */}
        {dates.map(({ name, value, setter, open, setOpen, labelKey }) => (
          <div key={name}>
            <Label htmlFor={name} className="flex items-center gap-1 mb-1" required>
              {t(labelKey)}
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={`w-full justify-start text-left font-normal border-blue-400 bg-blue-50 ${!value ? "text-muted-foreground" : ""}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {value ? format(value, "yyyy-MM-dd") : t("choose_date")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border border-blue-400 bg-white shadow-md rounded-md" align="start">
                <Calendar
                  mode="single"
                  selected={value}
                  onSelect={(date) => {
                    setter(date);
                    setOpen(false);
                  }}
                  initialFocus
                  captionLayout="dropdown-buttons"
                  fromYear={2000}
                  toYear={new Date().getFullYear() + 10}
                />
              </PopoverContent>
            </Popover>
            <input type="hidden" name={name} value={value ? format(value, "yyyy-MM-dd") : ""} />
            <ErrorsZod error={errors?.zodErrors?.[name]} />
          </div>
        ))}

        {/* ASSIGNEE PICKER */}
        <div>
          <Label htmlFor="assignee" className="flex items-center gap-1 mb-1">
            {t("assignee")}
          </Label>
          <div className="flex gap-2 items-center">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-blue-400 bg-blue-50 justify-start text-left"
              onClick={() => setAssigneePickerOpen(true)}
            >
              {assigneeName ? assigneeName : t("choose_user")}
            </Button>
          </div>
          <input type="hidden" name="assigneeId" value={assignee ?? ""} />
          <ErrorsZod error={errors?.zodErrors?.assigneeId} />
        </div>
        {assigneePickerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <UserPicker
              onSelect={(user) => {
                setAssignee(user.id);
                setAssigneeName(user.name);
                setAssigneePickerOpen(false);
              }}
              onClose={() => setAssigneePickerOpen(false)}
            />
          </div>
        )}

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
