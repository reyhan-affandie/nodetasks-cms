"use client";

import { useEffect, useState, useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { getList, getSubList } from "@/actions/actions";
import { ApiPayload } from "@/types/apiResult.type";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import DefaultLayout from "@/components/layout/app.layout";
import { useTranslations } from "next-intl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const HOUR_HEIGHT = 72;

export default function EventsDashboard() {
  const t = useTranslations();
  const [events, setEvents] = useState<ApiPayload[]>([]);
  const [schedules, setSchedules] = useState<ApiPayload[]>([]);
  const [users, setUsers] = useState<ApiPayload[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [openDate, setOpenDate] = useState(false);
  const formattedDate = format(currentDate, "yyyy-MM-dd");

  useEffect(() => {
    const fetchData = async () => {
      try {
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
    };
    fetchData();
  }, [formattedDate]);

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
    return (h + m / 60 - startHour) * HOUR_HEIGHT;
  };

  const getDurationHeight = (start: string, end: string) => {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    return (eh + em / 60 - (sh + sm / 60)) * HOUR_HEIGHT;
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
          </div>

          <div className="overflow-x-auto max-w-full">
            <div className="relative h-[calc(100vh-150px)] overflow-y-auto">
              <div className="flex w-max min-w-full">
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
                      {Array.from({ length: endHour - startHour }).map((_, i) => (
                        <div key={i} className="h-[72px] text-sm text-right pr-2 border-t border-gray-300">
                          {`${startHour + i}:00`}
                        </div>
                      ))}
                      <div className="h-[0px] text-sm text-right pr-2 border-t border-gray-300">{`${endHour}:00`}</div>
                    </div>

                    <div className="relative flex">
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
                            {Array.from({ length: endHour - startHour + 1 }).map((_, i) => (
                              <div key={i} className="absolute left-0 right-0 h-[1px] border-t border-gray-300" style={{ top: `${i * HOUR_HEIGHT}px` }} />
                            ))}
                            {userEvents.map((event) => {
                              const top = getTimeBlockTop(event.startTime as string);
                              const height = getDurationHeight(event.startTime as string, event.endTime as string);
                              const left = event.columnIndex * 150;

                              return (
                                <Card
                                  key={event.id as number}
                                  className={cn(
                                    "absolute p-2 text-white overflow-hidden whitespace-pre-wrap text-sm",
                                    event.status ? "bg-green-600" : "bg-red-600"
                                  )}
                                  style={{ top, height, width: `150px`, left: `${left}px` }}
                                >
                                  {event.status && (
                                    <div className="absolute top-1 right-1">
                                      <CheckCircle size={14} />
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
