import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

export default async function StoreRegistrationRedirect() {
  const locale = await getLocale();
  redirect(`/${locale}/store-registration`);
}
