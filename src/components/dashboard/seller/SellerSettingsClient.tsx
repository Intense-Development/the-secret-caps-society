"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StoreSettingsForm } from "./StoreSettingsForm";
import { AccountSettingsForm } from "./AccountSettingsForm";
import type { StoreSettings } from "@/application/settings/seller/getStoreSettings";
import { toast } from "sonner";

interface SellerSettingsClientProps {
  initialStore: StoreSettings | null;
  initialUser: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  storeId: string | null;
  stores: Array<{ id: string; name: string }>;
}

export function SellerSettingsClient({
  initialStore,
  initialUser,
  storeId,
  stores,
}: SellerSettingsClientProps) {
  const t = useTranslations("seller.settings");
  const [store, setStore] = useState<StoreSettings | null>(initialStore);
  const [user, setUser] = useState(initialUser);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(
    storeId
  );

  // Get selected store from localStorage
  useEffect(() => {
    const storeIdFromStorage = localStorage.getItem("selectedStoreId");
    if (storeIdFromStorage) {
      setSelectedStoreId(storeIdFromStorage);
    }
  }, []);

  // Fetch store settings when store changes
  useEffect(() => {
    if (selectedStoreId) {
      fetchStoreSettings(selectedStoreId);
    } else {
      setStore(null);
    }
  }, [selectedStoreId]);

  const fetchStoreSettings = async (storeId: string) => {
    try {
      const response = await fetch(`/api/seller/settings/store?storeId=${storeId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch store settings");
      }
      const data = await response.json();
      setStore(data.store);
    } catch (error) {
      console.error("Error fetching store settings:", error);
      toast.error("Failed to load store settings");
    }
  };

  const fetchAccountSettings = async () => {
    try {
      const response = await fetch("/api/seller/settings/account");
      if (!response.ok) {
        throw new Error("Failed to fetch account settings");
      }
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error("Error fetching account settings:", error);
      toast.error("Failed to load account settings");
    }
  };

  const handleStoreChange = (newStoreId: string) => {
    setSelectedStoreId(newStoreId);
    localStorage.setItem("selectedStoreId", newStoreId);
  };

  if (stores.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your store and account settings
          </p>
        </div>
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          <p className="mb-2">No stores found</p>
          <p className="text-sm">
            You need to create a store before you can manage settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your store and account settings
          </p>
        </div>
        {stores.length > 1 && (
          <Select
            value={selectedStoreId || ""}
            onValueChange={handleStoreChange}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select store" />
            </SelectTrigger>
            <SelectContent>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList>
          <TabsTrigger value="store">Store Settings</TabsTrigger>
          <TabsTrigger value="account">Account Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="store" className="space-y-6">
          {store ? (
            <StoreSettingsForm
              store={store}
              storeId={selectedStoreId}
              onSuccess={() => {
                if (selectedStoreId) {
                  fetchStoreSettings(selectedStoreId);
                }
              }}
            />
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              <p>No store selected</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <AccountSettingsForm
            user={user}
            onSuccess={fetchAccountSettings}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

