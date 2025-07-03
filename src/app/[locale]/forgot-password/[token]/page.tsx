"use client"

import FooterAuth from "@/components/customs/footer.auth";
import HeaderAuth from "@/components/customs/header.auth";
import { VerifyForgotPasswordForm } from "@/components/forms/verify.forgot.password.form";
import { useParams } from "next/navigation";

export default function VerifyForgotPasswordPage() {
  const params = useParams();
  const token = String(params?.token);
  return (
    <div className="flex flex-1 flex-col min-h-svh max-h-svh">
      <HeaderAuth />
      <div className="flex flex-1 w-full items-center justify-center p-6 md:p-10 bg-secondary">
        <div className="w-full max-w-sm md:max-w-3xl">
          <VerifyForgotPasswordForm token={token} />
        </div>
      </div>
      <FooterAuth />
    </div>
  );
}
