"use client";

import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";

interface NextIntlProviderProps {
  locale: string;
  messages: Record<string, unknown>;
  children: ReactNode;
}

export function NextIntlProvider({ locale, messages, children }: NextIntlProviderProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

