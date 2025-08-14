/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { transactionsAction, transactionsValidation } from "@/actions/transactions.actions";
import { DefaultStateType, FORM_INITIAL_STATE } from "@/constants/global";
import { ApiPayload, Dispatcher } from "@/types/apiResult.type";
import { SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { JustLogo } from "@/components/customs/logo";
import { SpecialSubmitButton } from "@/components/customs/button.submit";
import { ErrorsHandling, ErrorsZod } from "@/components/customs/errors";
import ClientPicker from "@/components/pickers/clients.picker";
import { toast } from "sonner";
import { formatAmountInput } from "@/lib/utils";
import { getList } from "@/actions/actions";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

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
    return transactionsAction(prevState, formData, locale);
  };
  const [formState, formAction] = useActionState(formActionWithLocale, selectedData);

  const [errors, setErrors] = useState<typeof formState | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [client, setClient] = useState<string | number>(selectedData?.data?.clientId ?? "");
  const [clientName, setClientName] = useState<string>(selectedData?.data?.client?.name ?? "");
  const [stage, setStage] = useState<string | number>(selectedData?.data?.stageId ?? "");
  const [currency, setCurrency] = useState<string | number>(selectedData?.data?.currencyId ?? "");
  const [stages, setStages] = useState<ApiPayload[]>([]);
  const [currencies, setCurrencies] = useState<ApiPayload[]>([]);

  const [transactionDate, setTransactionDate] = useState<Date | undefined>(
    selectedData?.data?.transactionDate ? new Date(selectedData.data.transactionDate) : undefined
  );
  const [openDate, setOpenDate] = useState<{ [key: string]: boolean }>({ start: false, deadline: false });
  const initialAmountRaw =
    selectedData?.data?.amount !== undefined && selectedData?.data?.amount !== null
      ? String(typeof selectedData.data.amount === "bigint" ? selectedData.data.amount.toString() : selectedData.data.amount)
      : "";
  const initialAmountFmt = initialAmountRaw ? formatAmountInput(initialAmountRaw).formatted : "";
  const [amountInput, setAmountInput] = useState<string>(initialAmountFmt);
  const [amountRaw, setAmountRaw] = useState<string>(initialAmountRaw);

  const [notes, setNotes] = useState<string>(selectedData?.data?.notes ?? "");
  const [sheet, setSheet] = useState<string>(selectedData?.data?.sheet ?? "");
  const [tab, setTab] = useState<string>(selectedData?.data?.tab ?? "");
  const [tabname, setTabname] = useState<string>(selectedData?.data?.tabname ?? "");
  const [sheetrow, setSheetrow] = useState<string>(selectedData?.data?.sheetrow ?? "");

  const [clientPickerOpen, setClientPickerOpen] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  // Load dropdown data
  useEffect(() => {
    const load = async () => {
      const [st, cu] = await Promise.all([getList("stages", 1, 100, "", "dataOrder", "asc"), getList("currencies", 1, 100, "", "updatedAt", "desc")]);
      setStages(st?.data?.data);
      setCurrencies(cu?.data?.data);
    };
    load();
  }, []);

  useEffect(() => {
    if (selectedData?.data !== null && formTitle === "update") {
      setClient(selectedData.data.clientId ?? "");
      setClientName(selectedData.data.client?.name ?? "");
      setStage(selectedData.data.stageId ?? "");
      setCurrency(selectedData.data.currencyId ?? "");
      setTransactionDate(selectedData.data.transactionDate ? new Date(selectedData.data.transactionDate) : undefined);

      const amtRaw =
        selectedData.data.amount !== undefined && selectedData.data.amount !== null
          ? String(typeof selectedData.data.amount === "bigint" ? selectedData.data.amount.toString() : selectedData.data.amount)
          : "";
      setAmountRaw(amtRaw);
      setAmountInput(amtRaw ? formatAmountInput(amtRaw).formatted : "");

      setNotes(selectedData.data.notes ?? "");
      setSheet(selectedData.data.sheet ?? "");
      setTab(selectedData.data.tab ?? "");
      setTabname(selectedData.data.tabname ?? "");
      setSheetrow(selectedData.data.sheetrow ?? "");
    } else if (formTitle === "create") {
      setClient("");
      setClientName("");
      setStage("");
      setCurrency("");
      setTransactionDate(undefined);
      setAmountInput("");
      setAmountRaw("");
      setNotes("");
      setSheet("");
      setTab("");
      setTabname("");
      setSheetrow("");
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

  const handleAmountChange = (v: string) => {
    const { formatted, raw } = formatAmountInput(v);
    setAmountInput(formatted);
    setAmountRaw(raw);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    formData.set("client", String(client));
    formData.set("stage", String(stage));
    formData.set("currency", String(currency));
    if (transactionDate) formData.set("transactionDate", format(transactionDate, "yyyy-MM-dd"));
    formData.set("amount", amountRaw || "");
    formData.set("notes", notes || "");
    formData.set("sheet", sheet || "");
    formData.set("tab", tab || "");
    formData.set("tabname", tabname || "");
    formData.set("sheetrow", sheetrow || "");

    const result = await transactionsValidation(formData, locale);
    if (result) {
      setErrors(result);
      toast.error(api, { description: result?.message });
      setIsLoading(false);
      return;
    }
    setErrors(null);
    formRef.current.requestSubmit();
  };

  const dates = [
    {
      name: "transactionDate",
      value: transactionDate,
      setter: setTransactionDate,
      open: openDate.transactionDate,
      setOpen: (v: boolean) => setOpenDate((prev) => ({ ...prev, start: v })),
      labelKey: "transaction_date",
    },
  ];
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

        {/* Client (picker) */}
        <div>
          <Label htmlFor="client" className="flex items-center gap-1 mb-1" required>
            {t("client")}
          </Label>
          <div className="flex gap-2 items-center">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer flex-1 border-blue-400 bg-blue-50 justify-start text-left"
              onClick={() => setClientPickerOpen(true)}
            >
              {clientName ? clientName : t("choose_client")}
            </Button>
          </div>
          <input type="hidden" name="client" value={client ? String(client) : ""} />
          <ErrorsZod error={errors?.zodErrors?.client} />
        </div>

        {[
          {
            name: "stage",
            value: stage,
            setter: setStage,
            options: stages,
            labelKey: "stage",
          },
          {
            name: "currency",
            value: currency,
            setter: setCurrency,
            options: currencies,
            labelKey: "currency",
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
                {(options as Array<{ id: number | string; name?: string; text?: string; symbol?: string }>)?.map((opt) => (
                  <SelectItem key={`${name}_${opt.id}`} value={String(opt.id)}>
                    {name === "currency" ? opt.symbol + " " + opt.name || "-" : opt.name || "-"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name={name} value={value ?? ""} />
            <ErrorsZod error={errors?.zodErrors?.name} />
          </div>
        ))}

        {/* Amount */}
        <div>
          <Label htmlFor="amount" className="flex items-center gap-1 mb-1">
            {t("amount")}
          </Label>
          <Input
            id="amount"
            name="amount_display"
            type="text"
            inputMode="numeric"
            value={amountInput}
            onChange={(e) => handleAmountChange(e.target.value)}
            className="border-blue-400"
            placeholder="0"
          />
          <input type="hidden" name="amount" value={amountRaw} />
          <ErrorsZod error={errors?.zodErrors?.amount} />
        </div>

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
                  captionLayout="dropdown"
                  startMonth={new Date(2000, 0)}
                  endMonth={new Date(new Date().getFullYear() + 10, 11)}
                  hidden={[{ before: new Date(2000, 0, 1) }, { after: new Date(new Date().getFullYear() + 10, 11, 31) }]}
                />
              </PopoverContent>
            </Popover>
            <input type="hidden" name={name} value={value ? format(value, "yyyy-MM-dd") : ""} />
            <ErrorsZod error={errors?.zodErrors?.[name]} />
          </div>
        ))}

        {[
          ["notes", notes, setNotes, 191],
          ["sheet", sheet, setSheet, 191],
          ["tab", tab, setTab, 191],
          ["tabname", tabname, setTabname, 191],
          ["sheetrow", sheetrow, setSheetrow, 191],
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
              value={(value as string) ?? ""}
              maxLength={maxLength as number}
              onChange={(e) => (setter as (v: string) => void)(e.target.value)}
            />
            <ErrorsZod error={errors?.zodErrors?.[key as string]} />
          </div>
        ))}

        {clientPickerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <ClientPicker
              onSelect={(c: any) => {
                setClient(c.id);
                setClientName(c.name);
                setClientPickerOpen(false);
              }}
              onClose={() => setClientPickerOpen(false)}
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
