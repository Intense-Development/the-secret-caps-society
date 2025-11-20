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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { Shipment, ShipmentStatus } from "@/application/shipping/seller/getSellerShipments";

const shipmentSchema = z.object({
  tracking_number: z.string().optional(),
  carrier: z.string().optional(),
  status: z.enum(["pending", "shipped", "in_transit", "delivered", "failed"]),
  estimated_delivery: z.string().optional(),
});

type ShipmentFormValues = z.infer<typeof shipmentSchema>;

interface ShipmentFormProps {
  shipment?: Shipment | null;
  orderId?: string;
  storeId: string | null;
  onClose: () => void;
}

export function ShipmentForm({
  shipment,
  orderId,
  storeId,
  onClose,
}: ShipmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!shipment;
  const finalOrderId = shipment?.order_id || orderId;

  const form = useForm<ShipmentFormValues>({
    resolver: zodResolver(shipmentSchema),
    defaultValues: {
      tracking_number: "",
      carrier: "",
      status: "pending",
      estimated_delivery: "",
    },
  });

  useEffect(() => {
    if (shipment) {
      form.reset({
        tracking_number: shipment.tracking_number || "",
        carrier: shipment.carrier || "",
        status: shipment.status,
        estimated_delivery: shipment.estimated_delivery
          ? new Date(shipment.estimated_delivery).toISOString().split("T")[0]
          : "",
      });
    }
  }, [shipment, form]);

  const onSubmit = async (values: ShipmentFormValues) => {
    if (!storeId) {
      toast.error("No store selected");
      return;
    }

    if (!finalOrderId) {
      toast.error("Order ID is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const url = isEditing
        ? `/api/seller/shipping/${shipment.id}?storeId=${storeId}`
        : `/api/seller/shipping`;
      const method = isEditing ? "PATCH" : "POST";

      const payload: Record<string, unknown> = {
        storeId,
        ...values,
      };

      if (!isEditing) {
        payload.orderId = finalOrderId;
      }

      if (values.estimated_delivery) {
        payload.estimatedDelivery = new Date(
          values.estimated_delivery
        ).toISOString();
      } else {
        payload.estimatedDelivery = null;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save shipment");
      }

      toast.success(
        isEditing ? "Shipment updated successfully" : "Shipment created successfully"
      );
      onClose();
    } catch (error) {
      console.error("Error saving shipment:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save shipment. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Shipment" : "Create Shipment"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update shipment information and tracking details."
              : "Add tracking information for this order."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="tracking_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tracking Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter tracking number" {...field} />
                  </FormControl>
                  <FormDescription>
                    Optional tracking number from carrier
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="carrier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carrier</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., USPS, FedEx, UPS" {...field} />
                  </FormControl>
                  <FormDescription>Shipping carrier name</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="in_transit">In Transit</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estimated_delivery"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Delivery</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>
                    Expected delivery date (optional)
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : isEditing
                  ? "Update Shipment"
                  : "Create Shipment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

