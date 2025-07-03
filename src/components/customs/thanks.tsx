"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { APP_NAME, APP_SLOGAN } from "@/constants/env";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function Thanks({ route }: { route: string }) {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6">
            <div className="flex flex-row space-x-1">
              <div>
                <Image src="/images/logo64.png" alt="Logo" width={64} height={64} />
              </div>
              <div className="flex flex-1 text-primary text-3xl items-end">{APP_NAME}</div>
            </div>
            <div className="flex flex-1 text-gray-400 mt-3">{APP_SLOGAN}</div>
            <div className="flex flex-col gap-6 bg-green-100 border-green-400 text-sm my-4 p-4 rounded">
              <span>
                {route === "forgot-password-success" ? t("email_password_success") : route === "register-success" ? t("register_success") : t("email_password")}
              </span>
            </div>

            {route === "forgot-password-success" || route === "register-success" ? (
              <div className="mt-4">
                <a href={`/${locale}`}>
                  <Button className="w-full">{t("login")}</Button>
                </a>
              </div>
            ) : (
              <>
                <div className="mt-4 text-sm">
                  <span>
                    {t("login_intro") + " "}
                    <a href={`/${locale}`} className="hover:underline underline-offset-4 text-sky-600">
                      {t("login")}
                    </a>
                  </span>
                </div>
                <div className="mt-2 text-sm">
                  <span>
                    {t("register_intro") + " "}
                    <a href={`/${locale}/register`} className="hover:underline underline-offset-4 text-sky-600">
                      {t("register")}
                    </a>
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="relative hidden bg-muted md:block">
            <Image
              src="/images/login.jpg"
              alt="Login"
              width={480}
              height={480}
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
