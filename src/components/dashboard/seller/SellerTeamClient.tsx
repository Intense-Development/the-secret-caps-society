"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { TeamTable } from "./TeamTable";
import { InviteMemberDialog } from "./InviteMemberDialog";
import type { TeamMember } from "@/application/team/seller/getStoreTeam";
import { toast } from "sonner";

interface SellerTeamClientProps {
  initialTeam: TeamMember[];
  storeId: string | null;
  stores: Array<{ id: string; name: string }>;
}

export function SellerTeamClient({
  initialTeam,
  storeId,
  stores,
}: SellerTeamClientProps) {
  const t = useTranslations("seller.team");
  const [team, setTeam] = useState<TeamMember[]>(initialTeam);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
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

  // Fetch team when store changes
  useEffect(() => {
    if (selectedStoreId) {
      fetchTeam(selectedStoreId);
    } else {
      setTeam([]);
    }
  }, [selectedStoreId]);

  const fetchTeam = async (storeId: string) => {
    try {
      const response = await fetch(`/api/seller/team?storeId=${storeId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch team");
      }
      const data = await response.json();
      setTeam(data.team || []);
    } catch (error) {
      console.error("Error fetching team:", error);
      toast.error("Failed to load team members");
    }
  };

  const handleRefresh = () => {
    if (selectedStoreId) {
      fetchTeam(selectedStoreId);
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
          <h2 className="text-2xl font-semibold tracking-tight">Team</h2>
          <p className="text-muted-foreground">Manage your team members</p>
        </div>
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          <p className="mb-2">No stores found</p>
          <p className="text-sm">
            You need to create a store before you can manage team members.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Team</h2>
          <p className="text-muted-foreground">Manage your team members</p>
        </div>
        <div className="flex items-center gap-4">
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
          <Button onClick={() => setIsInviteDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        </div>
      </div>

      {/* Team Table */}
      <TeamTable team={team} storeId={selectedStoreId} onRefresh={handleRefresh} />

      {/* Invite Dialog */}
      <InviteMemberDialog
        open={isInviteDialogOpen}
        onOpenChange={(open) => {
          setIsInviteDialogOpen(open);
          if (!open) {
            handleRefresh();
          }
        }}
        storeId={selectedStoreId}
        onSuccess={handleRefresh}
      />
    </div>
  );
}

