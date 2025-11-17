
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const StoreInfoForm = () => {
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="store-name">Store Name</Label>
        <Input id="store-name" placeholder="Your Caps Store" required />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="store-url">Store URL (username)</Label>
        <div className="flex">
          <span className="inline-flex items-center px-3 bg-secondary border border-r-0 border-input rounded-l-md text-sm text-muted-foreground">
            secretcaps.com/
          </span>
          <Input 
            id="store-url" 
            placeholder="yourcapsstore" 
            className="rounded-l-none" 
            required 
          />
        </div>
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="store-description">Store Description</Label>
        <Textarea 
          id="store-description" 
          placeholder="Tell us about your store and the products you sell..."
          className="resize-none"
          rows={4}
          required
        />
      </div>
    </div>
  );
};

export default StoreInfoForm;
