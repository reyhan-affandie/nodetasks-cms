"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_NAME, APP_SLOGAN } from "@/constants/env";
import { useActionState, useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { SubmitButton } from "@/components/customs/button.submit";
import { FORM_INITIAL_STATE } from "@/constants/global";
import { useRouter } from "next/navigation";
import { ErrorsHandling, ErrorsZod } from "@/components/customs/errors";
import { useLocale, useTranslations } from "next-intl";
import { verifyForgotPasswordAction } from "@/actions/auth.actions";

export function VerifyForgotPasswordForm({ token }: { token: string }) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formState, formAction] = useActionState(verifyForgotPasswordAction, FORM_INITIAL_STATE);
  useEffect(() => {
    if (formState?.redirect) {
      router.push(formState.redirect);
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
              <div className="flex flex-1 text-primary text-3xl items-end">{APP_NAME}</div>
            </div>
            <div className="flex flex-1 text-gray-400 mt-3">{APP_SLOGAN.replace("-", " ")}</div>
            <div className="flex flex-col gap-6">
              <div className="grid">
                <span className="text-2xl font-bold text-gray-600">{t("forgot_password")}</span>
              </div>
              <input id="formMethod" name="formMethod" type="hidden" value={"update"} />
              <input id="api" name="api" type="hidden" defaultValue={"auth/password/forgot"} />
              <input id="token" name="token" type="hidden" value={token} />
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password" required>
                    {t("password")}
                  </Label>
                </div>
                <div className="relative">
                  <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder={t("password_placeholder")} maxLength={191} />
                  <ErrorsZod error={formState?.zodErrors?.password} />
                  <div className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-gray-700">
                    {showPassword ? <Eye onClick={() => setShowPassword(!showPassword)} /> : <EyeOff onClick={() => setShowPassword(!showPassword)} />}
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password" required>
                    {t("confirm_password")}
                  </Label>
                </div>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t("confirm_password_placeholder")}
                    maxLength={191}
                  />
                  <ErrorsZod error={formState?.zodErrors?.confirmPassword} />
                  <div className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-gray-700">
                    {showConfirmPassword ? (
                      <Eye onClick={() => setShowConfirmPassword(!showConfirmPassword)} />
                    ) : (
                      <EyeOff onClick={() => setShowConfirmPassword(!showConfirmPassword)} />
                    )}
                  </div>
                </div>
              </div>
              <SubmitButton className="w-full" text={t("change_password")} loadingText="Loading" />
            </div>
            <div className="mt-4 text-sm">
              {t("login_intro") + " "}
              <a href={`/${locale}`} className="hover:underline underline-offset-4 text-sky-600">
                {t("login")}
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
