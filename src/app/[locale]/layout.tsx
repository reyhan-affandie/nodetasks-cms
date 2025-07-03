import { ReactNode } from "react";
import { APP_NAME, APP_SLOGAN, CMS_ORIGIN } from "@/constants/env";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import "./globals.css";
import { Roboto } from "next/font/google"; // Import Roboto font

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"], // Light, Regular, Medium, Bold
  display: "swap",
});

export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "id" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return {
    title: APP_NAME,
    description: APP_SLOGAN,
    alternates: {
      canonical: `${CMS_ORIGIN}/${locale}`,
      languages: {
        en: `${CMS_ORIGIN}/en`,
        id: `${CMS_ORIGIN}/id`,
        ph: `${CMS_ORIGIN}/ph`,
      },
    },
  };
}

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params;
  const messages = await getMessages();
  setRequestLocale(locale);
  return (
    <html lang={locale}>
      <body className={`${roboto.className} antialiased`}>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
