"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing-config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import { locales } from "@/i18n/config";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("nav");

  const currentLocale = locales.find((l) => l.code === locale);

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Languages className="h-4 w-4" />
          <span className="sr-only">{t("language") || "Change language"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc.code}
            onClick={() => handleLocaleChange(loc.code)}
            className={locale === loc.code ? "bg-accent" : ""}
          >
            {loc.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

