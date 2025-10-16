"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import AnimatedSection from "./AnimatedSection";
import { ArrowRight } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative pt-20 pb-16 lg:pt-40 lg:pb-24 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 -z-10 opacity-[0.02]">
        <svg
          className="absolute inset-0 h-full w-full stroke-gray-900/10"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="pattern-illusion"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
              patternTransform="scale(0.5) rotate(0)"
            >
              <path
                d="m 0 4 l 100 0"
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.4"
              />
              <path
                d="m 0 28 l 100 0"
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.4"
              />
              <path
                d="m 0 52 l 100 0"
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.4"
              />
              <path
                d="m 0 76 l 100 0"
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.4"
              />
              <path
                d="m 4 0 l 0 100"
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.4"
              />
              <path
                d="m 28 0 l 0 100"
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.4"
              />
              <path
                d="m 52 0 l 0 100"
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.4"
              />
              <path
                d="m 76 0 l 0 100"
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.4"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pattern-illusion)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-[85rem] mx-auto text-center">
          <AnimatedSection animation="fade-in">
            <p className="inline-block text-sm font-medium bg-secondary/50 px-3 py-1 rounded-full mb-6">
              Exclusive Cap Marketplace
            </p>
          </AnimatedSection>

          <AnimatedSection animation="slide-up" delay={100}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 max-w-4xl mx-auto text-balance">
              The Premium Marketplace for Cap Resellers
            </h1>
          </AnimatedSection>

          <AnimatedSection animation="slide-up" delay={200}>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 text-balance">
              Join the exclusive network of authenticated resellers and list
              your products for free. Connect with cap enthusiasts and grow your
              business.
            </p>
          </AnimatedSection>

          <AnimatedSection animation="slide-up" delay={300}>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto px-8">
                  Sign Up <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/products">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-8"
                >
                  Browse Products
                </Button>
              </Link>
            </div>
          </AnimatedSection>

          <AnimatedSection
            animation="fade-in"
            delay={500}
            className="mt-16 md:mt-24"
          >
            <div className="relative w-full max-w-3xl mx-auto">
              {/* Product image */}
              <div className="rounded-xl overflow-hidden shadow-xl neo-blur bg-white/30 border border-black/5">
                <img
                  src="/uploads/8200568e-2c5b-4d28-be98-fc09e3034176.png"
                  alt="The Secret Caps Society"
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 bg-white shadow-soft py-2 px-4 rounded-full text-sm font-medium flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                <span>Trusted by 500+ resellers</span>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default Hero;
