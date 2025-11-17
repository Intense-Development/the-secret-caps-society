import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";
import { localeCodes, defaultLocale } from "./config";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: localeCodes as [string, ...string[]],

  // Used when no locale matches
  defaultLocale: defaultLocale,
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);

