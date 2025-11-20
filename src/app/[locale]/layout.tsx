import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing-config";
import { ThemeProvider } from "@/components/ThemeProvider";
import { QueryProvider } from "@/components/Providers";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LocaleHtmlAttributes } from "@/components/LocaleHtmlAttributes";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  const isValidLocale = (loc: string): loc is (typeof routing.locales)[number] => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return routing.locales.includes(loc as any);
  };
  
  if (!isValidLocale(locale)) {
    notFound();
  }

  // Providing all messages to the client
  // Load messages directly based on locale parameter
  let messages;
  try {
    // Direct import based on locale - this ensures we get the correct messages
    messages = (await import(`../../../messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);
    // Fallback to English
    try {
      messages = (await import(`../../../messages/en.json`)).default;
    } catch (fallbackError) {
      console.error('Failed to load English messages as fallback', fallbackError);
      messages = {}; // Empty object as last resort
    }
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LocaleHtmlAttributes />
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              {children}
            </TooltipProvider>
          </CartProvider>
        </QueryProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}

