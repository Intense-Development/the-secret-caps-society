"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { SellerSidebar } from "./SellerSidebar";
import { SellerHeader } from "./SellerHeader";

interface SellerDashboardLayoutProps {
  children: React.ReactNode;
}

export function SellerDashboardLayout({
  children,
}: SellerDashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <SellerSidebar />
        <div className="flex flex-1 flex-col">
          <SellerHeader />
          <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

