"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, ChevronLeft, ChevronRight, CheckCircle, CalendarXIcon, Pencil } from "lucide-react";
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

const HOUR_HEIGHT = 72;
const getDisplayedHourHeight = (step: number) => HOUR_HEIGHT * (60 / step);
export default function EventsDashboardParam() {
  const t = useTranslations();
  const params = useParams();

  const [events, setEvents] = useState<ApiPayload[]>([]);
  const [schedules, setSchedules] = useState<ApiPayload[]>([]);
  const [users, setUsers] = useState<ApiPayload[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>(Array.isArray(params?.userId) ? params?.userId[0] : params?.userId ?? "all");
  const [loading, setLoading] = useState(true);

  const [currentDate, setCurrentDate] = useState<Date>(
    params?.dataDate ? new Date(Array.isArray(params.dataDate) ? params.dataDate[0] : params.dataDate) : new Date()
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
      const eventRes = await getSubList("events", "dataDate", `${formattedDate}`, 1, 100, "", "startTime", "asc");
      const scheduleRes = await getSubList("schedules", "dataDate", `${formattedDate}`, 1, 100, "", "startTime", "asc");
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
    const all = [...events, ...schedules];
    if (all.length === 0) return [7, 18];
    const startTimes = all.map((e) => parseInt((e.startTime as string).split(":")[0]));
    const endTimes = all.map((e) => parseInt((e.endTime as string).split(":")[0]));
    const min = Math.min(...startTimes);
    const max = Math.max(...endTimes);
    return [min, max];
  }, [events, schedules]);

  const getTimeBlockTop = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    return (h + m / 60 - startHour) * displayedHourHeight;
  };

  const getDurationHeight = (start: string, end: string) => {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    return (eh + em / 60 - (sh + sm / 60)) * displayedHourHeight;
  };

  const assignColumns = (events: ApiPayload[]) => {
    const sorted = [...events].sort((a, b) => (a.startTime as string).localeCompare(b.startTime as string));
    const columns: ApiPayload[][] = [];

    const parseTime = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };

    for (const event of sorted) {
      const start = parseTime(event.startTime as string);
      const end = parseTime(event.endTime as string);

      let placed = false;
      for (const column of columns) {
        if (!column.some((e) => parseTime(e.startTime as string) < end && parseTime(e.endTime as string) > start)) {
          column.push(event);
          placed = true;
          break;
        }
      }
      if (!placed) columns.push([event]);
    }

    const result: (ApiPayload & { columnIndex: number; columnCount: number })[] = [];
    columns.forEach((column, columnIndex) => {
      column.forEach((event) => {
        result.push({ ...event, columnIndex, columnCount: columns.length });
      });
    });

    return result;
  };

  const handleClickTimeBlock = (index: number) => {
    const totalMinutes = startHour * 60 + index * timeStep;
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    const clickedTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

    const top = getTimeBlockTop(clickedTime) + 40;
    setPopupHour(clickedTime);
    setPopupPosition({ top, left: 72 }); // 72 = sidebar width
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      const isOutsidePopup = popupRef.current && !popupRef.current.contains(target);
      if (isOutsidePopup) {
        setPopupHour(null);
      }
    }
    if (popupHour) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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

  const deleteForm = (
    <DeleteDialog
      id={selectedData?.data?.id}
      api={api}
      description={`${selectedData?.data?.user?.name ?? ""} | ${selectedData?.data?.title ?? ""} | ${selectedData?.data?.startTime ?? ""} – ${
        selectedData?.data?.endTime ?? ""
      }`}
      open={deleteOpen}
      onClose={() => {
        setDeleteOpen(false);
      }}
      onSuccess={() => {
        setDeleteOpen(false);
        setSelectedData({ ...FORM_INITIAL_STATE });
        reload();
      }}
    />
  );

  return (
    <DefaultLayout>
      {loading ? (
        <div className="text-center text-muted-foreground">{t("loading")}</div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <button className="border rounded px-2 py-1 text-sm hover:bg-muted" onClick={() => setCurrentDate(new Date())}>
              {t("today")}
            </button>
            <button
              className="border rounded p-1 hover:bg-muted"
              onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 1)))}
              title={t("prev")}
            >
              <ChevronLeft size={16} />
            </button>
            <Popover open={openDate} onOpenChange={setOpenDate}>
              <PopoverTrigger asChild>
                <button className="border rounded px-3 py-1 flex items-center gap-2 bg-white font-medium text-sm" type="button">
                  <CalendarIcon size={16} />
                  {format(currentDate, "EEEE, dd MMM yyyy")}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border bg-white shadow-md rounded-md" align="start">
                <Calendar
                  mode="single"
                  selected={currentDate}
                  onSelect={(date) => {
                    if (date) setCurrentDate(date);
                    setOpenDate(false);
                  }}
                  initialFocus
                  captionLayout="dropdown-buttons"
                  fromYear={2000}
                  toYear={new Date().getFullYear() + 10}
                />
              </PopoverContent>
            </Popover>
            <button
              className="border rounded p-1 hover:bg-muted"
              onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 1)))}
              title={t("next")}
            >
              <ChevronRight size={16} />
            </button>

            <Select onValueChange={setSelectedUserId} defaultValue="all">
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id as number} value={String(user.id)}>
                    {user.name as string}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={(val) => setTimeStep(Number(val) as 15 | 30 | 60)} value={String(timeStep)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="60">60 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
              </SelectContent>
            </Select>
            <div className="event-toolbar flex items-center gap-2">
              <button
                onClick={() => {
                  setFormTitle("update");
                  setSheetOpen(true);
                }}
                disabled={!selectedData?.data?.id}
                className={cn(
                  "px-4 py-1 text-sm font-medium rounded border transition",
                  !selectedData?.data?.id ? "bg-blue-300 text-white cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"
                )}
              >
                {t("update")}
              </button>

              <button
                onClick={() => setDeleteOpen(true)}
                disabled={!selectedData?.data?.id}
                className={cn(
                  "px-4 py-1 text-sm font-medium rounded border transition",
                  !selectedData?.data?.id ? "bg-red-300 text-white cursor-not-allowed" : "bg-red-600 hover:bg-red-700 text-white"
                )}
              >
                {t("delete")}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-w-full">
            <div className="relative overflow-y-auto" style={{ height: `calc(100vh - 150px)` }}>
              <div className="flex w-max min-w-full" style={{ minHeight: `${(endHour - startHour) * displayedHourHeight}px` }}>
                <div className="flex flex-col">
                  <div className="flex">
                    <div className="w-[72px] flex-shrink-0" />
                    {filteredUsers.map((user) => {
                      const userEvents = assignColumns(events.filter((e) => Number(e.userId) === Number(user.id)));
                      const maxColumn = userEvents.reduce((acc, cur) => Math.max(acc, cur.columnIndex + 1), 1);
                      const userWidth = 150 * maxColumn;

                      return (
                        <div key={user.id as number} style={{ width: `${userWidth}px` }} className="text-center p-2 border-b font-medium border-r">
                          <Avatar className="mx-auto mb-2">
                            <AvatarFallback>
                              {(user.name as string)
                                ?.split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>{user.name as string}</div>
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
                      {/* Realtime now-line */}
                      {showNowLine && (
                        <div className="absolute left-0 right-0 z-50 pointer-events-none" style={{ top: getTimeBlockTop(format(now, "HH:mm:ss")) }}>
                          <div className="absolute -left-14 -top-3 pl-3 pr-4 font-mono bg-white border border-red-800 px-1 rounded-full text-red-800">
                            {format(now, "HH:mm:ss")}
                          </div>
                          <div className="h-[2px] w-full bg-red-600"></div>
                        </div>
                      )}
                      {/* Schedules behind */}
                      <div className="absolute top-0 left-0 right-0 z-0">
                        {assignColumns(schedules).map((item) => {
                          const top = getTimeBlockTop(item.startTime as string);
                          const height = getDurationHeight(item.startTime as string, item.endTime as string);
                          return (
                            <Card
                              key={item.id as number}
                              className={cn("absolute p-2 bg-gray-500 text-white overflow-hidden whitespace-pre-wrap text-sm w-full")}
                              style={{ top, height }}
                            >
                              <div className="font-bold text-xs">
                                {item.startTime as string} - {item.endTime as string}
                              </div>
                              <div>{item.title as string}</div>
                            </Card>
                          );
                        })}
                      </div>

                      {filteredUsers.map((user) => {
                        const userEvents = assignColumns(events.filter((e) => Number(e.userId) === Number(user.id)));
                        const maxColumn = userEvents.reduce((acc, cur) => Math.max(acc, cur.columnIndex + 1), 1);
                        const userWidth = 150 * maxColumn;

                        return (
                          <div key={user.id as number} style={{ width: `${userWidth}px` }} className="relative border-r z-10">
                            {Array.from({ length: (endHour - startHour) * (60 / timeStep) + 1 }).map((_, i) => (
                              <div
                                key={i}
                                className="absolute left-0 right-0 h-[1px] border-t border-gray-300"
                                style={{ top: `${i * (displayedHourHeight / (60 / timeStep))}px` }}
                              />
                            ))}
                            {userEvents.map((event) => {
                              const top = getTimeBlockTop(event.startTime as string);
                              const height = getDurationHeight(event.startTime as string, event.endTime as string);
                              const left = event.columnIndex * 150;

                              return (
                                <Card
                                  key={event.id as number}
                                  onClick={() => {
                                    if (selectedData?.data?.id === event.id) {
                                      setSelectedData({ ...FORM_INITIAL_STATE }); // unselect
                                    } else {
                                      setSelectedData({ ...selectedData, data: event }); // select
                                      setApi("events");
                                    }
                                  }}
                                  className={cn(
                                    "event-block absolute p-2 text-white overflow-hidden whitespace-pre-wrap text-sm cursor-pointer",
                                    event.status ? "bg-green-500" : "bg-red-500"
                                  )}
                                  style={{ top, height, width: `150px`, left: `${left}px` }}
                                >
                                  {event.status && (
                                    <div className="absolute top-1 right-1">
                                      <CheckCircle size={14} />
                                    </div>
                                  )}
                                  {selectedData?.data?.id === event.id && (
                                    <div className="absolute bottom-1 right-1 z-20">
                                      <div className="bg-blue-600 text-white p-1 rounded-md shadow-md">
                                        <Pencil className="w-4 h-4" />
                                      </div>
                                    </div>
                                  )}
                                  <div className="font-bold text-xs">
                                    {event.startTime as string} - {event.endTime as string}
                                  </div>
                                  <div className="font-semibold text-[10px] uppercase">{event.status ? `(${t("paid")})` : `(${t("unpaid")})`}</div>
                                  <div>{event.title as string}</div>
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
                        className="absolute z-50 bg-white border shadow-lg rounded-md"
                        style={{
                          top: popupPosition.top,
                          left: popupPosition.left,
                        }}
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
