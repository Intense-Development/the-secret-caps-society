import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing-config";

export default function RootPage() {
  // Redirect to default locale
  // The middleware will handle locale detection from cookies/headers
  redirect(`/${routing.defaultLocale}`);
}
