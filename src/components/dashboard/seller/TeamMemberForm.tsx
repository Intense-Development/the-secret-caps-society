"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { TeamMember } from "@/application/team/seller/getStoreTeam";

const memberSchema = z.object({
  role: z.enum(["owner", "manager", "staff"]),
});

type MemberFormValues = z.infer<typeof memberSchema>;

interface TeamMemberFormProps {
  member: TeamMember;
  storeId: string | null;
  onClose: () => void;
}

export function TeamMemberForm({
  member,
  storeId,
  onClose,
}: TeamMemberFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      role: member.role,
    },
  });

  useEffect(() => {
    form.reset({
      role: member.role,
    });
  }, [member, form]);

  const onSubmit = async (values: MemberFormValues) => {
    if (!storeId) {
      toast.error("No store selected");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/seller/team/${member.id}?storeId=${storeId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            storeId,
            role: values.role,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update team member");
      }

      toast.success("Team member updated successfully");
      onClose();
    } catch (error) {
      console.error("Error updating team member:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update team member. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Team Member</DialogTitle>
          <DialogDescription>
            Update {member.user?.name || member.user?.email}'s role and
            permissions.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Member</label>
              <div className="text-sm text-muted-foreground">
                {member.user?.name} ({member.user?.email})
              </div>
            </div>

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={member.role === "owner"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="owner" disabled>
                        Owner (cannot be changed)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {member.role === "owner" &&
                      "Owner role cannot be changed."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || member.role === "owner"}>
                {isSubmitting ? "Updating..." : "Update Member"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

