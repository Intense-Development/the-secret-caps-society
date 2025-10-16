"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BadgeCheck } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SuccessModal = ({ isOpen, onClose }: SuccessModalProps) => {
  const router = useRouter();

  const handleViewStores = () => {
    router.push("/dashboard/stores");
  };

  const handleAddProduct = () => {
    router.push("/dashboard/products/new");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
            <BadgeCheck className="h-8 w-8 text-green-600" />
          </div>
          <DialogTitle className="text-xl">
            Store Registration Successful!
          </DialogTitle>
          <DialogDescription className="pt-2 text-center">
            Your store has been registered and is now pending verification. Our
            team will review your application and get back to you soon.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-4">
          <div className="bg-secondary rounded-lg p-4">
            <h3 className="font-medium mb-1">What happens next?</h3>
            <p className="text-sm text-muted-foreground">
              1. Our team will review your store details
              <br />
              2. You&apos;ll receive an email notification when verified
              <br />
              3. Once approved, you can start adding products
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-2">
          <Button
            variant="outline"
            className="sm:flex-1"
            onClick={handleViewStores}
          >
            Go to Dashboard
          </Button>
          <Button className="sm:flex-1" onClick={handleAddProduct}>
            Prepare Products
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessModal;
