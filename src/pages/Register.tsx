import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { ArrowLeft, User, Store } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SuccessModal from "@/components/store-registration/SuccessModal";
import StoreInfoForm from "@/components/store-registration/StoreInfoForm";
import LocationAndDetailsForm from "@/components/store-registration/LocationAndDetailsForm";
import VerificationForm from "@/components/store-registration/VerificationForm";
import StepIndicator from "@/components/store-registration/StepIndicator";

const Register = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [accountType, setAccountType] = useState<"buyer" | "seller" | null>(
    null
  );
  const [step, setStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const totalSteps = accountType === "seller" ? 4 : 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (accountType === "seller" && step < totalSteps) {
      setStep(step + 1);
      window.scrollTo(0, 0);
      return;
    }

    setIsLoading(true);

    // Simulate registration
    setTimeout(() => {
      setIsLoading(false);
      if (accountType === "seller") {
        setShowSuccessModal(true);
      } else {
        toast({
          title: "Account created successfully",
          description: "Welcome to the Secret Caps Society!",
        });
        navigate("/");
      }
    }, 1500);
  };

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      setAccountType(null);
    }
    window.scrollTo(0, 0);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/dashboard/stores");
  };

  const renderStepContent = () => {
    // If account type not selected yet, show the selection
    if (!accountType) {
      return (
        <div className="space-y-4">
          <h3 className="text-base font-medium text-center mb-4">
            Choose account type
          </h3>
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
              <p className="text-sm text-muted-foreground">
                Create a store and sell caps
              </p>
            </div>
          </div>
        </div>
      );
    }

    // For seller account, show step-based forms
    if (accountType === "seller") {
      switch (step) {
        case 1:
          return (
            <>
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input id="confirm-password" type="password" required />
              </div>
            </>
          );
        case 2:
          return <StoreInfoForm />;
        case 3:
          return <LocationAndDetailsForm />;
        case 4:
          return <VerificationForm />;
        default:
          return null;
      }
    }

    // For buyer account, show standard registration form
    return (
      <>
        <div className="grid gap-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" placeholder="John Doe" required />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input id="confirm-password" type="password" required />
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow py-16 md:py-24">
        <div className="container max-w-md mx-auto px-4">
          <div className="mb-8">
            <Link
              to="/"
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

              {accountType && accountType === "seller" && step > 1 && (
                <StepIndicator
                  currentStep={step - 1}
                  totalSteps={totalSteps - 1}
                />
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {renderStepContent()}

                {accountType && (
                  <div className="flex items-center space-x-2 mt-4">
                    <Checkbox id="terms" required />
                    <Label htmlFor="terms" className="text-sm font-normal">
                      I agree to the{" "}
                      <Link
                        to="/terms"
                        className="text-primary underline hover:opacity-80"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        to="/privacy"
                        className="text-primary underline hover:opacity-80"
                      >
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>
                )}

                {accountType && (
                  <div className="flex justify-between mt-6">
                    <Button type="button" variant="outline" onClick={goBack}>
                      Back
                    </Button>

                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <span className="mr-2">Creating account</span>
                          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        </>
                      ) : accountType === "seller" && step < totalSteps ? (
                        "Continue"
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </div>
                )}

                {!accountType && (
                  <div className="text-center mt-6 text-sm text-muted-foreground">
                    <p>
                      Already have an account?{" "}
                      <Link
                        to="/login"
                        className="text-primary underline hover:opacity-80"
                      >
                        Log in
                      </Link>
                    </p>
                  </div>
                )}
              </form>
            </CardContent>
            {accountType && (
              <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    to="/login"
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

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccessModal}
      />
    </div>
  );
};

export default Register;
