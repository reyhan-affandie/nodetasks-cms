"use client";

import { LoginForm } from "@/components/forms/login.form";
import HeaderAuth from "@/components/customs/header.auth";
import FooterAuth from "@/components/customs/footer.auth";

export default function RootPage() {

  return (
    <div className="flex flex-1 flex-col min-h-svh max-h-svh">
      <HeaderAuth />
      <div className="flex flex-1 w-full items-center justify-center p-6 md:p-10 bg-secondary">
        <div className="w-full max-w-sm md:max-w-3xl">
          <LoginForm />
        </div>
      </div>
      <FooterAuth />
    </div>
  );
}
