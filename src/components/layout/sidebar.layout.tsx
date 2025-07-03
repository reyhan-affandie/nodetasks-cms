/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { APP_NAME } from "@/constants/env";
import { useLocale, useTranslations } from "next-intl";
import { Gauge, LayoutGrid, ShieldCheck, Users, Layers, ListTodo, Star, ChevronDown, ChevronRight } from "lucide-react";
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

  // PHASES STATE
  const [phases, setPhases] = useState<{ id: number; name: string; name_en?: string; name_id?: string; name_ph?: string }[]>([]);
  const [tasksOpen, setTasksOpen] = useState(true); // Expanded by default

  // Get currentPhaseId from URL, e.g. "/en/tasks/3" => 3
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
      } catch (error) {
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
      } catch (error) {
        setPhases([]);
      }
    };
    fetchPhases();
  }, []);

  const featureMap = buildFeatureAccessMap(data);

  const handleNavigate = (path: string) => router.push(`/${locale}/${path}`);
  const handlePhaseNavigate = (phaseId: number) => router.push(`/${locale}/tasks/${phaseId}`);

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

  // Render Tasks with expandable phases (MULTILINGUAL LABELS)
  const renderTasksMenu = () => {
    if (!hasPermission("tasks")) return null;
    if (!phases.length) return null;

    return (
      <SidebarMenu>
        {/* Parent: Tasks */}
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
        {/* Sub-menu for each phase */}
        {tasksOpen &&
          phases.map((phase) => {
            // Choose multilingual label
            let phaseLabel = phase.name;
            if (locale === "id" && phase.name_id) phaseLabel = phase.name_id;
            else if (locale === "ph" && phase.name_ph) phaseLabel = phase.name_ph;
            else if (locale === "en" && phase.name_en) phaseLabel = phase.name_en;

            return (
              <SidebarMenuItem
                key={phase.id}
                className={`ml-8 flex items-center px-3 py-2 rounded-md transition-colors cursor-pointer ${
                  currentPhaseId === phase.id ? "bg-blue-100 text-blue-800 font-semibold" : "hover:bg-blue-100 hover:text-blue-800 hover:font-semibold"
                }`}
                onClick={() => handlePhaseNavigate(phase.id)}
              >
                {t("tasks")} | {phaseLabel}
              </SidebarMenuItem>
            );
          })}
      </SidebarMenu>
    );
  };

  // Section rendering helper
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
            {/* Menu group: Dashboard + Tasks */}
            <div className="text-xs font-semibold text-muted-foreground uppercase px-3 pt-4 pb-2">Menu</div>
            <SidebarMenu>
              {/* Dashboard */}
              <SidebarMenuItem
                className={`flex items-center px-3 py-2 rounded-md transition-colors cursor-pointer ${
                  pathname.includes("/dashboard") ? "bg-blue-100 text-blue-800 font-semibold" : "hover:bg-blue-100 hover:text-blue-800 hover:font-semibold"
                }`}
                onClick={() => handleNavigate("dashboard")}
              >
                <Gauge className="mr-2 h-4 w-4" />
                {t("dashboard")}
              </SidebarMenuItem>
              {/* Tasks (Expandable) */}
              {renderTasksMenu()}
            </SidebarMenu>

            {/* Master Data */}
            {renderSection("Master Data", masterDataItems)}

            {/* Admin */}
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
