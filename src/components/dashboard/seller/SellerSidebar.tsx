"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/routing-config";
import { Link } from "@/i18n/routing-config";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  DollarSign,
  Truck,
  Users,
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
    href: "/dashboard/seller",
    icon: LayoutDashboard,
  },
  {
    key: "products",
    href: "/dashboard/seller/products",
    icon: Package,
  },
  {
    key: "orders",
    href: "/dashboard/seller/orders",
    icon: ShoppingBag,
  },
  {
    key: "revenue",
    href: "/dashboard/seller/revenue",
    icon: DollarSign,
  },
  {
    key: "shipping",
    href: "/dashboard/seller/shipping",
    icon: Truck,
  },
  {
    key: "team",
    href: "/dashboard/seller/team",
    icon: Users,
  },
  {
    key: "settings",
    href: "/dashboard/seller/settings",
    icon: Settings,
  },
];

export function SellerSidebar() {
  const t = useTranslations("seller.sidebar");
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
                  (item.href !== "/dashboard/seller" &&
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

