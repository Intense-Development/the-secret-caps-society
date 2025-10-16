"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ProductsFiltersProps {
  priceRange: number[];
  setPriceRange: (value: number[]) => void;
  isFilterOpen: boolean;
  toggleFilters: () => void;
  onApplyFilters: () => void;
}

export const ProductsFilters = ({
  priceRange,
  setPriceRange,
  isFilterOpen,
  toggleFilters,
  onApplyFilters,
}: ProductsFiltersProps) => {
  // Local state to store temporary filter values before applying
  const [tempPriceRange, setTempPriceRange] = useState(priceRange);

  // Update the local state when props change
  useEffect(() => {
    setTempPriceRange(priceRange);
  }, [priceRange]);

  // Handle applying filters and closing the mobile filter drawer if open
  const handleApplyFilters = () => {
    setPriceRange(tempPriceRange);
    onApplyFilters();
    if (isFilterOpen) {
      toggleFilters();
    }
  };

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-24">
          <h3 className="font-semibold mb-4">Filters</h3>

          <Accordion type="single" collapsible defaultValue="category">
            <AccordionItem value="category">
              <AccordionTrigger>Category</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Checkbox id="fitted" />
                    <Label
                      htmlFor="fitted"
                      className="ml-2 text-sm font-normal"
                    >
                      Fitted Caps
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox id="snapback" />
                    <Label
                      htmlFor="snapback"
                      className="ml-2 text-sm font-normal"
                    >
                      Snapback
                    </Label>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="team">
              <AccordionTrigger>Team</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Checkbox id="yankees" />
                    <Label
                      htmlFor="yankees"
                      className="ml-2 text-sm font-normal"
                    >
                      New York Yankees
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox id="dodgers" />
                    <Label
                      htmlFor="dodgers"
                      className="ml-2 text-sm font-normal"
                    >
                      LA Dodgers
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox id="bulls" />
                    <Label htmlFor="bulls" className="ml-2 text-sm font-normal">
                      Chicago Bulls
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox id="red-sox" />
                    <Label
                      htmlFor="red-sox"
                      className="ml-2 text-sm font-normal"
                    >
                      Boston Red Sox
                    </Label>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="price">
              <AccordionTrigger>Price Range</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <Slider
                    defaultValue={[20, 60]}
                    max={100}
                    step={1}
                    value={tempPriceRange}
                    onValueChange={setTempPriceRange}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm">${tempPriceRange[0]}</span>
                    <span className="text-sm">${tempPriceRange[1]}</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Button className="w-full mt-6" onClick={handleApplyFilters}>
            Apply Filters
          </Button>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={toggleFilters}
          ></div>
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-auto bg-background rounded-t-xl p-4 shadow-lg transform transition-transform">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-semibold">Filters</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={toggleFilters}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <Accordion type="single" collapsible defaultValue="category">
              <AccordionItem value="category">
                <AccordionTrigger>Category</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Checkbox id="mobile-fitted" />
                      <Label
                        htmlFor="mobile-fitted"
                        className="ml-2 text-sm font-normal"
                      >
                        Fitted Caps
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox id="mobile-snapback" />
                      <Label
                        htmlFor="mobile-snapback"
                        className="ml-2 text-sm font-normal"
                      >
                        Snapback
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox id="mobile-trucker" />
                      <Label
                        htmlFor="mobile-trucker"
                        className="ml-2 text-sm font-normal"
                      >
                        Trucker
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox id="mobile-dad-hat" />
                      <Label
                        htmlFor="mobile-dad-hat"
                        className="ml-2 text-sm font-normal"
                      >
                        Dad Hat
                      </Label>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="price">
                <AccordionTrigger>Price Range</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <Slider
                      defaultValue={[20, 60]}
                      max={100}
                      step={1}
                      value={tempPriceRange}
                      onValueChange={setTempPriceRange}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-sm">${tempPriceRange[0]}</span>
                      <span className="text-sm">${tempPriceRange[1]}</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={toggleFilters}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleApplyFilters}>
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductsFilters;
