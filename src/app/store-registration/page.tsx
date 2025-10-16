"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Upload, Store, BadgeCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function StoreRegistration() {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate registration
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccessModal(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow py-16 md:py-24">
        <div className="container max-w-3xl mx-auto px-4">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to home
            </Link>
          </div>

          <Card className="border-border/40 shadow-soft">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-primary/10 p-2">
                  <Store className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Register Your Store</CardTitle>
                  <CardDescription>
                    Join our network of verified cap resellers.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-base font-medium">Store Information</h3>

                  <div className="grid gap-2">
                    <Label htmlFor="store-name">Store Name</Label>
                    <Input id="store-name" required />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="store-description">Store Description</Label>
                    <Textarea id="store-description" rows={3} required />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="store-website">Website (Optional)</Label>
                    <Input
                      id="store-website"
                      type="url"
                      placeholder="https://"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-base font-medium">
                    Business Information
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="business-type">Business Type</Label>
                      <select
                        id="business-type"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        required
                      >
                        <option value="none">Select Business Type</option>
                        <option value="sole-proprietor">Sole Proprietor</option>
                        <option value="llc">LLC</option>
                        <option value="corporation">Corporation</option>
                        <option value="partnership">Partnership</option>
                      </select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="tax-id">Tax ID (Optional)</Label>
                      <Input id="tax-id" />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="business-address">Business Address</Label>
                    <Input id="business-address" required />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" required />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="state">State/Province</Label>
                      <Input id="state" required />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="zip">ZIP/Postal Code</Label>
                      <Input id="zip" required />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-base font-medium">Verification</h3>

                  <div className="grid gap-2">
                    <Label htmlFor="document-upload">
                      Upload Business License or ID
                    </Label>
                    <div className="border-2 border-dashed border-muted rounded-md p-6 flex flex-col items-center justify-center">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-1">
                        Drag and drop or click to upload
                      </p>
                      <p className="text-xs text-muted-foreground mb-4">
                        Supports JPG, PNG, PDF up to 10MB
                      </p>
                      <input
                        id="document-upload"
                        type="file"
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          document.getElementById("document-upload")?.click()
                        }
                      >
                        Select File
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <span className="mr-2">Submitting</span>
                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      </>
                    ) : (
                      "Submit Registration"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col text-center py-6">
              <p className="text-sm text-muted-foreground">
                By registering your store, you agree to our{" "}
                <Link
                  href="/terms"
                  className="text-primary underline hover:opacity-80"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-primary underline hover:opacity-80"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>

      <Footer />

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
              <BadgeCheck className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-xl">
              Store Registration Successful!
            </DialogTitle>
            <DialogDescription className="pt-2 text-center">
              Your store has been registered and is now pending verification.
              Our team will review your application and get back to you soon.
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
              onClick={() => (window.location.href = "/stores")}
            >
              Browse Stores
            </Button>
            <Button
              className="sm:flex-1"
              onClick={() => setShowSuccessModal(false)}
            >
              Got it!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
