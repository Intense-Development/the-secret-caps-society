import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

export default async function RootPage() {
  // Get locale from cookies/headers, or use default
  const locale = await getLocale();
  
  // Redirect to locale-specific route
  redirect(`/${locale}`);
}
