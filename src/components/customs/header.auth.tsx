import Image from "next/image";
import { LanguageSwitcher } from "@/components/customs/lang.switcher";
import { APP_NAME } from "@/constants/env";

export default function HeaderAuth() {
  return (
    <header className="flex w-full items-center border-b justify-between p-2 bg-primary text-white">
      <div className="flex flex-row gap-1 items-end">
        <Image src="/images/logo64-dark.png" alt="Logo" width={64} height={64} />
        <span className="text-3xl">{APP_NAME}</span>
      </div>
      <LanguageSwitcher />
    </header>
  );
}
