
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

const LocationAndDetailsForm = () => {
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="location">Location</Label>
        <Input id="location" placeholder="City, Country" required />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="website">Website (optional)</Label>
        <Input id="website" placeholder="https://your-website.com" />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" placeholder="+1 234 567 8900" required />
      </div>
      
      <div className="grid gap-2">
        <Label>Store Logo</Label>
        <div className="border border-dashed border-input rounded-md p-6 flex flex-col items-center justify-center bg-secondary/30">
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-center text-muted-foreground mb-2">
            Drag and drop or click to upload
          </p>
          <p className="text-xs text-center text-muted-foreground">
            PNG, JPG or SVG (max 2MB)
          </p>
          <Input 
            id="logo" 
            type="file" 
            className="hidden" 
            accept="image/*"
          />
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            className="mt-4"
            onClick={() => document.getElementById('logo')?.click()}
          >
            Select File
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LocationAndDetailsForm;
