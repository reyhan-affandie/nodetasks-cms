"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_NAME, APP_SLOGAN, CMS_ORIGIN } from "@/constants/env";
import { useActionState, useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { SubmitButton } from "@/components/customs/button.submit";
import { loginAction } from "@/actions/auth.actions";
import { FORM_INITIAL_STATE } from "@/constants/global";
import { useRouter } from "next/navigation";
import { ErrorsHandling, ErrorsZod } from "@/components/customs/errors";
import { useLocale, useTranslations } from "next-intl";

export function LoginForm() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formState, formAction] = useActionState(loginAction, FORM_INITIAL_STATE);

  useEffect(() => {
    if (formState?.success === true) {
      router.refresh();
    }
  }, [formState, router]);

  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6" action={formAction}>
            <div className="flex flex-row space-x-1">
              <div>
                <Image src="/images/logo64.png" alt="Logo" width={64} height={64} />
              </div>
              <div className="flex flex-1 text-primary text-2xl items-end">{APP_NAME}</div>
            </div>
            <div className="flex flex-1 text-gray-400 mt-3">{APP_SLOGAN.replace("-", " ")}</div>
            <div className="flex flex-col gap-6">
              <div className="grid">
                <span className="text-2xl font-bold text-gray-600">{t("login")}</span>
              </div>
              <input id="formMethod" name="formMethod" type="hidden" value={"create"} />
              <input id="api" name="api" type="hidden" defaultValue={"auth/login"} />
              <div className="grid gap-2">
                <Label htmlFor="email" required>
                  {t("email")}
                </Label>
                <Input id="email" name="email" type="email" placeholder={t("email_placeholder")} maxLength={191} />
                <ErrorsZod error={formState?.zodErrors?.email} />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password" required>
                    {t("password")}
                  </Label>
                  <a href={`/${locale}/forgot-password`} className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-sky-600">
                    {t("forgot_password")}
                  </a>
                </div>
                <div className="relative">
                  <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder={t("password_placeholder")} maxLength={191} />
                  <ErrorsZod error={formState?.zodErrors?.password} />
                  <div className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-gray-700">
                    {showPassword ? <Eye onClick={() => setShowPassword(!showPassword)} /> : <EyeOff onClick={() => setShowPassword(!showPassword)} />}
                  </div>
                </div>
              </div>
              <SubmitButton className="w-full" text={t("login")} loadingText="Loading" />
            </div>
            <div className="mt-4 text-sm">
              {t("register_intro") + " "}
              <a href={`${CMS_ORIGIN}/${locale}/register`} className="hover:underline underline-offset-4 text-sky-600">
                {t("register")}
              </a>
            </div>
            <ErrorsHandling error={formState?.error ? formState?.error : ""} />
          </form>
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
