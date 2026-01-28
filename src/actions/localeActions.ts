"use server";

import { cookies } from "next/headers";
import { Locale, locales, defaultLocale } from "@/i18n/request";

export async function setLocale(locale: Locale) {
  if (!locales.includes(locale)) {
    return { success: false, error: "Invalid locale" };
  }

  const cookieStore = await cookies();
  cookieStore.set("locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });

  return { success: true };
}

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value as Locale;
  return locales.includes(locale) ? locale : defaultLocale;
}
