import { getRequestConfig } from "next-intl/server";
import { getLang } from "@/actions/actions";

export default getRequestConfig(async () => {
  const locale = await getLang();

  return {
    locale,
    messages: (await import(`../../locales/${locale}.json`)).default,
  };
});
