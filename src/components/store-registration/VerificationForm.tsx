import React from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";

const VerificationForm = () => {
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="verification-type">Verification Type</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
          <div className="border rounded-md p-4 cursor-pointer bg-secondary/30 hover:bg-secondary transition-colors">
            <Checkbox id="business" className="mb-2" />
            <Label htmlFor="business" className="font-medium block mb-1">
              Business
            </Label>
            <p className="text-xs text-muted-foreground">
              For registered businesses with documentation
            </p>
          </div>
          <div className="border rounded-md p-4 cursor-pointer bg-secondary/30 hover:bg-secondary transition-colors">
            <Checkbox id="individual" className="mb-2" />
            <Label htmlFor="individual" className="font-medium block mb-1">
              Individual
            </Label>
            <p className="text-xs text-muted-foreground">
              For individual sellers without formal registration
            </p>
          </div>
        </div>
      </div>

      <div className="border rounded-md p-4 bg-secondary/20">
        <h4 className="text-sm font-medium mb-2">
          Requirements for Verification:
        </h4>
        <ul className="text-sm text-muted-foreground space-y-1.5">
          <li>• Valid ID or business documentation</li>
          <li>• Proof of authentic products</li>
          <li>• Clear product photos and descriptions</li>
          <li>• Secure payment processing</li>
        </ul>
      </div>

      <div className="flex items-start space-x-2 mt-4">
        <Checkbox id="terms" className="mt-1" required />
        <Label htmlFor="terms" className="text-sm font-normal">
          I certify that all information provided is accurate and that I sell
          authentic products. I agree to the{" "}
          <Link to="/terms" className="text-primary underline hover:opacity-80">
            Seller Terms
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
    </div>
  );
};

export default VerificationForm;
