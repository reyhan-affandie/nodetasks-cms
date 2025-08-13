"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import { NavUser } from "@/components/layout/user.layout";
import { LanguageSwitcher } from "@/components/customs/lang.switcher";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { getAuthUser } from "@/actions/auth.actions";
import { APP_NAME, APP_SLOGAN } from "@/constants/env";
import { ApiPayload } from "@/types/apiResult.type";

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();
  const [data, setData] = useState<ApiPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await getAuthUser();
        setData(res?.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b justify-between px-4 py-2">
      <div className="hidden md:flex h-(--header-height) items-center gap-2 py-2">
        <Button onClick={toggleSidebar}>
          <Menu />
        </Button>
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex flex-row gap-1 items-end">
          <Image src="/images/logo32.png" alt="Logo" width={32} height={32} />
          <span className="text-2xl">{APP_NAME}</span>
        </div>
        <Separator orientation="vertical" className="mr-2 h-4" />
        <span>{APP_SLOGAN}</span>
      </div>
      <Button className="md:hidden" onClick={toggleSidebar}>
        <Menu />
      </Button>
      <div className="flex items-center gap-4 ml-auto">
        <NavUser isLoading={isLoading} user={data} />
        <LanguageSwitcher />
      </div>
    </header>
  );
}
