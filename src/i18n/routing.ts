import { localeCodes, defaultLocale } from "./config";

/**
 * Generates a localized path for a given pathname and locale
 * @param pathname - The pathname (with or without locale prefix)
 * @param locale - The target locale code
 * @returns The localized path
 */
export function getLocalePath(pathname: string, locale: string): string {
  // Remove existing locale prefix if present
  const pathWithoutLocale = removeLocalePrefix(pathname);

  // Extract query string if present
  const [path, query] = pathWithoutLocale.split("?");

  // Build the new path with locale prefix
  const localizedPath = path === "/" ? `/${locale}` : `/${locale}${path}`;

  // Append query string if it existed
  return query ? `${localizedPath}?${query}` : localizedPath;
}

/**
 * Extracts the locale code from a pathname
 * @param pathname - The pathname to extract locale from
 * @returns The locale code or null if not found
 */
export function extractLocale(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return null;
  }

  const firstSegment = segments[0];
  if (localeCodes.includes(firstSegment)) {
    return firstSegment;
  }

  return null;
}

/**
 * Removes the locale prefix from a pathname
 * @param pathname - The pathname with potential locale prefix
 * @returns The pathname without locale prefix
 */
export function removeLocalePrefix(pathname: string): string {
  const locale = extractLocale(pathname);
  if (!locale) {
    return pathname;
  }

  // Remove the locale segment
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 1) {
    // Only locale in path, return root
    return "/";
  }

  // Remove first segment (locale) and reconstruct path
  const pathWithoutLocale = "/" + segments.slice(1).join("/");
  return pathWithoutLocale;
}

/**
 * Gets the pathname without locale prefix and query parameters
 * @param fullPath - The full path including locale and query params
 * @returns The clean pathname
 */
export function getPathnameWithoutLocale(fullPath: string): string {
  const [pathname] = fullPath.split("?");
  return removeLocalePrefix(pathname);
}

