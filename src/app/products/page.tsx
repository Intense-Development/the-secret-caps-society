import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing-config";

export default function ProductsRedirect() {
  redirect(`/${routing.defaultLocale}/products`);
}
