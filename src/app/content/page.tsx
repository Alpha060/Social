import Link from "next/link";
import { Search, BookOpen, Monitor, PenTool, Briefcase, Star, X, LayoutGrid } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import CreationsGrid from "@/components/CreationsGrid";

// Category Icon Mapper
function getCategoryIcon(name: string, size = 14) {
  const lower = name.toLowerCase();
  if (lower.includes("photo")) return <PenTool size={size} />;
  if (lower.includes("video")) return <Monitor size={size} />;
  if (lower.includes("study") || lower.includes("education")) return <BookOpen size={size} />;
  if (lower.includes("design") || lower.includes("art")) return <PenTool size={size} />;
  if (lower.includes("develop") || lower.includes("tech")) return <Monitor size={size} />;
  if (lower.includes("music")) return <Star size={size} />;
  if (lower.includes("business")) return <Briefcase size={size} />;
  return <Star size={size} />;
}

export default async function ExplorePage(props: { 
  searchParams: Promise<{ search?: string; category?: string }> 
}) {
  const searchParams = await props.searchParams;
  const searchQuery = searchParams.search || "";
  const selectedCategory = searchParams.category || "";

  // Fetch categories from DB
  const dbCategories = await prisma.category.findMany({
    orderBy: { name: "asc" }
  });

  // Sort "Other" to the end of the list
  const sortedCategories = dbCategories.filter(c => c.name.toLowerCase() !== "other");
  const otherCategory = dbCategories.find(c => c.name.toLowerCase() === "other");
  const categoriesList = otherCategory ? [...sortedCategories, otherCategory] : sortedCategories;

  // Fetch verified content
  const contents = await prisma.content.findMany({
    where: {
      isVerified: true,
      ...(selectedCategory ? {
        category: {
          name: selectedCategory
        }
      } : {}),
      ...(searchQuery ? {
        OR: [
          { title: { contains: searchQuery, mode: "insensitive" } },
          { description: { contains: searchQuery, mode: "insensitive" } },
        ]
      } : {})
    },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-8 py-12">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Explore Content</h1>
            <p className="text-slate-500">Discover all verified creations from the community.</p>
          </div>
          
          <form action="/content" method="GET" className="flex items-center bg-white p-2 rounded-2xl shadow-sm border border-slate-200 w-full md:w-96">
            <input 
              type="text" 
              name="search"
              defaultValue={searchQuery}
              placeholder="Search content..." 
              className="flex-1 px-4 text-slate-700 focus:outline-none placeholder:text-slate-400 text-sm"
            />
            {selectedCategory && (
              <input type="hidden" name="category" value={selectedCategory} />
            )}
            <button type="submit" className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center">
              <Search size={18} />
            </button>
          </form>
        </div>

        {/* Categories Section */}
        <div className="mb-12 w-full">
          <div className="flex flex-wrap gap-2.5">
            {/* All Option */}
            <Link 
              href={searchQuery ? `/content?search=${encodeURIComponent(searchQuery)}` : "/content"}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 transform active:scale-95 ${
                !selectedCategory 
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/15" 
                  : "bg-white border-slate-200/60 text-slate-500 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm hover:-translate-y-0.5"
              }`}
            >
              <div className={`transition-colors duration-200 ${!selectedCategory ? "text-white" : "text-indigo-500"}`}>
                <LayoutGrid size={15} />
              </div>
              <span className="font-semibold text-xs tracking-tight">All</span>
            </Link>

            {categoriesList.map((category) => {
              const isSelected = selectedCategory === category.name;
              return (
                <Link 
                  key={category.id}
                  href={isSelected 
                    ? (searchQuery ? `/content?search=${encodeURIComponent(searchQuery)}` : "/content") 
                    : `/content?category=${encodeURIComponent(category.name)}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""}`
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 transform active:scale-95 ${
                    isSelected 
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/15" 
                      : "bg-white border-slate-200/60 text-slate-500 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm hover:-translate-y-0.5"
                  }`}
                >
                  <div className={`transition-colors duration-200 ${isSelected ? "text-white" : "text-indigo-500"}`}>
                    {getCategoryIcon(category.name, 15)}
                  </div>
                  <span className="font-semibold text-xs tracking-tight">{category.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Results Info & Reset */}
        {(selectedCategory || searchQuery) && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm font-semibold text-slate-500">
              Showing results for {searchQuery && <span>"<span className="text-slate-900">{searchQuery}</span>"</span>} 
              {searchQuery && selectedCategory && " in "}
              {selectedCategory && <span className="text-indigo-600">{selectedCategory}</span>}
              <span className="ml-2 bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md text-xs">{contents.length} found</span>
            </p>
            <Link 
              href="/content" 
              className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-3.5 py-2 rounded-xl hover:bg-indigo-100 transition-colors"
            >
              <X size={14} /> Clear Filters
            </Link>
          </div>
        )}

        {/* Content Grid */}
        {contents.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col items-center justify-center mt-4">
            <span className="text-4xl mb-4">🔍</span>
            <p className="text-slate-700 font-bold text-lg mb-1">No Creations Found</p>
            <p className="text-slate-400 text-sm max-w-sm px-4">We couldn't find any creations matching your current filters. Try resetting the filters!</p>
          </div>
        ) : (
          <CreationsGrid contents={contents as any} />
        )}
      </main>

      <Footer />
    </div>
  );
}
