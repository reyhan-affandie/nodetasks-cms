import Image from "next/image";
import { APP_NAME } from "@/constants/env";

interface LogoProps {
  dark?: boolean;
  size?: number;
}

export function Logo({ dark = false, size = 32 | 64 }: Readonly<LogoProps>) {
  let image = <Image src="/images/logo32.png" alt="Logo" width={32} height={32} />;
  if (size && size === 64) {
    image = <Image src="/images/logo64.png" alt="Logo" width={64} height={64} />;
  }
  return (
    <div className="flex items-center gap-2">
      {image}
      <span className={`text-lg font-semibold ${dark ? "text-white" : "text-slate-900"}`}>{APP_NAME}</span>
    </div>
  );
}

export function JustLogo({ size = 32 | 64 }: Readonly<LogoProps>) {
  let image = <Image src="/images/logo32.png" alt="Logo" width={32} height={32} />;
  if (size && size === 64) {
    image = <Image src="/images/logo64.png" alt="Logo" width={64} height={64} />;
  }
  return <div>{image}</div>;
}
