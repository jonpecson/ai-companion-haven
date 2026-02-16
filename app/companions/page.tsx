"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { companionsApi } from "@/lib/api";
import { IconSidebar } from "@/components/layout/IconSidebar";
import { TopBar } from "@/components/layout/TopBar";
import { CategoryFilter, type Category } from "@/components/home/CategoryFilter";
import { CompanionCard } from "@/components/home/CompanionCard";

function CompanionsContent() {
  const searchParams = useSearchParams();
  const { companions, setCompanions } = useAppStore();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState<Category>(
    (searchParams.get("category") as Category) || "all"
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await companionsApi.list({
          category: category === "all" ? undefined : category,
          pageSize: 50
        });
        setCompanions(response.data || []);
      } catch {
        setError("Failed to load companions. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanions();
  }, [category, setCompanions]);

  useEffect(() => {
    const cat = searchParams.get("category") as Category;
    if (cat && ["all", "girls", "guys", "anime"].includes(cat)) {
      setCategory(cat);
    }
    const searchQuery = searchParams.get("search");
    if (searchQuery !== null) {
      setSearch(searchQuery);
    }
  }, [searchParams]);

  const filtered = companions.filter((c) => {
    const searchLower = search.toLowerCase();
    const matchSearch =
      c.name.toLowerCase().includes(searchLower) ||
      c.bio.toLowerCase().includes(searchLower) ||
      (c.tags && c.tags.some(tag => tag.toLowerCase().includes(searchLower)));
    return matchSearch;
  });

  return (
    <div className="flex min-h-screen bg-background">
      {/* Fixed Icon Sidebar - Desktop */}
      <IconSidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-16">
        {/* Top Bar */}
        <TopBar />

        <div className="p-4 lg:p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
                Explore Companions
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Find your perfect AI companion
              </p>
            </div>
            <Link
              href="/create"
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all glow-primary sm:w-auto w-full"
            >
              <Plus size={18} />
              Create Companion
            </Link>
          </div>

          {/* Search and Filters Row */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="relative flex-1 lg:max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search companions..."
                className="w-full bg-secondary rounded-full pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            <CategoryFilter activeCategory={category} onCategoryChange={setCategory} />
          </div>

          {/* Results Count */}
          {!loading && !error && (
            <p className="text-sm text-muted-foreground">
              Showing {filtered.length} companion{filtered.length !== 1 ? "s" : ""}
              {category !== "all" && ` in ${category}`}
            </p>
          )}

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-medium hover:brightness-110 transition-all"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5">
                {filtered.map((c) => (
                  <CompanionCard key={c.id} companion={c} />
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-muted-foreground text-lg">No companions found</p>
                  <p className="text-muted-foreground/70 text-sm mt-2">
                    Try adjusting your search or category filter
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function CompanionsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-background">
        <main className="flex-1 lg:ml-16 p-6">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    }>
      <CompanionsContent />
    </Suspense>
  );
}
