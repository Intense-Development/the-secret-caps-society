import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="font-sans flex flex-col min-h-screen">
      {/* Hero */}
      <section className="px-6 sm:px-8 md:px-12 lg:px-20 xl:px-28 2xl:px-40 pt-16 sm:pt-20 pb-10 sm:pb-14">
        <div className="mx-auto max-w-6xl text-center flex flex-col items-center gap-6">
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
            Featured: Cap Marketplace
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight max-w-3xl">
            The Premium Marketplace for Cap Resellers
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
            Join the exclusive network of authenticated resellers and list your products for free. Connect with new customers and grow your revenue.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild>
              <Link href="/auth">Sign Up</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="#featured">Browse Products</Link>
            </Button>
          </div>
          <div className="mt-6 w-full max-w-3xl">
            <div className="relative mx-auto aspect-square w-full max-w-xl rounded-xl overflow-hidden border">
              <Image
                src="/caps-hero.png"
                alt="Secret Caps Society Hero"
                fill
                priority
                sizes="(max-width: 768px) 90vw, (max-width: 1200px) 60vw, 600px"
                className="object-cover"
              />
            </div>
            <div className="mt-3 flex justify-center">
              <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">Trending • Best Sellers</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="featured" className="px-6 sm:px-8 md:px-12 lg:px-20 xl:px-28 2xl:px-40 py-12 sm:py-16 bg-muted/30">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-semibold">Featured Products</h2>
            <Button asChild variant="ghost" className="h-8 px-2 text-xs sm:text-sm">
              <Link href="/search">View all →</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                id: 1,
                title: "Classic Trucker Cap",
                price: "$29.99",
                img: "/products/trucker.png",
                meta: "Low stock",
              },
              {
                id: 2,
                title: "Ur Design - Fitted",
                price: "$34.99",
                img: "/products/fitted.png",
                meta: "New arrival",
              },
              {
                id: 3,
                title: "Chicago Crest Limited Edition",
                price: "$49.99",
                img: "/products/limited.png",
                meta: "Just in",
              },
            ].map((p) => (
              <Card key={p.id} className="overflow-hidden">
                <CardHeader className="p-0">
                  <div className="relative aspect-[4/3] w-full bg-muted">
                    <Image
                      src={p.img}
                      alt={p.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <CardTitle className="text-base sm:text-lg">{p.title}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">{p.meta}</p>
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                  <span className="font-medium">{p.price}</span>
                  <Button size="sm" variant="secondary">Add to cart</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 sm:px-8 md:px-12 lg:px-20 xl:px-28 2xl:px-40 py-14 sm:py-16">
        <div className="mx-auto max-w-6xl text-center">
          <h3 className="text-xl sm:text-2xl font-semibold mb-8">How It Works</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left sm:text-center">
            {[
              {
                title: "Register Your Store",
                desc: "Create your store profile and verify your details with our team.",
                cta: "Create store",
              },
              {
                title: "List Your Products",
                desc: "Add and manage your products. Set pricing and availability.",
                cta: "Start listing",
              },
              {
                title: "Start Selling",
                desc: "Connect with customers and grow your brand with our marketplace.",
                cta: "Grow sales",
              },
            ].map((s, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="mx-auto sm:mx-0 mb-3 h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                    {i + 1}
                  </div>
                  <h4 className="font-medium mb-1">{s.title}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{s.desc}</p>
                  <Button size="sm" variant="outline">{s.cta}</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-6 sm:px-8 md:px-12 lg:px-20 xl:px-28 2xl:px-40 py-14 sm:py-16 bg-muted/30">
        <div className="mx-auto max-w-6xl text-center">
          <h3 className="text-xl sm:text-2xl font-semibold mb-3">Ready to Join the Secret Caps Society?</h3>
          <p className="text-sm text-muted-foreground mb-5">
            Promote your store, boost sales, and connect with a network of cap enthusiasts.
          </p>
          <Button asChild>
            <Link href="/auth">Create Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto px-6 sm:px-8 md:px-12 lg:px-20 xl:px-28 2xl:px-40 py-10 border-t bg-background">
        <div className="mx-auto max-w-6xl grid grid-cols-1 sm:grid-cols-4 gap-8 text-sm">
          <div>
            <h4 className="font-semibold mb-2">SECRET CAPS SOCIETY</h4>
            <p className="text-muted-foreground">Exclusive network for cap resellers and verified retailers.</p>
          </div>
          <div>
            <h5 className="font-medium mb-2">Quick Links</h5>
            <ul className="space-y-1 text-muted-foreground">
              <li><Link href="/" className="hover:underline">Home</Link></li>
              <li><Link href="/search" className="hover:underline">Products</Link></li>
              <li><Link href="/auth" className="hover:underline">Sign In</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium mb-2">Legal</h5>
            <ul className="space-y-1 text-muted-foreground">
              <li><Link href="/terms" className="hover:underline">Terms of Use</Link></li>
              <li><Link href="/privacy" className="hover:underline">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium mb-2">Stay Updated</h5>
            <p className="text-muted-foreground mb-3">Get the latest drops and featured stores.</p>
            <Button variant="secondary" asChild>
              <Link href="#">Subscribe</Link>
            </Button>
          </div>
        </div>
        <div className="mx-auto max-w-6xl text-xs text-muted-foreground mt-6"> {new Date().getFullYear()} Secret Caps Society. All rights reserved.</div>
      </footer>
    </div>
  );
}
