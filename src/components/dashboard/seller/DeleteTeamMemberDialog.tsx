"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { TeamMember } from "@/application/team/seller/getStoreTeam";

interface DeleteTeamMemberDialogProps {
  member: TeamMember;
  storeId: string | null;
  onClose: () => void;
}

export function DeleteTeamMemberDialog({
  member,
  storeId,
  onClose,
}: DeleteTeamMemberDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!storeId) {
      toast.error("No store selected");
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(
        `/api/seller/team/${member.id}?storeId=${storeId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove team member");
      }

      toast.success("Team member removed successfully");
      onClose();
    } catch (error) {
      console.error("Error removing team member:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to remove team member. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={true} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Team Member?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove <strong>{member.user?.name || member.user?.email}</strong> from
            your store team. They will no longer have access to this store.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} onClick={onClose}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Removing..." : "Remove"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

