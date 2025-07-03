"use client";

import { registerValidation, registerAction } from "@/actions/auth.actions";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_NAME, APP_SLOGAN } from "@/constants/env";
import { useActionState, useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { FORM_INITIAL_STATE } from "@/constants/global";
import { useRouter } from "next/navigation";
import { ErrorsHandling, ErrorsZod } from "@/components/customs/errors";
import { Textarea } from "@/components/ui/textarea";
import { useLocale, useTranslations } from "next-intl";
import { ImageUpload } from "@/components/customs/image.upload";
import { Separator } from "@/components/ui/separator";
import { SpecialSubmitButton } from "@/components/customs/button.submit";

export function RegisterForm() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formState, formAction] = useActionState(registerAction, FORM_INITIAL_STATE);
  const [errors, setErrors] = useState<typeof formState | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (formState?.redirect) {
      router.push(formState.redirect);
    }
    setIsLoading(false);
  }, [formState, router]);

  const handleSubmit = async () => {
    setIsLoading(true);
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);

    const result = await registerValidation(formData);
    if (result) {
      setErrors(result);
      setIsLoading(false);
      return;
    }
    setErrors(null);
    formRef.current.requestSubmit();
  };
  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div>
            <div className="flex flex-row space-x-1 mb-4">
              <div className="flex">
                <Image src="/images/logo64.png" alt="Photo" width={64} height={64} />
              </div>
              <div className="flex flex-col flex-1">
                <div className="flex flex-1 text-primary text-2xl md:text-3xl items-end">{APP_NAME}</div>
                <div className="flex flex-1 text-gray-400 items-end">{APP_SLOGAN}</div>
              </div>
            </div>
            <div className="grid">
              <span className="text-2xl font-bold text-gray-600">{t("register")}</span>
            </div>
          </div>
          <Separator className="my-4" />
          <form ref={formRef} className="flex flex-col p-0 md:flex-row md:flex-1" action={formAction}>
            <div className="gap-6 pr-6 md:border-r pb-6">
              <input id="formMethod" name="formMethod" type="hidden" value={"create"} />
              <input id="api" name="api" type="hidden" defaultValue={"auth/register"} />
              <div>
                <Label htmlFor="photo" className="flex items-center gap-1 mb-1" required>
                  {t("photo")} (10mb max)
                </Label>
                <ImageUpload id="photo" name="photo" />
                <ErrorsZod error={errors?.zodErrors?.photo} />
              </div>
            </div>
            <div className="flex flex-col flex-1 gap-6 md:pl-6">
              {["name", "email", "phone"].map((key) => {
                const maxLengthMap: Record<string, number> = {
                  name: 191,
                  email: 191,
                  phone: 20,
                };

                return (
                  <div className="grid" key={key}>
                    <Label htmlFor={key} required>
                      {t(key)}
                    </Label>
                    <Input id={key} name={key} type={key === "email" ? "email" : "text"} placeholder={t(`${key}_placeholder`)} maxLength={maxLengthMap[key]} />
                    <ErrorsZod error={errors?.zodErrors?.[key]} />
                  </div>
                );
              })}

              <div className="grid">
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
                  <ErrorsZod error={errors?.zodErrors?.password} />
                  <div className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-gray-700">
                    {showPassword ? (
                      <Eye
                        onClick={() => {
                          setShowPassword(!showPassword);
                        }}
                      />
                    ) : (
                      <EyeOff onClick={() => setShowPassword(!showPassword)} />
                    )}
                  </div>
                </div>
              </div>
              <div className="grid">
                <Label htmlFor="address" required>
                  {t("address")}
                </Label>
                <Textarea id="address" name="address" placeholder={t("address_placeholder")} maxLength={191} />
                <ErrorsZod error={errors?.zodErrors?.address} />
              </div>
              <SpecialSubmitButton className="w-full" text={t("register")} onClick={() => handleSubmit()} loading={isLoading} loadingText="Loading" />
              <div className="mt-4 text-sm">
                {t("login_intro") + " "}
                <a href={`/${locale}`} className="hover:underline underline-offset-4 text-sky-600">
                  {t("login")}
                </a>
              </div>
              <ErrorsHandling error={errors?.message} />
              <ErrorsHandling error={formState?.message} />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
