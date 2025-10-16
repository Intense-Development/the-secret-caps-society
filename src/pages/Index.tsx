import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ShoppingBag,
  Store,
  Shield,
  CreditCard,
} from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <Hero />

        <FeaturedProducts />

        {/* How it works section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <AnimatedSection animation="slide-up">
              <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  How It Works
                </h2>
                <p className="text-muted-foreground">
                  Join the exclusive marketplace for cap resellers in just a few
                  simple steps.
                </p>
              </div>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <AnimatedSection
                animation="slide-up"
                delay={100}
                className="text-center"
              >
                <div className="rounded-full bg-secondary/60 w-16 h-16 flex items-center justify-center mx-auto mb-5">
                  <Store className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Register Your Store
                </h3>
                <p className="text-muted-foreground mb-4">
                  Create your account and set up your store profile with
                  verification.
                </p>
                <Link to="/register">
                  <Button variant="outline" className="group text-sm">
                    Create Account
                    <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </AnimatedSection>

              <AnimatedSection
                animation="slide-up"
                delay={200}
                className="text-center"
              >
                <div className="rounded-full bg-secondary/60 w-16 h-16 flex items-center justify-center mx-auto mb-5">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  List Your Products
                </h3>
                <p className="text-muted-foreground mb-4">
                  Add your premium caps with high-quality photos and
                  descriptions.
                </p>
                <Button variant="outline" className="group text-sm" disabled>
                  Coming Soon
                </Button>
              </AnimatedSection>

              <AnimatedSection
                animation="slide-up"
                delay={300}
                className="text-center"
              >
                <div className="rounded-full bg-secondary/60 w-16 h-16 flex items-center justify-center mx-auto mb-5">
                  <CreditCard className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Start Selling</h3>
                <p className="text-muted-foreground mb-4">
                  Connect with buyers and grow your business with our secure
                  platform.
                </p>
                <Button variant="outline" className="group text-sm" disabled>
                  Coming Soon
                </Button>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <AnimatedSection animation="slide-up">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Ready to Join the Secret Caps Society?
                </h2>
                <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Register your store today and become part of our exclusive network of verified cap resellers.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/register">
                    <Button size="lg">Create Account</Button>
                  </Link>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
