"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/routing-config";
import { useTranslations } from "next-intl";
import { Facebook, Instagram, Twitter } from "lucide-react";

export const Footer = () => {
  const t = useTranslations("footer");

  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand and description */}
          <div className="space-y-4">
            <h3 className="font-bold tracking-tight text-xl">
              SECRET CAPS SOCIETY
            </h3>
            <p className="text-muted-foreground text-sm">
              {t("description")}
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Facebook className="h-4 w-4" />
                <span className="sr-only">Facebook</span>
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Instagram className="h-4 w-4" />
                <span className="sr-only">Instagram</span>
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Twitter className="h-4 w-4" />
                <span className="sr-only">Twitter</span>
              </Button>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-sm mb-4 uppercase tracking-wider">
              {t("quickLinks")}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/products"
                  className="text-muted-foreground text-sm hover:text-foreground transition-colors"
                >
                  {t("products")}
                </Link>
              </li>
              <li>
                <Link
                  href="/stores"
                  className="text-muted-foreground text-sm hover:text-foreground transition-colors"
                >
                  {t("stores")}
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground text-sm hover:text-foreground transition-colors"
                >
                  {t("aboutUs")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground text-sm hover:text-foreground transition-colors"
                >
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-sm mb-4 uppercase tracking-wider">
              {t("legal")}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground text-sm hover:text-foreground transition-colors"
                >
                  {t("termsOfService")}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground text-sm hover:text-foreground transition-colors"
                >
                  {t("privacyPolicy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-muted-foreground text-sm hover:text-foreground transition-colors"
                >
                  {t("cookiePolicy")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-sm mb-4 uppercase tracking-wider">
              {t("stayUpdated")}
            </h4>
            <p className="text-muted-foreground text-sm mb-4">
              {t("newsletterDescription")}
            </p>
            <div className="flex space-x-2">
              <Input
                type="email"
                placeholder={t("emailPlaceholder")}
                className="h-9"
              />
              <Button className="h-9">{t("subscribe")}</Button>
            </div>
          </div>
        </div>

        <div className="border-t mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
          <p className="text-xs text-muted-foreground mt-2 md:mt-0">
            {t("designedWith")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
