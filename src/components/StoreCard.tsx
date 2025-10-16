"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Store as StoreIcon, MapPin } from "lucide-react";
import { Store } from "@/core/types";
import Link from "next/link";

interface StoreCardProps extends Store {}

const StoreCard = ({
  id,
  name,
  owner,
  products,
  verified,
  location,
  photo,
}: StoreCardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className="group overflow-hidden transition-all duration-300 border-border/40 hover:shadow-md h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-video overflow-hidden">
        {/* Image loading skeleton */}
        {isLoading && (
          <div className="absolute inset-0 bg-secondary flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        )}

        {/* Store image */}
        {photo ? (
          <img
            src={photo}
            alt={name}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isHovered ? "scale-105" : "scale-100"
            }`}
            onLoad={() => setIsLoading(false)}
            style={{ display: isLoading ? "none" : "block" }}
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <StoreIcon className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* Verification badge */}
        <div className="absolute top-3 left-3">
          {verified ? (
            <Badge
              variant="default"
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-3 w-3 mr-1" /> Verified
            </Badge>
          ) : (
            <Badge
              variant="secondary"
              className="bg-yellow-500 text-black hover:bg-yellow-600"
            >
              <X className="h-3 w-3 mr-1" /> Pending
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-5">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{name}</h3>
        <div className="text-sm text-muted-foreground mb-2">Owner: {owner}</div>

        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <MapPin className="h-3.5 w-3.5 mr-1" />
          <span className="line-clamp-1">{location}</span>
        </div>

        <div className="flex items-center justify-between">
          <Badge variant="outline" className="bg-muted/50">
            {products} Products
          </Badge>

          <Link href={`/products?store=${id}`}>
            <Button variant="outline" size="sm">
              View Products
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default StoreCard;
