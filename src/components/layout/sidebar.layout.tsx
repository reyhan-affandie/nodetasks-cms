"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { APP_NAME } from "@/constants/env";
import { useLocale, useTranslations } from "next-intl";
import { Gauge, LayoutGrid, ShieldCheck, Users, Layers, ListTodo, Star, ChevronDown, ChevronRight, Calendar } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { ApiPayload } from "@/types/apiResult.type";
import { getAuthUser } from "@/actions/auth.actions";
import { buildFeatureAccessMap } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { getList } from "@/actions/actions";

interface MenuItem {
  key: string;
  icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
  strict?: boolean;
  skipPermissionCheck?: boolean;
  label?: string;
}

const masterDataItems: MenuItem[] = [
  { key: "priorities", icon: Star, strict: true },
  { key: "phases", icon: Layers, strict: true },
];

const adminItems: MenuItem[] = [
  { key: "features", icon: LayoutGrid, strict: true },
  { key: "roles", icon: ShieldCheck, strict: true },
  { key: "users", icon: Users, strict: true },
];

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const [data, setData] = useState<ApiPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetched = useRef(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [phases, setPhases] = useState<any[]>([]);
  const [tasksOpen, setTasksOpen] = useState(true);
  const [dashboardOpen, setDashboardOpen] = useState(true);

  const currentPhaseId = React.useMemo(() => {
    const match = pathname.match(/\/tasks\/(\d+)/);
    return match ? Number(match[1]) : null;
  }, [pathname]);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await getAuthUser();
        setData(res?.data);
      } catch {
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchPhases = async () => {
      try {
        const res = await getList("phases", 1, 100, "", "id", "asc");
        if (res?.data?.data) setPhases(res.data.data);
      } catch {
        setPhases([]);
      }
    };
    fetchPhases();
  }, []);

  const featureMap = buildFeatureAccessMap(data);

  const handleNavigate = (path: string) => router.push(`/${locale}/${path}`);
  const handlePhaseNavigate = (id: number) => router.push(`/${locale}/tasks/${id}`);

  const hasPermission = (key: string, strict = false) => {
    const perms = featureMap[key];
    if (!perms) return false;
    if (strict) return perms.privilegeCreate || perms.privilegeUpdate || perms.privilegeDelete;
    return perms.privilegeRead || perms.privilegeCreate || perms.privilegeUpdate || perms.privilegeDelete;
  };

  const renderMenu = (items: MenuItem[]) => {
    const rendered = items
      .filter(({ key, strict, skipPermissionCheck }) => {
        if (skipPermissionCheck) return true;
        return hasPermission(key, strict);
      })
      .map(({ key, icon: Icon, label }) => (
        <SidebarMenuItem
          key={key}
          className={`flex items-center px-3 py-2 rounded-md transition-colors cursor-pointer ${
            pathname.includes(`/${key}`) ? "bg-blue-100 text-blue-800 font-semibold" : "hover:bg-blue-100 hover:text-blue-800 hover:font-semibold"
          }`}
          onClick={() => handleNavigate(key)}
        >
          <Icon className="mr-2 h-4 w-4" /> {label || t(key)}
        </SidebarMenuItem>
      ));

    return rendered.length ? <SidebarMenu>{rendered}</SidebarMenu> : null;
  };

  const renderDashboardMenu = () => (
    <SidebarMenu>
      <SidebarMenuItem
        className={`flex items-center px-3 py-2 rounded-md cursor-pointer select-none ${
          pathname.includes("/dashboard") ? "bg-blue-100 text-blue-800 font-semibold" : "hover:bg-blue-100 hover:text-blue-800 hover:font-semibold"
        }`}
        onClick={() => setDashboardOpen((prev) => !prev)}
      >
        <Gauge className="mr-2 h-4 w-4" />
        {t("dashboard")}
        {dashboardOpen ? <ChevronDown className="ml-auto h-4 w-4" /> : <ChevronRight className="ml-auto h-4 w-4" />}
      </SidebarMenuItem>
      {dashboardOpen && (
        <>
          <SidebarMenuItem
            className={`ml-8 flex items-center px-3 py-2 rounded-md transition-colors cursor-pointer ${
              pathname === `/${locale}/dashboard/events`
                ? "bg-blue-100 text-blue-800 font-semibold"
                : "hover:bg-blue-100 hover:text-blue-800 hover:font-semibold"
            }`}
            onClick={() => handleNavigate("dashboard/events")}
          >
            {t("dashboard_events")}
          </SidebarMenuItem>
          <SidebarMenuItem
            className={`ml-8 flex items-center px-3 py-2 rounded-md transition-colors cursor-pointer ${
              pathname === `/${locale}/dashboard/tasks`
                ? "bg-blue-100 text-blue-800 font-semibold"
                : "hover:bg-blue-100 hover:text-blue-800 hover:font-semibold"
            }`}
            onClick={() => handleNavigate("dashboard/tasks")}
          >
            {t("dashboard_tasks")}
          </SidebarMenuItem>
        </>
      )}
    </SidebarMenu>
  );

  const renderEventsMenu = () =>
    hasPermission("events") ? (
      <SidebarMenu>
        <SidebarMenuItem
          className={`flex items-center px-3 py-2 rounded-md transition-colors cursor-pointer ${
            pathname === `/${locale}/events` ? "bg-blue-100 text-blue-800 font-semibold" : "hover:bg-blue-100 hover:text-blue-800 hover:font-semibold"
          }`}
          onClick={() => handleNavigate("events")}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {t("events")}
        </SidebarMenuItem>
        <SidebarMenuItem
          className={`flex items-center px-3 py-2 rounded-md transition-colors cursor-pointer ${
            pathname === `/${locale}/schedules` ? "bg-blue-100 text-blue-800 font-semibold" : "hover:bg-blue-100 hover:text-blue-800 hover:font-semibold"
          }`}
          onClick={() => handleNavigate("schedules")}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {t("schedules")}
        </SidebarMenuItem>
      </SidebarMenu>
    ) : null;

  const renderTasksMenu = () => {
    if (!hasPermission("tasks") || !phases.length) return null;
    return (
      <SidebarMenu>
        <SidebarMenuItem
          className={`flex items-center px-3 py-2 rounded-md cursor-pointer select-none ${
            pathname.includes("/tasks") && !pathname.includes("phases")
              ? "bg-blue-100 text-blue-800 font-semibold"
              : "hover:bg-blue-100 hover:text-blue-800 hover:font-semibold"
          }`}
          onClick={() => setTasksOpen((prev) => !prev)}
        >
          <ListTodo className="mr-2 h-4 w-4" />
          {t("tasks")}
          {tasksOpen ? <ChevronDown className="ml-auto h-4 w-4" /> : <ChevronRight className="ml-auto h-4 w-4" />}
        </SidebarMenuItem>
        {tasksOpen &&
          phases.map((p) => {
            let label = p.name;
            if (locale === "id" && p.name_id) label = p.name_id;
            else if (locale === "ph" && p.name_ph) label = p.name_ph;
            else if (locale === "en" && p.name_en) label = p.name_en;

            return (
              <SidebarMenuItem
                key={p.id}
                className={`ml-8 flex items-center px-3 py-2 rounded-md transition-colors cursor-pointer ${
                  currentPhaseId === p.id ? "bg-blue-100 text-blue-800 font-semibold" : "hover:bg-blue-100 hover:text-blue-800 hover:font-semibold"
                }`}
                onClick={() => handlePhaseNavigate(p.id)}
              >
                {t("tasks")} | {label}
              </SidebarMenuItem>
            );
          })}
      </SidebarMenu>
    );
  };

  const renderSection = (title: string, items: MenuItem[], extra?: React.ReactNode) => {
    const menu = renderMenu(items);
    if (!menu && !extra) return null;
    return (
      <>
        <div className="text-xs font-semibold text-muted-foreground uppercase px-3 pt-4 pb-2">{title}</div>
        {menu}
        {extra}
      </>
    );
  };

  return (
    <Sidebar className="top-[--header-height] !h-[calc(100svh-var(--header-height))]" {...props}>
      <SidebarContent className="p-4">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, idx) => (
              <Skeleton key={idx} className="h-8 w-full rounded-md" />
            ))}
            <div className="h-4 border-b my-4" />
            {[...Array(3)].map((_, idx) => (
              <Skeleton key={idx} className="h-8 w-full rounded-md" />
            ))}
          </div>
        ) : (
          <>
            <div className="text-xs font-semibold text-muted-foreground uppercase px-3 pt-4 pb-2">Menu</div>
            <SidebarMenu>
              {renderDashboardMenu()}
              {renderEventsMenu()}
              {renderTasksMenu()}
            </SidebarMenu>
            {renderSection("Master Data", masterDataItems)}
            {renderSection("Admin", adminItems)}
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="text-xs px-4 py-2 text-muted-foreground">
              {APP_NAME} &copy; {new Date().getFullYear()} All rights reserved
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
