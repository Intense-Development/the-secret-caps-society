"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AdminDashboardLayout } from "./AdminDashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Check, X, ArrowLeft, ExternalLink, MapPin, Globe, Building2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Store = {
  id: string;
  name: string;
  description?: string;
  website?: string;
  business_type?: string;
  tax_id?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  photo?: string;
  verification_status: "pending" | "verified" | "rejected";
  verification_document_url?: string;
  verified_at?: string;
  created_at: string;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
};

export function StoreApprovalPage() {
  const t = useTranslations("admin.stores");
  const params = useParams();
  const router = useRouter();
  const storeId = params.id as string;

  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const response = await fetch(`/api/admin/stores/${storeId}`);
        const data = await response.json();

        if (data.success) {
          setStore(data.store);
        } else {
          toast.error(data.error || "Failed to load store");
        }
      } catch (error) {
        console.error("Error fetching store:", error);
        toast.error("Failed to load store");
      } finally {
        setLoading(false);
      }
    };

    if (storeId) {
      fetchStore();
    }
  }, [storeId]);

  const handleApprove = async () => {
    setApproving(true);
    try {
      const response = await fetch(`/api/admin/stores/${storeId}/approve`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Store approved successfully");
        setStore(data.store);
        router.push("/dashboard/admin/stores");
      } else {
        toast.error(data.error || "Failed to approve store");
      }
    } catch (error) {
      console.error("Error approving store:", error);
      toast.error("Failed to approve store");
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setRejecting(true);
    try {
      const response = await fetch(`/api/admin/stores/${storeId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: rejectReason }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Store rejected");
        setStore(data.store);
        router.push("/dashboard/admin/stores");
      } else {
        toast.error(data.error || "Failed to reject store");
      }
    } catch (error) {
      console.error("Error rejecting store:", error);
      toast.error("Failed to reject store");
    } finally {
      setRejecting(false);
    }
  };

  const getStatusBadge = (status: Store["verification_status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      case "verified":
        return <Badge variant="success">Verified</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
    }
  };

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminDashboardLayout>
    );
  }

  if (!store) {
    return (
      <AdminDashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t("storeNotFound")}</p>
          <Button variant="outline" onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("goBack")}
          </Button>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h2 className="text-2xl font-semibold tracking-tight">{store.name}</h2>
            <p className="text-muted-foreground">{t("storeDetails")}</p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(store.verification_status)}
            {store.verification_status === "pending" && (
              <div className="flex gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="default" disabled={approving || rejecting}>
                      <Check className="h-4 w-4 mr-2" />
                      {t("approve")}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t("approveConfirm")}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t("approveConfirmDesc")}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleApprove} disabled={approving}>
                        {approving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {t("approving")}
                          </>
                        ) : (
                          t("approve")
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={approving || rejecting}>
                      <X className="h-4 w-4 mr-2" />
                      {t("reject")}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t("rejectConfirm")}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t("rejectReasonDesc")}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label htmlFor="reason">{t("rejectReason")}</Label>
                        <Textarea
                          id="reason"
                          placeholder={t("rejectReasonPlaceholder")}
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="mt-2"
                        />
                      </div>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleReject}
                        disabled={rejecting || !rejectReason.trim()}
                      >
                        {rejecting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {t("rejecting")}
                          </>
                        ) : (
                          t("reject")
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </div>

        {/* Store Information */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t("basicInformation")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {store.description && (
                <div>
                  <p className="text-sm font-medium mb-1">{t("description")}</p>
                  <p className="text-sm text-muted-foreground">{store.description}</p>
                </div>
              )}
              {store.owner && (
                <div>
                  <p className="text-sm font-medium mb-1">{t("owner")}</p>
                  <p className="text-sm text-muted-foreground">{store.owner.name}</p>
                  <p className="text-xs text-muted-foreground">{store.owner.email}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium mb-1">{t("created")}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(store.created_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t("businessInformation")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {store.business_type && (
                <div>
                  <p className="text-sm font-medium mb-1">{t("businessType")}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {store.business_type.replace("-", " ")}
                  </p>
                </div>
              )}
              {store.tax_id && (
                <div>
                  <p className="text-sm font-medium mb-1">{t("taxId")}</p>
                  <p className="text-sm text-muted-foreground font-mono">{store.tax_id}</p>
                </div>
              )}
              {store.website && (
                <div>
                  <p className="text-sm font-medium mb-1">{t("website")}</p>
                  <a
                    href={store.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    {store.website}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle>{t("address")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm">{store.address}</p>
                  <p className="text-sm text-muted-foreground">
                    {store.city}, {store.state} {store.zip}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Documents */}
          {store.verification_document_url && (
            <Card>
              <CardHeader>
                <CardTitle>{t("verificationDocument")}</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={store.verification_document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  {t("viewDocument")}
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminDashboardLayout>
  );
}

