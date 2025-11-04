"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, User, Store, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { BadgeCheck } from "lucide-react";
import PasswordStrengthIndicator from "@/components/auth/PasswordStrengthIndicator";
import FileUpload from "@/components/auth/FileUpload";
import {
  buyerRegistrationSchema,
  sellerAccountSchema,
  storeInfoSchema,
  locationDetailsSchema,
  verificationSchema,
  type BuyerRegistrationInput,
  type SellerAccountInput,
  type StoreInfoInput,
  type LocationDetailsInput,
  type VerificationInput,
} from "@/lib/validations/auth";

export default function Register() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [accountType, setAccountType] = useState<"buyer" | "seller" | null>(null);
  const [step, setStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Form data storage for multi-step seller registration
  const [sellerData, setSellerData] = useState<{
    account?: SellerAccountInput;
    store?: StoreInfoInput;
    location?: LocationDetailsInput;
    verification?: VerificationInput;
  }>({});

  const totalSteps = accountType === "seller" ? 4 : 1;

  // Buyer registration form
  const buyerForm = useForm<BuyerRegistrationInput>({
    resolver: zodResolver(buyerRegistrationSchema),
    mode: "onChange",
  });

  // Seller step forms
  const sellerAccountForm = useForm<SellerAccountInput>({
    resolver: zodResolver(sellerAccountSchema),
    mode: "onChange",
  });

  const storeInfoForm = useForm<StoreInfoInput>({
    resolver: zodResolver(storeInfoSchema),
    mode: "onChange",
  });

  const locationForm = useForm<LocationDetailsInput>({
    resolver: zodResolver(locationDetailsSchema),
    mode: "onChange",
  });

  const verificationForm = useForm<VerificationInput>({
    resolver: zodResolver(verificationSchema),
    mode: "onChange",
  });

  const handleBuyerSubmit = async (data: BuyerRegistrationInput) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register/buyer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Account created successfully!",
          description: result.message,
        });
        router.push("/");
      } else {
        toast({
          title: "Registration failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSellerStepSubmit = async (
    stepData: SellerAccountInput | StoreInfoInput | LocationDetailsInput | VerificationInput
  ) => {
    if (step === 1) {
      setSellerData({ ...sellerData, account: stepData as SellerAccountInput });
      setStep(2);
      window.scrollTo(0, 0);
    } else if (step === 2) {
      setSellerData({ ...sellerData, store: stepData as StoreInfoInput });
      setStep(3);
      window.scrollTo(0, 0);
    } else if (step === 3) {
      setSellerData({ ...sellerData, location: stepData as LocationDetailsInput });
      setStep(4);
      window.scrollTo(0, 0);
    } else if (step === 4) {
      // Final submission
      setIsLoading(true);
      const finalData = {
        ...sellerData.account,
        ...sellerData.store,
        ...sellerData.location,
        ...stepData,
        agreeToTerms: true,
      };

      try {
        const response = await fetch("/api/auth/register/seller", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalData),
        });

        const result = await response.json();

        if (result.success) {
        setShowSuccessModal(true);
      } else {
          toast({
            title: "Registration failed",
            description: result.message,
            variant: "destructive",
          });
        }
      } catch {
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      setAccountType(null);
      setSellerData({});
    }
    window.scrollTo(0, 0);
  };

  const handleViewStores = () => {
    router.push("/stores");
  };

  const handleAddProduct = () => {
    router.push("/");
  };

  const renderAccountTypeSelection = () => (
        <div className="space-y-4">
      <h3 className="text-base font-medium text-center mb-4">Choose account type</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div
              className="border rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
              onClick={() => setAccountType("buyer")}
            >
              <User className="mx-auto h-10 w-10 mb-4 text-primary" />
              <h3 className="font-medium text-lg mb-2">Buyer</h3>
              <p className="text-sm text-muted-foreground">
                Shop for caps from verified sellers
              </p>
            </div>

            <div
              className="border rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
              onClick={() => setAccountType("seller")}
            >
              <Store className="mx-auto h-10 w-10 mb-4 text-primary" />
              <h3 className="font-medium text-lg mb-2">Seller</h3>
          <p className="text-sm text-muted-foreground">Create a store and sell caps</p>
            </div>
          </div>
        </div>
      );

  const renderBuyerForm = () => (
    <form onSubmit={buyerForm.handleSubmit(handleBuyerSubmit)} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          placeholder="John Doe"
          {...buyerForm.register("name")}
        />
        {buyerForm.formState.errors.name && (
          <p className="text-xs text-red-500">
            {buyerForm.formState.errors.name.message}
          </p>
        )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
          {...buyerForm.register("email")}
                />
        {buyerForm.formState.errors.email && (
          <p className="text-xs text-red-500">
            {buyerForm.formState.errors.email.message}
          </p>
        )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          {...buyerForm.register("password")}
        />
        {buyerForm.formState.errors.password && (
          <p className="text-xs text-red-500">
            {buyerForm.formState.errors.password.message}
          </p>
        )}
        <PasswordStrengthIndicator password={buyerForm.watch("password") || ""} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
        <Input
          id="confirm-password"
          type="password"
          {...buyerForm.register("confirmPassword")}
        />
        {buyerForm.formState.errors.confirmPassword && (
          <p className="text-xs text-red-500">
            {buyerForm.formState.errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-2 mt-4">
        <Checkbox
          id="terms"
          onCheckedChange={(checked) =>
            buyerForm.setValue("agreeToTerms", checked as boolean)
          }
        />
        <Label htmlFor="terms" className="text-sm font-normal">
          I agree to the{" "}
          <Link href="/terms" className="text-primary underline hover:opacity-80">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary underline hover:opacity-80">
            Privacy Policy
          </Link>
        </Label>
              </div>
      {buyerForm.formState.errors.agreeToTerms && (
        <p className="text-xs text-red-500">
          {buyerForm.formState.errors.agreeToTerms.message}
        </p>
      )}

      <div className="flex justify-between mt-6">
        <Button type="button" variant="outline" onClick={goBack}>
          Back
        </Button>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </div>
    </form>
  );

  const renderSellerStep1 = () => (
    <form
      onSubmit={sellerAccountForm.handleSubmit(handleSellerStepSubmit)}
      className="space-y-4"
    >
      <div className="grid gap-2">
        <Label htmlFor="seller-name">Full Name</Label>
        <Input
          id="seller-name"
          placeholder="John Doe"
          {...sellerAccountForm.register("name")}
        />
        {sellerAccountForm.formState.errors.name && (
          <p className="text-xs text-red-500">
            {sellerAccountForm.formState.errors.name.message}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="seller-email">Email</Label>
        <Input
          id="seller-email"
          type="email"
          placeholder="your@email.com"
          {...sellerAccountForm.register("email")}
        />
        {sellerAccountForm.formState.errors.email && (
          <p className="text-xs text-red-500">
            {sellerAccountForm.formState.errors.email.message}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="seller-password">Password</Label>
        <Input
          id="seller-password"
          type="password"
          {...sellerAccountForm.register("password")}
        />
        {sellerAccountForm.formState.errors.password && (
          <p className="text-xs text-red-500">
            {sellerAccountForm.formState.errors.password.message}
          </p>
        )}
        <PasswordStrengthIndicator
          password={sellerAccountForm.watch("password") || ""}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="seller-confirm-password">Confirm Password</Label>
        <Input
          id="seller-confirm-password"
          type="password"
          {...sellerAccountForm.register("confirmPassword")}
        />
        {sellerAccountForm.formState.errors.confirmPassword && (
          <p className="text-xs text-red-500">
            {sellerAccountForm.formState.errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div className="flex justify-between mt-6">
        <Button type="button" variant="outline" onClick={goBack}>
          Back
        </Button>
        <Button type="submit">Continue</Button>
      </div>
    </form>
  );

  const renderSellerStep2 = () => (
    <form
      onSubmit={storeInfoForm.handleSubmit(handleSellerStepSubmit)}
      className="space-y-4"
    >
      <div className="grid gap-2">
        <Label htmlFor="store-name">Store Name</Label>
        <Input
          id="store-name"
          placeholder="My Awesome Cap Store"
          {...storeInfoForm.register("storeName")}
        />
        {storeInfoForm.formState.errors.storeName && (
          <p className="text-xs text-red-500">
            {storeInfoForm.formState.errors.storeName.message}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="store-description">Store Description</Label>
        <Textarea
          id="store-description"
          rows={3}
          placeholder="Tell customers about your store..."
          {...storeInfoForm.register("storeDescription")}
        />
        {storeInfoForm.formState.errors.storeDescription && (
          <p className="text-xs text-red-500">
            {storeInfoForm.formState.errors.storeDescription.message}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="store-website">Website (Optional)</Label>
        <Input
          id="store-website"
          type="url"
          placeholder="https://mystore.com"
          {...storeInfoForm.register("storeWebsite")}
        />
        {storeInfoForm.formState.errors.storeWebsite && (
          <p className="text-xs text-red-500">
            {storeInfoForm.formState.errors.storeWebsite.message}
          </p>
        )}
      </div>

      <div className="flex justify-between mt-6">
        <Button type="button" variant="outline" onClick={goBack}>
          Back
        </Button>
        <Button type="submit">Continue</Button>
      </div>
    </form>
  );

  const renderSellerStep3 = () => (
    <form
      onSubmit={locationForm.handleSubmit(handleSellerStepSubmit)}
      className="space-y-4"
    >
      <div className="grid md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="business-type">Business Type</Label>
          <select
            id="business-type"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            {...locationForm.register("businessType")}
          >
            <option value="">Select Business Type</option>
            <option value="sole-proprietor">Sole Proprietor</option>
            <option value="llc">LLC</option>
            <option value="corporation">Corporation</option>
            <option value="partnership">Partnership</option>
          </select>
          {locationForm.formState.errors.businessType && (
            <p className="text-xs text-red-500">
              {locationForm.formState.errors.businessType.message}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="tax-id">Tax ID (Optional)</Label>
          <Input
            id="tax-id"
            placeholder="12-3456789"
            {...locationForm.register("taxId")}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="business-address">Business Address</Label>
        <Input
          id="business-address"
          placeholder="123 Main St"
          {...locationForm.register("businessAddress")}
        />
        {locationForm.formState.errors.businessAddress && (
          <p className="text-xs text-red-500">
            {locationForm.formState.errors.businessAddress.message}
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" {...locationForm.register("city")} />
          {locationForm.formState.errors.city && (
            <p className="text-xs text-red-500">
              {locationForm.formState.errors.city.message}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="state">State/Province</Label>
          <Input id="state" {...locationForm.register("state")} />
          {locationForm.formState.errors.state && (
            <p className="text-xs text-red-500">
              {locationForm.formState.errors.state.message}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="zip">ZIP/Postal Code</Label>
          <Input id="zip" {...locationForm.register("zip")} />
          {locationForm.formState.errors.zip && (
            <p className="text-xs text-red-500">
              {locationForm.formState.errors.zip.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <Button type="button" variant="outline" onClick={goBack}>
          Back
        </Button>
        <Button type="submit">Continue</Button>
      </div>
    </form>
  );

  const renderSellerStep4 = () => (
    <form
      onSubmit={verificationForm.handleSubmit(handleSellerStepSubmit)}
      className="space-y-4"
    >
      <div className="grid gap-2">
        <Label>Upload Business License or ID</Label>
        <FileUpload
          onFileSelect={(file) => {
            verificationForm.setValue("documentFile", file || undefined);
          }}
          onUploadComplete={(url) => {
            verificationForm.setValue("documentUrl", url);
          }}
          error={
            verificationForm.formState.errors.documentFile?.message ||
            verificationForm.formState.errors.documentUrl?.message
          }
        />
      </div>

      <div className="flex items-center space-x-2 mt-4">
        <Checkbox id="seller-terms" required />
        <Label htmlFor="seller-terms" className="text-sm font-normal">
          I agree to the{" "}
          <Link href="/terms" className="text-primary underline hover:opacity-80">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary underline hover:opacity-80">
            Privacy Policy
          </Link>
        </Label>
      </div>

      <div className="flex justify-between mt-6">
        <Button type="button" variant="outline" onClick={goBack}>
          Back
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </div>
    </form>
  );

  const renderStepContent = () => {
    if (!accountType) return renderAccountTypeSelection();

    if (accountType === "buyer") return renderBuyerForm();

    // Seller multi-step form
    if (step === 1) return renderSellerStep1();
    if (step === 2) return renderSellerStep2();
    if (step === 3) return renderSellerStep3();
    if (step === 4) return renderSellerStep4();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow py-16 md:py-24">
        <div className="container max-w-md mx-auto px-4">
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
              <CardTitle>Create your account</CardTitle>
              <CardDescription>
                {accountType === "seller"
                  ? "Join the Secret Caps Society as a verified seller."
                  : accountType === "buyer"
                  ? "Join the Secret Caps Society as a buyer."
                  : "Join the Secret Caps Society community today."}
              </CardDescription>

              {accountType === "seller" && (
                <div className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">
                      Step {step} of {totalSteps}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {Math.round((step / totalSteps) * 100)}% Complete
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${(step / totalSteps) * 100}%` }}
                    />
                  </div>
                  </div>
                )}
            </CardHeader>
            <CardContent>{renderStepContent()}</CardContent>
            {accountType && (
              <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-primary underline hover:opacity-80"
                  >
                    Log in
                  </Link>
                </p>
              </CardFooter>
            )}
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
              Browse Stores
            </Button>
            <Button className="sm:flex-1" onClick={handleAddProduct}>
              Explore Products
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
