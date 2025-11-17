import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

export default async function StoresRedirect() {
  const locale = await getLocale();
  redirect(`/${locale}/stores`);
}
