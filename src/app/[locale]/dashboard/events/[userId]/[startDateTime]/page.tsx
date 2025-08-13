"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, ChevronLeft, ChevronRight, CheckCircle, CalendarXIcon, Pencil, Trash2 } from "lucide-react";
import { getList, getSubList } from "@/actions/actions";
import { ApiPayload } from "@/types/apiResult.type";
import { format, isToday } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import DefaultLayout from "@/components/layout/app.layout";
import { useTranslations } from "next-intl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ModuleForm as EventsForm } from "@/components/forms/events.form";
import { ModuleForm as SchedulesForm } from "@/components/forms/schedules.form";
import { DefaultStateType, FORM_INITIAL_STATE } from "@/constants/global";
import { Sheet } from "@/components/ui/sheet";
import { useParams } from "next/navigation";
import DeleteDialog from "@/components/customs/delete.form";
import { Button } from "@/components/ui/button";

const HOUR_HEIGHT = 72;
const COLUMN_WIDTH = 150;
const EVENT_INSET = 12;
const EVENT_WIDTH = COLUMN_WIDTH - EVENT_INSET * 2;
const getDisplayedHourHeight = (step: number) => HOUR_HEIGHT * (60 / step);

export default function EventsDashboardParam() {
  const t = useTranslations();
  const params = useParams();

  const [events, setEvents] = useState<ApiPayload[]>([]);
  const [schedules, setSchedules] = useState<ApiPayload[]>([]);
  const [users, setUsers] = useState<ApiPayload[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>(Array.isArray(params?.userId) ? params?.userId[0] : (params?.userId as string) ?? "all");
  const [loading, setLoading] = useState(true);

  const [currentDate, setCurrentDate] = useState<Date>(
    params?.startDateTime ? new Date(Array.isArray(params.startDateTime) ? params.startDateTime[0] : (params.startDateTime as string)) : new Date()
  );

  const [openDate, setOpenDate] = useState(false);
  const formattedDate = format(currentDate, "yyyy-MM-dd");

  const showNowLine = isToday(currentDate);
  const [now, setNow] = useState(new Date());

  const popupRef = useRef<HTMLDivElement>(null);

  const [popupHour, setPopupHour] = useState<string | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const [api, setApi] = useState<string>("");
  const [formTitle, setFormTitle] = useState<string>("");
  const [sheetOpen, setSheetOpen] = useState<boolean>(false);
  const [selectedData, setSelectedData] = useState<DefaultStateType>({ ...FORM_INITIAL_STATE });

  const [timeStep, setTimeStep] = useState<15 | 30 | 60>(60);
  const displayedHourHeight = useMemo(() => getDisplayedHourHeight(timeStep), [timeStep]);

  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      const eventRes = await getSubList("events", "startDateTime", `${formattedDate}`, 1, 1000, "", "startDateTime", "asc");
      const scheduleRes = await getSubList("schedules", "startDateTime", `${formattedDate}`, 1, 1000, "", "startDateTime", "asc");
      const userRes = await getList("users", 1, 100, "", "id", "asc");
      setEvents(eventRes?.data?.data ?? []);
      setSchedules(scheduleRes?.data?.data ?? []);
      setUsers(userRes?.data?.data ?? []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [formattedDate]);

  useEffect(() => {
    reload();
  }, [reload]);

  const filteredUsers = useMemo(() => {
    if (selectedUserId === "all") return users;
    return users.filter((u) => String(u.id) === selectedUserId);
  }, [users, selectedUserId]);

  const [startHour, endHour] = useMemo(() => {
    const evStarts = events.map((e) => new Date(e.startDateTime as string).getHours());
    const evEnds = events.map((e) => new Date(e.endDateTime as string).getHours());

    const scStarts = schedules.map((s) => new Date(s.startDateTime as string).getHours());
    const scEnds = schedules.map((s) => new Date(s.endDateTime as string).getHours());

    const allStarts = [...evStarts, ...scStarts];
    const allEnds = [...evEnds, ...scEnds];
    if (allStarts.length === 0 || allEnds.length === 0) return [7, 18];
    return [Math.min(...allStarts), Math.max(...allEnds)];
  }, [events, schedules]);

  const getTimeBlockTopFromTime = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    return (h + m / 60 - startHour) * displayedHourHeight;
  };
  const getTimeBlockTopFromISO = (iso: string) => {
    const d = new Date(iso);
    return (d.getHours() + d.getMinutes() / 60 - startHour) * displayedHourHeight;
  };
  const getDurationHeightFromISOs = (sISO: string, eISO: string) => {
    const s = new Date(sISO);
    const e = new Date(eISO);
    return ((e.getTime() - s.getTime()) / 60000) * (displayedHourHeight / 60);
  };

  const assignColumnsSchedules = (items: ApiPayload[]) => {
    const sorted = [...items].sort((a, b) => new Date(a.startDateTime as string).getTime() - new Date(b.startDateTime as string).getTime());

    const toMin = (iso: string) => {
      const d = new Date(iso);
      return d.getHours() * 60 + d.getMinutes();
    };

    const columns: ApiPayload[][] = [];
    for (const it of sorted) {
      const s = toMin(it.startDateTime as string);
      const e = toMin(it.endDateTime as string);
      let placed = false;
      for (const col of columns) {
        if (!col.some((x) => toMin(x.startDateTime as string) < e && toMin(x.endDateTime as string) > s)) {
          col.push(it);
          placed = true;
          break;
        }
      }
      if (!placed) columns.push([it]);
    }

    const result: (ApiPayload & { columnIndex: number; columnCount: number })[] = [];
    columns.forEach((col, ci) => col.forEach((it) => result.push({ ...it, columnIndex: ci, columnCount: columns.length })));
    return result;
  };

  const assignColumnsEvents = (items: ApiPayload[]) => {
    const sorted = [...items].sort((a, b) => new Date(a.startDateTime as string).getTime() - new Date(b.startDateTime as string).getTime());
    const columns: ApiPayload[][] = [];
    const toMin = (iso: string) => {
      const d = new Date(iso);
      return d.getHours() * 60 + d.getMinutes();
    };
    for (const ev of sorted) {
      const s = toMin(ev.startDateTime as string);
      const e = toMin(ev.endDateTime as string);
      let placed = false;
      for (const col of columns) {
        if (!col.some((x) => toMin(x.startDateTime as string) < e && toMin(x.endDateTime as string) > s)) {
          col.push(ev);
          placed = true;
          break;
        }
      }
      if (!placed) columns.push([ev]);
    }
    const result: (ApiPayload & { columnIndex: number; columnCount: number })[] = [];
    columns.forEach((col, ci) => col.forEach((ev) => result.push({ ...ev, columnIndex: ci, columnCount: columns.length })));
    return result;
  };

  const handleClickTimeBlock = (index: number) => {
    const totalMinutes = startHour * 60 + index * timeStep;
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    const clickedTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    const top = getTimeBlockTopFromTime(clickedTime) + 40;
    setPopupHour(clickedTime);
    setPopupPosition({ top, left: 72 });
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      const isOutsidePopup = popupRef.current && !popupRef.current.contains(target);
      if (isOutsidePopup) setPopupHour(null);
    }
    if (popupHour) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [popupHour]);

  const eventForm = (
    <EventsForm
      api={api}
      formTitle={formTitle}
      setFormTitle={setFormTitle}
      setSheetOpen={setSheetOpen}
      setData={() => {}}
      selectedData={selectedData}
      setSelectedDataId={() => {}}
      setSelectedDataIds={() => {}}
      setSelectCount={() => {}}
      setSelectedData={setSelectedData}
      reload={reload}
    />
  );

  const schedulesForm = (
    <SchedulesForm
      api={api}
      formTitle={formTitle}
      setFormTitle={setFormTitle}
      setSheetOpen={setSheetOpen}
      setData={() => {}}
      selectedData={selectedData}
      setSelectedDataId={() => {}}
      setSelectedDataIds={() => {}}
      setSelectCount={() => {}}
      setSelectedData={setSelectedData}
      reload={reload}
    />
  );

  // 🗑 delete dialog: show HH:mm from whichever type is selected
  const deleteDescription = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d = selectedData?.data as any;
    const name = d?.user?.name ?? "";
    const title = d?.title ?? "";
    const start = d?.startDateTime ? format(new Date(d.startDateTime), "HH:mm") : (d?.startTime as string) ?? "";
    const end = d?.endDateTime ? format(new Date(d.endDateTime), "HH:mm") : (d?.endTime as string) ?? "";
    return `${name} | ${title} | ${start} – ${end}`;
  }, [selectedData]);

  const deleteForm = (
    <DeleteDialog
      id={selectedData?.data?.id}
      api={api}
      description={deleteDescription}
      open={deleteOpen}
      onClose={() => setDeleteOpen(false)}
      onSuccess={() => {
        setDeleteOpen(false);
        setSelectedData({ ...FORM_INITIAL_STATE });
        reload();
      }}
    />
  );

  const pickColorClass = (key: string) => {
    const COLORS = [
      "bg-rose-500",
      "bg-orange-500",
      "bg-amber-500",
      "bg-lime-500",
      "bg-emerald-500",
      "bg-cyan-500",
      "bg-sky-500",
      "bg-indigo-500",
      "bg-violet-500",
      "bg-fuchsia-500",
      "bg-pink-500",
      "bg-slate-500",
    ];
    let hash = 0;
    for (let i = 0; i < key.length; i++) hash = (hash << 5) - hash + key.charCodeAt(i);
    const idx = Math.abs(hash) % COLORS.length;
    return COLORS[idx];
  };

  return (
    <DefaultLayout>
      {loading ? (
        <div className="text-center text-muted-foreground">{t("loading")}</div>
      ) : (
        <div>
          <div className="grid grid-cols-4 items-center gap-2 md:flex md:flex-wrap mb-4">
            <Button className="cursor-pointer rounded" onClick={() => setCurrentDate(new Date())}>
              {t("today")}
            </Button>
            <div className="grid grid-cols-6 col-span-3 gap-2">
              <Button
                className="cursor-pointer rounded"
                onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 1)))}
                title={t("prev")}
              >
                <ChevronLeft size={16} />
              </Button>
              <Popover open={openDate} onOpenChange={setOpenDate}>
                <PopoverTrigger asChild>
                  <Button variant={"gray"} className="cursor-pointer rounded items-center col-span-4">
                    <CalendarIcon size={16} />
                    {format(currentDate, "EEEE, dd MMM yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border bg-white shadow-md rounded" align="start">
                  <Calendar
                    mode="single"
                    selected={currentDate}
                    onSelect={(date) => {
                      if (date) setCurrentDate(date);
                      setOpenDate(false);
                    }}
                    captionLayout="dropdown"
                    startMonth={new Date(2000, 0)}
                    endMonth={new Date(new Date().getFullYear() + 10, 11)}
                    hidden={[{ before: new Date(2000, 0, 1) }, { after: new Date(new Date().getFullYear() + 10, 11, 31) }]}
                  />
                </PopoverContent>
              </Popover>
              <Button
                className="cursor-pointer rounded"
                onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 1)))}
                title={t("next")}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
            <div className="grid grid-cols-8 col-span-4 gap-2 md:flex md:flex-wrap">
              <div className="col-span-3">
                <Select onValueChange={setSelectedUserId} defaultValue="all">
                  <SelectTrigger white className="bg-gray-600 text-white shadow-sm hover:bg-gray-600/90 rounded cursor-pointer w-full md:w-auto">
                    <SelectValue placeholder={t("all_users")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("all_users")}</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id as number} value={String(user.id)}>
                        {user.name as string}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-3">
                <Select onValueChange={(val) => setTimeStep(Number(val) as 15 | 30 | 60)} value={String(timeStep)}>
                  <SelectTrigger white className="bg-gray-600 text-white shadow-sm hover:bg-gray-600/90 rounded cursor-pointer w-full md:w-auto">
                    <SelectValue placeholder="Select Interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">60 {t("minutes")}</SelectItem>
                    <SelectItem value="30">30 {t("minutes")}</SelectItem>
                    <SelectItem value="15">15 {t("minutes")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-1 flex md:block justify-end">
                <Button
                  variant={"destructive"}
                  onClick={() => setDeleteOpen(true)}
                  disabled={!selectedData?.data?.id}
                  className={cn("cursor-pointer rounded", !selectedData?.data?.id ? "cursor-not-allowed" : "cursor-pointer")}
                >
                  <Trash2 className="h-4 w-4 md:hidden" />
                  <span className="hidden md:inline">{t("delete")}</span>
                </Button>
              </div>

              <div className="col-span-1 flex md:block justify-end">
                <Button
                  onClick={() => {
                    setFormTitle("update");
                    setSheetOpen(true);
                  }}
                  disabled={!selectedData?.data?.id}
                  className={cn("cursor-pointer rounded", !selectedData?.data?.id ? "cursor-not-allowed" : "cursor-pointer")}
                >
                  <Pencil className="h-4 w-4 md:hidden" />
                  <span className="hidden md:inline">{t("update")}</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto max-w-full">
            <div className="relative overflow-y-auto" style={{ height: `calc(100vh - 150px)` }}>
              <div className="flex w-max min-w-full" style={{ minHeight: `${(endHour - startHour) * displayedHourHeight}px` }}>
                <div className="flex flex-col">
                  <div className="flex sticky top-0 z-30 bg-white">
                    <div className="w-[72px] flex-shrink-0" />
                    {filteredUsers.map((user) => {
                      const userEvents = assignColumnsEvents(events.filter((e) => Number(e.userId) === Number(user.id)));
                      const maxColumn = userEvents.reduce((acc, cur) => Math.max(acc, cur.columnIndex + 1), 1);
                      const userWidth = COLUMN_WIDTH * maxColumn;

                      return (
                        <div key={user.id as number} style={{ width: `${userWidth}px` }} className="text-center p-2 border-b border-r">
                          <Avatar className="mx-auto mb-2">
                            <AvatarFallback className={`text-white ${pickColorClass(`${user.id}-${user.name}`)}`}>
                              {(user.name as string)
                                ?.split(" ")
                                .map((n: string) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-sm">{user.name as string}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex">
                    <div className="flex flex-col w-[72px] flex-shrink-0 bg-white border-r">
                      {Array.from({ length: (endHour - startHour) * (60 / timeStep) }).map((_, i) => {
                        const totalMinutes = startHour * 60 + i * timeStep;
                        const hour = Math.floor(totalMinutes / 60);
                        const minute = totalMinutes % 60;
                        const label = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

                        return (
                          <div
                            key={i}
                            className="text-sm text-right pr-2 border-t border-gray-300 cursor-pointer hover:bg-gray-100"
                            style={{ height: `${displayedHourHeight / (60 / timeStep)}px` }}
                            onClick={() => handleClickTimeBlock(i)}
                          >
                            {label}
                          </div>
                        );
                      })}
                      <div className="text-sm text-right pr-2 border-t border-gray-300" style={{ height: "0px" }}>
                        {`${endHour}:00`}
                      </div>
                    </div>

                    <div className="relative flex">
                      {showNowLine && (
                        <div className="absolute left-0 right-0 z-50 pointer-events-none" style={{ top: getTimeBlockTopFromTime(format(now, "HH:mm:ss")) }}>
                          <div className="absolute -left-14 -top-3 pl-3 pr-4 font-mono bg-white border border-red-800 px-1 rounded text-red-800">
                            {format(now, "HH:mm:ss")}
                          </div>
                          <div className="h-[2px] w-full bg-red-600"></div>
                        </div>
                      )}

                      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-auto">
                        {assignColumnsSchedules(schedules).map((schedule) => {
                          const top = getTimeBlockTopFromISO(schedule.startDateTime as string);
                          const height = getDurationHeightFromISOs(schedule.startDateTime as string, schedule.endDateTime as string);

                          return (
                            <Card
                              key={schedule.id as number}
                              onClick={() => {
                                if (api === "schedules" && selectedData?.data?.id === schedule.id) {
                                  setSelectedData({ ...FORM_INITIAL_STATE });
                                } else {
                                  setSelectedData({ ...selectedData, data: schedule });
                                  setApi("schedules");
                                }
                              }}
                              className={cn(
                                "absolute p-2 overflow-hidden whitespace-normal w-full cursor-pointer rounded-none bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 border"
                              )}
                              style={{ top, height }}
                            >
                              {api === "schedules" && selectedData?.data?.id === schedule.id && (
                                <div className="absolute bottom-1 left-1 z-20">
                                  <div className="bg-blue-600 text-white p-1 rounded shadow-md">
                                    <Pencil className="w-4 h-4" />
                                  </div>
                                </div>
                              )}
                              <div className="grid grid-rows-[auto_1px_auto] gap-0 leading-none py-1">
                                <div className="font-bold text-xs leading-none mb-1">
                                  {format(new Date(schedule.startDateTime as string), "HH:mm")} - {format(new Date(schedule.endDateTime as string), "HH:mm")}
                                </div>
                                <div className="h-px bg-white/50" />
                                <div className="text-sm leading-none mt-1">{schedule.title as string}</div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>

                      {filteredUsers.map((user) => {
                        const userEvents = assignColumnsEvents(events.filter((e) => Number(e.userId) === Number(user.id)));
                        const maxColumn = userEvents.reduce((acc, cur) => Math.max(acc, cur.columnIndex + 1), 1);
                        const userWidth = 150 * maxColumn;

                        return (
                          <div key={user.id as number} style={{ width: `${userWidth}px` }} className="relative border-r z-20">
                            {Array.from({ length: (endHour - startHour) * (60 / timeStep) + 1 }).map((_, i) => (
                              <div
                                key={i}
                                className="absolute left-0 right-0 h-[1px] border-t border-gray-300"
                                style={{ top: `${i * (displayedHourHeight / (60 / timeStep))}px` }}
                              />
                            ))}
                            {userEvents.map((event) => {
                              const top = getTimeBlockTopFromISO(event.startDateTime as string);
                              const height = getDurationHeightFromISOs(event.startDateTime as string, event.endDateTime as string);
                              const left = event.columnIndex * COLUMN_WIDTH + EVENT_INSET;

                              const isSelected = api === "events" && selectedData?.data?.id === event.id;
                              const fullHeight = (endHour - startHour) * displayedHourHeight;

                              return (
                                <Card
                                  key={event.id as number}
                                  onClick={() => {
                                    if (isSelected) {
                                      setSelectedData({ ...FORM_INITIAL_STATE });
                                    } else {
                                      setSelectedData({ ...selectedData, data: event });
                                      setApi("events");
                                    }
                                  }}
                                  className={cn(
                                    "event-block absolute p-2 overflow-hidden whitespace-normal text-sm cursor-pointer",
                                    "transition-all duration-300 ease-in-out rounded-none",
                                    isSelected
                                      ? "bg-green-600 text-white shadow-sm hover:bg-green-700 focus-visible:ring-green-500/20 dark:bg-green-500 dark:hover:bg-green-600 dark:focus-visible:ring-green-400/40 border z-50"
                                      : event.status
                                      ? "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 border"
                                      : "bg-gray-600 text-white shadow-sm hover:bg-gray-600/90 border"
                                  )}
                                  style={{
                                    top: isSelected ? 0 : top,
                                    height: isSelected ? fullHeight : height,
                                    width: `${EVENT_WIDTH}px`,
                                    left: `${left}px`,
                                  }}
                                >
                                  {event.status && !isSelected && (
                                    <div className="absolute top-1 right-1">
                                      <CheckCircle size={14} />
                                    </div>
                                  )}

                                  <div className="grid grid-rows-[auto_1px_auto] gap-0 leading-none">
                                    <div className="font-bold text-xs leading-none mb-1">
                                      {format(new Date(event.startDateTime as string), "HH:mm")} - {format(new Date(event.endDateTime as string), "HH:mm")}
                                    </div>
                                    <div className="h-px bg-white/50" />
                                    <div className="text-sm leading-none mt-1">{event.title as string}</div>
                                  </div>
                                </Card>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>

                    {popupHour && (
                      <div
                        ref={popupRef}
                        className="absolute z-50 bg-white border shadow-lg rounded"
                        style={{ top: popupPosition.top, left: popupPosition.left }}
                      >
                        <div className="px-4 py-2 font-bold border-b text-sm">{popupHour}</div>
                        <div className="p-4 space-y-2">
                          <button
                            onClick={() => {
                              setPopupHour(null);
                              setApi("events");
                              setFormTitle("create");
                              setSelectedData({ ...FORM_INITIAL_STATE });
                              setSheetOpen(true);
                            }}
                            className="flex w-full p-2 items-center gap-2 text-sm hover:bg-blue-200 hover:text-blue-800 hover:font-bold"
                          >
                            <CalendarIcon size={16} />
                            <span className="inline-block min-w-[140px] text-left">
                              {t("create")} {t("events")}
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              setPopupHour(null);
                              setApi("schedules");
                              setFormTitle("create");
                              setSelectedData({ ...FORM_INITIAL_STATE });
                              setSheetOpen(true);
                            }}
                            className="flex w-full p-2 items-center gap-2 text-sm hover:bg-blue-200 hover:text-blue-800 hover:font-bold"
                          >
                            <CalendarXIcon size={16} />
                            <span className="inline-block min-w-[140px] text-left">
                              {t("create")} {t("schedules")}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}

                    {sheetOpen && (
                      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                        {api === "events" && eventForm}
                        {api === "schedules" && schedulesForm}
                      </Sheet>
                    )}

                    {deleteForm}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DefaultLayout>
  );
}
