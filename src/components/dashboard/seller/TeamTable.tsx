"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Mail } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { TeamMember } from "@/application/team/seller/getStoreTeam";
import { TeamMemberForm } from "./TeamMemberForm";
import { DeleteTeamMemberDialog } from "./DeleteTeamMemberDialog";

interface TeamTableProps {
  team: TeamMember[];
  storeId: string | null;
  onRefresh: () => void;
}

function getRoleBadgeVariant(
  role: string
): "default" | "secondary" | "outline" {
  switch (role.toLowerCase()) {
    case "owner":
      return "default";
    case "manager":
      return "secondary";
    case "staff":
      return "outline";
    default:
      return "outline";
  }
}

export function TeamTable({ team, storeId, onRefresh }: TeamTableProps) {
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<TeamMember | null>(
    null
  );

  if (team.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <Mail className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No team members</h3>
        <p className="text-muted-foreground">
          Invite team members to help manage your store.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {team.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">
                  {member.user?.name || "Unknown"}
                </TableCell>
                <TableCell>{member.user?.email || "—"}</TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(member.role)}>
                    {member.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {member.joined_at ? (
                    <Badge variant="success">Active</Badge>
                  ) : (
                    <Badge variant="outline">Pending</Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {member.joined_at
                    ? formatDistanceToNow(new Date(member.joined_at), {
                        addSuffix: true,
                      })
                    : member.invited_at
                    ? `Invited ${formatDistanceToNow(new Date(member.invited_at), {
                        addSuffix: true,
                      })}`
                    : "—"}
                </TableCell>
                <TableCell className="text-right">
                  {member.role !== "owner" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => setEditingMember(member)}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeletingMember(member)}
                          className="cursor-pointer text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingMember && (
        <TeamMemberForm
          member={editingMember}
          storeId={storeId}
          onClose={() => {
            setEditingMember(null);
            onRefresh();
          }}
        />
      )}

      {deletingMember && (
        <DeleteTeamMemberDialog
          member={deletingMember}
          storeId={storeId}
          onClose={() => {
            setDeletingMember(null);
            onRefresh();
          }}
        />
      )}
    </>
  );
}

