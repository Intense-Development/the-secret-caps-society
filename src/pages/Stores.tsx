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
import { useQuery } from "@tanstack/react-query";
import { StoreRepository } from "@/domain/stores/repositories/storeRepository";
import StoreCard from "@/components/StoreCard";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const Stores = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const storesPerPage = 8;

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ["stores"],
    queryFn: StoreRepository.getAllStores,
  });

  const filteredStores = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate pagination values
  const totalPages = Math.ceil(filteredStores.length / storesPerPage);
  const indexOfLastStore = currentPage * storesPerPage;
  const indexOfFirstStore = indexOfLastStore - storesPerPage;
  const currentStores = filteredStores.slice(
    indexOfFirstStore,
    indexOfLastStore
  );

  // Generate array of page numbers to display
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  // Handle page changes
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

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
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); // Reset to first page on search
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {currentStores.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {currentStores.map((store) => (
                      <StoreCard key={store.id} {...store} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-12">
                      <Pagination>
                        <PaginationContent>
                          {currentPage > 1 && (
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={() =>
                                  handlePageChange(currentPage - 1)
                                }
                                className="cursor-pointer"
                              />
                            </PaginationItem>
                          )}

                          {pageNumbers.map((number) => {
                            // Show first page, last page, current page, and pages adjacent to current page
                            if (
                              number === 1 ||
                              number === totalPages ||
                              (number >= currentPage - 1 &&
                                number <= currentPage + 1)
                            ) {
                              return (
                                <PaginationItem key={number}>
                                  <PaginationLink
                                    isActive={currentPage === number}
                                    onClick={() => handlePageChange(number)}
                                    className="cursor-pointer"
                                  >
                                    {number}
                                  </PaginationLink>
                                </PaginationItem>
                              );
                            }
                            // Show ellipsis for skipped pages
                            else if (
                              (number === 2 && currentPage > 3) ||
                              (number === totalPages - 1 &&
                                currentPage < totalPages - 2)
                            ) {
                              return (
                                <PaginationItem key={number}>
                                  <PaginationEllipsis />
                                </PaginationItem>
                              );
                            }
                            return null;
                          })}

                          {currentPage < totalPages && (
                            <PaginationItem>
                              <PaginationNext
                                onClick={() =>
                                  handlePageChange(currentPage + 1)
                                }
                                className="cursor-pointer"
                              />
                            </PaginationItem>
                          )}
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No stores found matching your search criteria.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Stores;
