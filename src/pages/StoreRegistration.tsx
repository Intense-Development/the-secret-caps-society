import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Store } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StepIndicator from "@/components/store-registration/StepIndicator";
import StoreInfoForm from "@/components/store-registration/StoreInfoForm";
import LocationAndDetailsForm from "@/components/store-registration/LocationAndDetailsForm";
import VerificationForm from "@/components/store-registration/VerificationForm";
import SuccessModal from "@/components/store-registration/SuccessModal";

const StoreRegistration = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const totalSteps = 3;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    } else {
      setIsLoading(true);

      // Simulate registration
      setTimeout(() => {
        setIsLoading(false);
        setShowSuccessModal(true);
      }, 2000);
    }
  };

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/dashboard/stores");
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <StoreInfoForm />;
      case 2:
        return <LocationAndDetailsForm />;
      case 3:
        return <VerificationForm />;
      default:
        return <StoreInfoForm />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow py-16 md:py-24">
        <div className="container max-w-xl mx-auto px-4">
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
              <div className="flex items-center mb-2">
                <Store className="h-5 w-5 mr-2" />
                <CardTitle>Register Your Store</CardTitle>
              </div>
              <CardDescription>
                Join our marketplace as a verified cap reseller.
              </CardDescription>

              <StepIndicator currentStep={step} totalSteps={totalSteps} />
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {renderStepContent()}

                <div className="flex justify-between mt-8">
                  {step > 1 ? (
                    <Button type="button" variant="outline" onClick={goBack}>
                      Back
                    </Button>
                  ) : (
                    <div></div>
                  )}

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <span className="mr-2">Submitting</span>
                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      </>
                    ) : step < totalSteps ? (
                      "Continue"
                    ) : (
                      "Submit Application"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>

            <CardFooter className="flex justify-center">
              <p className="text-sm text-muted-foreground">
                Already have a store?{" "}
                <Link
                  to="/login"
                  className="text-primary underline hover:opacity-80"
                >
                  Log in
                </Link>
              </p>
            </CardFooter>
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

export default StoreRegistration;
