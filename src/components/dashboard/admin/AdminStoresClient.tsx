"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { PendingStoresList, type PendingStore } from "./PendingStoresList";
import { VerifiedStoresList, type VerifiedStore } from "./VerifiedStoresList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAdminRealtime } from "@/hooks/useAdminRealtime";

/**
 * Admin Stores Management Client Component
 * Displays both pending and verified stores with tabs and pagination
 */
export function AdminStoresClient() {
  const t = useTranslations("admin.stores");
  const router = useRouter();

  // Tab state
  const [activeTab, setActiveTab] = useState<"pending" | "verified">("pending");

  // Pending stores state
  const [pendingStores, setPendingStores] = useState<PendingStore[]>([]);
  const [pendingStoresPage, setPendingStoresPage] = useState(1);
  const [pendingStoresTotal, setPendingStoresTotal] = useState(0);
  const [loadingPendingStores, setLoadingPendingStores] = useState(true);

  // Verified stores state
  const [verifiedStores, setVerifiedStores] = useState<VerifiedStore[]>([]);
  const [verifiedStoresPage, setVerifiedStoresPage] = useState(1);
  const [verifiedStoresTotal, setVerifiedStoresTotal] = useState(0);
  const [loadingVerifiedStores, setLoadingVerifiedStores] = useState(true);

  // Fetch pending stores
  const fetchPendingStores = useCallback(
    async (page: number) => {
      setLoadingPendingStores(true);
      try {
        const response = await fetch(
          `/api/admin/stores/pending?page=${page}&limit=15`
        );
        const data = await response.json();

        if (data.success) {
          // Convert submittedAt strings to Date objects
          const storesWithDates = data.stores.map(
            (store: PendingStore & { submittedAt: string }) => ({
              ...store,
              submittedAt: new Date(store.submittedAt),
            })
          );
          setPendingStores(storesWithDates);
          setPendingStoresTotal(data.totalCount);
          setPendingStoresPage(page);
        } else {
          toast.error(data.error || "Failed to fetch pending stores");
        }
      } catch (error) {
        console.error("Error fetching pending stores:", error);
        toast.error("Failed to fetch pending stores");
      } finally {
        setLoadingPendingStores(false);
      }
    },
    []
  );

  // Fetch verified stores
  const fetchVerifiedStores = useCallback(
    async (page: number) => {
      setLoadingVerifiedStores(true);
      try {
        const response = await fetch(
          `/api/admin/stores/verified?page=${page}&limit=15`
        );
        const data = await response.json();

        if (data.success) {
          // Convert verifiedAt strings to Date objects
          const storesWithDates = data.stores.map(
            (store: VerifiedStore & { verifiedAt: string }) => ({
              ...store,
              verifiedAt: new Date(store.verifiedAt),
            })
          );
          setVerifiedStores(storesWithDates);
          setVerifiedStoresTotal(data.totalCount);
          setVerifiedStoresPage(page);
        } else {
          toast.error(data.error || "Failed to fetch verified stores");
        }
      } catch (error) {
        console.error("Error fetching verified stores:", error);
        toast.error("Failed to fetch verified stores");
      } finally {
        setLoadingVerifiedStores(false);
      }
    },
    []
  );

  // Initial data fetch
  useEffect(() => {
    fetchPendingStores(1);
    fetchVerifiedStores(1);
  }, [fetchPendingStores, fetchVerifiedStores]);

  // Handle store changes (approvals, rejections, revocations, new stores)
  const handleStoreChange = useCallback(
    (payload: {
      eventType: "INSERT" | "UPDATE" | "DELETE";
      new?: Record<string, unknown>;
      old?: Record<string, unknown>;
    }) => {
      if (payload.eventType === "UPDATE") {
        const store = payload.new;
        if (store && store.verification_status) {
          // Refresh both lists when store status changes
          toast.info(t("storeStatusUpdated") || "Store status updated");
          fetchPendingStores(pendingStoresPage);
          fetchVerifiedStores(verifiedStoresPage);
        }
      } else if (payload.eventType === "INSERT") {
        // New store added - refresh pending stores
        toast.info(t("newStoreApplication") || "New store application");
        fetchPendingStores(pendingStoresPage);
      }
    },
    [
      t,
      fetchPendingStores,
      fetchVerifiedStores,
      pendingStoresPage,
      verifiedStoresPage,
    ]
  );

  // Subscribe to realtime updates
  useAdminRealtime({
    onStoreChange: handleStoreChange,
    onOrderChange: () => {},
    onUserChange: () => {},
    enabled: true,
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          {t("title") || "Stores"}
        </h2>
        <p className="text-muted-foreground">
          {t("description") || "Manage and verify store applications"}
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "pending" | "verified")}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="pending">
            {t("pendingStores") || "Pending Stores"}
            {pendingStoresTotal > 0 && (
              <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                {pendingStoresTotal}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="verified">
            {t("verifiedStores") || "Verified Stores"}
            {verifiedStoresTotal > 0 && (
              <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                {verifiedStoresTotal}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {loadingPendingStores ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <PendingStoresList
              stores={pendingStores}
              totalCount={pendingStoresTotal}
              page={pendingStoresPage}
              onPageChange={fetchPendingStores}
              onRefresh={() => fetchPendingStores(pendingStoresPage)}
              itemsPerPage={15}
              loading={loadingPendingStores}
            />
          )}
        </TabsContent>

        <TabsContent value="verified" className="space-y-4">
          {loadingVerifiedStores ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <VerifiedStoresList
              stores={verifiedStores}
              totalCount={verifiedStoresTotal}
              page={verifiedStoresPage}
              onPageChange={fetchVerifiedStores}
              onRefresh={() => fetchVerifiedStores(verifiedStoresPage)}
              itemsPerPage={15}
              loading={loadingVerifiedStores}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

