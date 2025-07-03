"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { logoutAction } from "@/actions/auth.actions";
import { API_URL } from "@/constants/env";
import LogoutModal from "@/components/customs/logout.modal";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiPayload } from "@/types/apiResult.type";
import Image from "next/image";

interface NavUserProps {
  isLoading: boolean;
  user: ApiPayload | null;
}

export function NavUser({ isLoading, user }: NavUserProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    setIsLoggingOut(true);
    startTransition(async () => {
      await logoutAction();
      router.replace("/");
      router.refresh();
      setIsLoggingOut(false);
    });
  };

  return (
    <>
      <LogoutModal open={isLoggingOut} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex flex-row cursor-pointer items-center space-x-2 mr-2">
            <Avatar className="h-10 w-10 rounded-full">
              {isLoading ? (
                <Skeleton className="h-10 w-10 rounded-full" />
              ) : user?.photo ? (
                <Image className="rounded-full object-cover" src={`${API_URL}/${user.photo}`} alt={user.name as string} width={40} height={40} />
              ) : (
                <span className="text-xs font-bold uppercase flex items-center justify-center w-full h-full bg-gray-300 text-gray-700">
                  {typeof user?.name === "string" ? user.name[0] : "?"}
                </span>
              )}
            </Avatar>

            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-32" />
              </div>
            ) : (
              <>
                <div className="flex flex-col">
                  <div className="text-sm font-bold">{(user?.name as string).split(" ")[0]}</div>
                  <div className="text-xs">{user?.email as string}</div>
                </div>
                <ChevronDown className="ml-auto size-4" />
              </>
            )}
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg" align="end" sideOffset={4}>
          <DropdownMenuItem onClick={handleLogout} disabled={isPending} className="cursor-pointer">
            <LogOut />
            {isPending ? "Logging out..." : "Log out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
