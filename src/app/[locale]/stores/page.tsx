"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StoreCard from "@/components/StoreCard";

const Stores = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - would come from a backend in a real application
  const stores = [
    {
      id: 1,
      name: "CapCity Store",
      owner: "Jane Smith",
      products: 45,
      verified: true,
      location: "New York, NY",
      photo:
        "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=500&h=350&fit=crop",
    },
    {
      id: 2,
      name: "East Coast Caps",
      owner: "Michael Wilson",
      products: 32,
      verified: true,
      location: "Boston, MA",
      photo:
        "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=500&h=350&fit=crop",
    },
    {
      id: 3,
      name: "West Side Hats",
      owner: "Robert Brown",
      products: 18,
      verified: false,
      location: "Los Angeles, CA",
      photo:
        "https://images.unsplash.com/photo-1496307653780-42ee777d4833?w=500&h=350&fit=crop",
    },
    {
      id: 4,
      name: "South Cap Depot",
      owner: "Amanda Lee",
      products: 27,
      verified: true,
      location: "Miami, FL",
      photo:
        "https://images.unsplash.com/photo-1431576901776-e539bd916ba2?w=500&h=350&fit=crop",
    },
    {
      id: 5,
      name: "Midwest Cap Collection",
      owner: "David Miller",
      products: 15,
      verified: false,
      location: "Chicago, IL",
      photo:
        "https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?w=500&h=350&fit=crop",
    },
  ];

  const filteredStores = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Explore Stores</h1>
              <p className="text-muted-foreground">
                Discover verified cap resellers
              </p>
            </div>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Find Stores</CardTitle>
              <CardDescription>
                Browse our network of verified cap resellers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by store name, owner, or location..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {filteredStores.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredStores.map((store) => (
                <StoreCard key={store.id} {...store} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No stores found matching your search criteria.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Stores;

