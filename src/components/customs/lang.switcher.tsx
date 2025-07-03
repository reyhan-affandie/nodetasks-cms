"use client";

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { setLang } from "@/actions/actions";
import { useLocale } from "next-intl";

const locales = [
  { code: "en", label: "English", flag: "/images/en.webp" },
  { code: "id", label: "Bahasa Indonesia", flag: "/images/id.webp" },
  { code: "ph", label: "Filipino", flag: "/images/ph.webp" },
] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const lang = locales.find((l) => l.code === locale) || locales[0];

  async function handleLanguageChange(newLang: "en" | "id" | "ph") {
    if (newLang === locale) return; // Prevent unnecessary reload

    await setLang(newLang);

    // Remove old locale and construct new URL
    const pathWithoutLocale = pathname.replace(/^\/([a-z]{2})/, "") || "/";

    router.push(`/${newLang}${pathWithoutLocale}`);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex flex-row cursor-pointer items-center space-x-2 mr-2">
          <div className="rounded border border-neutral-300 overflow-hidden">
            <Image src={lang.flag} alt={lang.label} width={32} height={24} className="rounded" />
          </div>
          <div>{lang.code.toUpperCase()}</div>
          <div>
            <ChevronDown className="ml-auto size-4" />
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="rounded-lg" align="end" sideOffset={4}>
        <DropdownMenuGroup>
          {locales.map(({ code, label, flag }) => (
            <DropdownMenuItem
              key={code}
              onClick={() => handleLanguageChange(code as "en" | "id" | "ph")}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <Image src={flag} alt={label} width={24} height={16} className="rounded" />
              <span>{label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
