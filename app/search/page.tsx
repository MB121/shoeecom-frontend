"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, X } from "lucide-react";
import { ProductGrid } from "@/components/product-grid";
import { mockProducts } from "@/lib/mock-data";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<{
    category: string[];
    brand: string[];
    priceRange: string[];
  }>({
    category: [],
    brand: [],
    priceRange: [],
  });

  const searchSuggestions = [
    "Nike Air Max",
    "Adidas Ultraboost",
    "Converse Chuck Taylor",
    "Running shoes",
    "Basketball shoes",
    "Casual sneakers",
    "Kids shoes",
    "White sneakers",
    "Black shoes",
  ];

  const filteredProducts = useMemo(() => {
    let results = mockProducts;

    // Filter by search query
    if (searchQuery.trim()) {
      results = results.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedFilters.category.length > 0) {
      results = results.filter((product) =>
        selectedFilters.category.includes(product.category)
      );
    }

    // Filter by brand
    if (selectedFilters.brand.length > 0) {
      results = results.filter((product) =>
        selectedFilters.brand.includes(product.brand)
      );
    }

    // Filter by price range
    if (selectedFilters.priceRange.length > 0) {
      results = results.filter((product) => {
        return selectedFilters.priceRange.some((range) => {
          switch (range) {
            case "under-50":
              return product.price < 50;
            case "50-100":
              return product.price >= 50 && product.price <= 100;
            case "100-200":
              return product.price >= 100 && product.price <= 200;
            case "over-200":
              return product.price > 200;
            default:
              return true;
          }
        });
      });
    }

    return results;
  }, [searchQuery, selectedFilters]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = searchSuggestions.filter(
        (suggestion) =>
          suggestion.toLowerCase().includes(searchQuery.toLowerCase()) &&
          suggestion.toLowerCase() !== searchQuery.toLowerCase()
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const handleFilterChange = (
    type: keyof typeof selectedFilters,
    value: string
  ) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter((item) => item !== value)
        : [...prev[type], value],
    }));
  };

  const clearFilters = () => {
    setSelectedFilters({
      category: [],
      brand: [],
      priceRange: [],
    });
  };

  const categories = [...new Set(mockProducts.map((p) => p.category))];
  const brands = [...new Set(mockProducts.map((p) => p.brand))];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold mb-4">
            Search Products
          </h1>

          {/* Search Input */}
          <div className="relative max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search for shoes, brands, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="pl-10 pr-4 py-3 text-base"
              />
            </div>

            {/* Search Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <Card className="absolute top-full left-0 right-0 mt-1 z-10">
                <CardContent className="p-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchQuery(suggestion);
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-muted rounded-md text-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filters
                  </h2>
                  {(selectedFilters.category.length > 0 ||
                    selectedFilters.brand.length > 0 ||
                    selectedFilters.priceRange.length > 0) && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear All
                    </Button>
                  )}
                </div>

                {/* Active Filters */}
                {(selectedFilters.category.length > 0 ||
                  selectedFilters.brand.length > 0 ||
                  selectedFilters.priceRange.length > 0) && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium mb-2">Active Filters</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedFilters.category.map((category) => (
                        <Badge
                          key={category}
                          variant="secondary"
                          className="text-xs"
                        >
                          {category}
                          <button
                            onClick={() =>
                              handleFilterChange("category", category)
                            }
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                      {selectedFilters.brand.map((brand) => (
                        <Badge
                          key={brand}
                          variant="secondary"
                          className="text-xs"
                        >
                          {brand}
                          <button
                            onClick={() => handleFilterChange("brand", brand)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                      {selectedFilters.priceRange.map((range) => (
                        <Badge
                          key={range}
                          variant="secondary"
                          className="text-xs"
                        >
                          {range === "under-500"
                            ? "Under ₹500"
                            : range === "500-1000"
                            ? "₹500-₹1000"
                            : range === "1000-2000"
                            ? "₹1000-₹2000"
                            : "Over ₹2000"}
                          <button
                            onClick={() =>
                              handleFilterChange("priceRange", range)
                            }
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category Filter */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Category</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label
                        key={category}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFilters.category.includes(category)}
                          onChange={() =>
                            handleFilterChange("category", category)
                          }
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Brand Filter */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Brand</h3>
                  <div className="space-y-2">
                    {brands.map((brand) => (
                      <label
                        key={brand}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFilters.brand.includes(brand)}
                          onChange={() => handleFilterChange("brand", brand)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div>
                  <h3 className="font-medium mb-3">Price Range</h3>
                  <div className="space-y-2">
                    {[
                      { value: "under-500", label: "Under ₹500" },
                      { value: "500-1000", label: "₹500 - ₹1000" },
                      { value: "1000-2000", label: "₹1000 - ₹2000" },
                      { value: "over-2000", label: "Over ₹2000" },
                    ].map((range) => (
                      <label
                        key={range.value}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFilters.priceRange.includes(
                            range.value
                          )}
                          onChange={() =>
                            handleFilterChange("priceRange", range.value)
                          }
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search Results */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-muted-foreground">
                  {filteredProducts.length} product
                  {filteredProducts.length !== 1 ? "s" : ""} found
                  {searchQuery && ` for "${searchQuery}"`}
                </p>
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <ProductGrid products={filteredProducts} />
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No products found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search terms or filters
                  </p>
                  <Button onClick={clearFilters}>Clear Filters</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
