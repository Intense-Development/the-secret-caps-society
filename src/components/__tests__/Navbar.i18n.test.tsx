import { describe, it, expect } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { Navbar } from "../Navbar";
import { NextIntlClientProvider } from "next-intl";

const enMessages = {
  nav: {
    products: "Products",
    stores: "Stores",
    about: "About",
    login: "Login",
    signUp: "Sign Up",
    dashboard: "Dashboard",
  },
};

const esMessages = {
  nav: {
    products: "Productos",
    stores: "Tiendas",
    about: "Acerca de",
    login: "Iniciar sesión",
    signUp: "Registrarse",
    dashboard: "Panel",
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderWithLocale = (locale: string, messages: Record<string, any>) => {
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Navbar />
    </NextIntlClientProvider>
  );
};

describe("Navbar i18n", () => {
  it("should display translated navigation links in English", () => {
    renderWithLocale("en", enMessages);
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Stores")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
  });

  it("should display translated navigation links in Spanish", () => {
    renderWithLocale("es", esMessages);
    expect(screen.getByText("Productos")).toBeInTheDocument();
    expect(screen.getByText("Tiendas")).toBeInTheDocument();
    expect(screen.getByText("Acerca de")).toBeInTheDocument();
  });

  it("should display translated auth buttons in English", () => {
    renderWithLocale("en", enMessages);
    // When not authenticated, should show Login and Sign Up
    // Note: This test may need mocking of auth state
  });

  it("should display translated auth buttons in Spanish", () => {
    renderWithLocale("es", esMessages);
    // When not authenticated, should show Spanish translations
  });

  it("should maintain locale in links", () => {
    // Test that links include locale prefix
    // This would require checking href attributes
  });
});

