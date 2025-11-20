"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const accountSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  email: z.string().email().optional(), // Read-only
});

type AccountFormValues = z.infer<typeof accountSchema>;

interface AccountSettingsFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  onSuccess: () => void;
}

export function AccountSettingsForm({
  user,
  onSuccess,
}: AccountSettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
    },
  });

  useEffect(() => {
    form.reset({
      name: user.name,
      email: user.email,
    });
  }, [user, form]);

  const onSubmit = async (values: AccountFormValues) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/seller/settings/account", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update account settings");
      }

      toast.success("Account settings updated successfully");
      onSuccess();
    } catch (error) {
      console.error("Error updating account settings:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update account settings. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>
          Manage your account information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      disabled
                      {...field}
                      className="bg-muted"
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    Email cannot be changed. Contact support if you need to
                    update your email.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Role</FormLabel>
              <div>
                <Badge variant="secondary" className="capitalize">
                  {user.role}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Your account role. This cannot be changed.
              </p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

