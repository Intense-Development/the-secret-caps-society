import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing-config";

export default function StoresRedirect() {
  redirect(`/${routing.defaultLocale}/stores`);
}
