"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/routing-config";
import { Link } from "@/i18n/routing-config";
import {
  LayoutDashboard,
  Store,
  Users,
  BarChart3,
  CreditCard,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    key: "dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    key: "stores",
    href: "/dashboard/admin/stores",
    icon: Store,
  },
  {
    key: "users",
    href: "/dashboard/admin/users",
    icon: Users,
  },
  {
    key: "analytics",
    href: "/dashboard/admin/analytics",
    icon: BarChart3,
  },
  {
    key: "payments",
    href: "/dashboard/admin/payments",
    icon: CreditCard,
  },
  {
    key: "settings",
    href: "/dashboard/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const t = useTranslations("admin.sidebar");
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === pathname ||
                  (item.href !== "/dashboard" &&
                    pathname?.startsWith(item.href));

                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={t(item.key)}
                    >
                      <Link href={item.href}>
                        <Icon />
                        <span>{t(item.key)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

