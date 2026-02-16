"use client";

export type Category = "all" | "girls" | "guys" | "anime";

interface CategoryFilterProps {
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
}

const categories: { id: Category; label: string; icon: string }[] = [
  { id: "all", label: "Discover", icon: "✨" },
  { id: "girls", label: "Girls", icon: "♀" },
  { id: "guys", label: "Guys", icon: "♂" },
  { id: "anime", label: "Anime", icon: "⭐" },
];

export function CategoryFilter({ activeCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onCategoryChange(cat.id)}
          className={`flex items-center gap-1.5 sm:gap-2 rounded-full px-3 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
            activeCategory === cat.id
              ? "bg-primary text-primary-foreground glow-primary"
              : "bg-secondary text-secondary-foreground hover:bg-muted"
          }`}
        >
          <span>{cat.icon}</span>
          <span>{cat.label}</span>
        </button>
      ))}
    </div>
  );
}
