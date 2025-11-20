"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Bell, User, ChevronDown, Store, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { useLogout } from "@/hooks/useLogout";
import { SellerSearch } from "./SellerSearch";
import { RealtimeIndicator } from "../admin/RealtimeIndicator";

interface Store {
  id: string;
  name: string;
}

export function SellerHeader() {
  const t = useTranslations("seller.header");
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  const { logout } = useLogout();
  const router = useRouter();
  const pathname = usePathname();

  // Get store from localStorage on mount
  useEffect(() => {
    const storeIdFromStorage = localStorage.getItem("selectedStoreId");
    if (storeIdFromStorage) {
      setSelectedStoreId(storeIdFromStorage);
    }
  }, []);

  // Fetch user info and stores
  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserName(
          (user.user_metadata?.name as string) ||
            user.email?.split("@")[0] ||
            "Seller"
        );
        setUserEmail(user.email || "");

        // Fetch seller's stores
        const { data: storesData, error } = await supabase
          .from("stores")
          .select("id, name")
          .eq("owner_id", user.id)
          .order("name");

        if (error) {
          console.error("Error fetching stores:", error);
        } else {
          setStores(storesData || []);
          
          // If no store selected and stores exist, select first one
          if (storesData && storesData.length > 0) {
            const currentStoreId = localStorage.getItem("selectedStoreId");
            if (!currentStoreId && storesData.length > 0) {
              const firstStoreId = storesData[0].id;
              setSelectedStoreId(firstStoreId);
              localStorage.setItem("selectedStoreId", firstStoreId);
            }
          }
        }
      }
      setIsLoadingStores(false);
    };
    
    fetchData();
  }, []);

  const handleStoreChange = (storeId: string) => {
    setSelectedStoreId(storeId);
    localStorage.setItem("selectedStoreId", storeId);
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event("storeChanged"));
    // Refresh the page to update all data
    router.refresh();
  };

  const selectedStore = stores.find((s) => s.id === selectedStoreId);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-4 px-4 md:px-6">
        <SidebarTrigger />

        {/* Store Selector - Only show if multiple stores */}
        {stores.length > 1 && (
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-muted-foreground" />
            <Select
              value={selectedStoreId || undefined}
              onValueChange={handleStoreChange}
              disabled={isLoadingStores}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select store..." />
              </SelectTrigger>
              <SelectContent>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    <div className="flex items-center gap-2">
                      {store.name}
                      {selectedStoreId === store.id && (
                        <Check className="h-4 w-4" />
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Single store name display */}
        {stores.length === 1 && selectedStore && (
          <div className="flex items-center gap-2 text-sm font-medium">
            <Store className="h-4 w-4 text-muted-foreground" />
            <span>{selectedStore.name}</span>
          </div>
        )}

        <div className="flex-1 max-w-md">
          <SellerSearch />
        </div>

        <div className="flex items-center gap-2">
          <RealtimeIndicator />
          <Button variant="ghost" size="icon" title={t("notifications")}>
            <Bell className="h-5 w-5" />
            <span className="sr-only">{t("notifications")}</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span className="hidden md:inline-block">{userName}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userEmail}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                {t("logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

