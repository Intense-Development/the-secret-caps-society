"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/routing-config";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Menu, X, Search, User, LayoutDashboard } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import CartIndicator from "@/components/CartIndicator";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { createClient } from "@/lib/supabase/client";

export const Navbar = () => {
  const t = useTranslations("nav");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
      } catch (error) {
        console.error("Error checking auth:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Subscribe to auth changes
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 dark:bg-black/80 backdrop-blur-lg shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="text-lg md:text-xl font-bold tracking-tight hover:opacity-80 transition-opacity"
          >
            <span className="text-primary">SECRET CAPS</span> SOCIETY
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/products"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              {t("products")}
            </Link>
            <Link
              href="/stores"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              {t("stores")}
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              {t("about")}
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <LanguageSwitcher />
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
            <CartIndicator />

            {/* Conditional Auth Button */}
            {!isLoading &&
              (isAuthenticated ? (
                <Link href="/dashboard">
                  <Button variant="default" size="sm" className="h-9">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    {t("dashboard")}
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" className="flex items-center text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                    {t("login")}
                  </Link>
                  <Link href="/register">
                    <Button variant="default" size="sm" className="h-9">
                      <User className="h-4 w-4 mr-2" />
                      {t("signUp")}
                    </Button>
                  </Link>
                </>
              ))}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-b">
          <div className="container mx-auto px-4 py-4 space-y-3">
            <Link
              href="/products"
              className="block py-2 text-foreground/80 hover:text-foreground"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t("products")}
            </Link>
            <Link
              href="/stores"
              className="block py-2 text-foreground/80 hover:text-foreground"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t("stores")}
            </Link>
            <Link
              href="/about"
              className="block py-2 text-foreground/80 hover:text-foreground"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t("about")}
            </Link>
            <div className="pt-3 flex items-center space-x-3">
              <ThemeToggle />
              <LanguageSwitcher />
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Search className="h-4 w-4" />
              </Button>
              <CartIndicator />

              {/* Conditional Auth Button - Mobile */}
              {!isLoading &&
                (isAuthenticated ? (
                  <Link href="/dashboard" className="flex-1">
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      {t("dashboard")}
                    </Button>
                  </Link>
                ) : (
                  <Link href="/register" className="flex-1">
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      {t("signUp")}
                    </Button>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
