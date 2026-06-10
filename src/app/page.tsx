import Link from "next/link";
import { PlaySquare, Search, BookOpen, Monitor, PenTool, Briefcase, Star, CheckCircle, FileText, X, LayoutGrid } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import CreationsGrid from "@/components/CreationsGrid";

// Helper function to extract YouTube Video ID
function getYouTubeId(url: string) {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname.includes("youtube.com") || parsedUrl.hostname.includes("youtu.be")) {
      if (parsedUrl.pathname.startsWith("/shorts/")) {
        return parsedUrl.pathname.split("/")[2];
      } else if (parsedUrl.hostname.includes("youtu.be")) {
        return parsedUrl.pathname.slice(1);
      } else if (parsedUrl.pathname === "/watch") {
        return parsedUrl.searchParams.get("v") || "";
      }
    }
    return "";
  } catch {
    return "";
  }
}

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

export default async function Home(props: { 
  searchParams: Promise<{ search?: string; category?: string }> 
}) {
  const searchParams = await props.searchParams;
  const searchQuery = searchParams.search || "";
  const selectedCategory = searchParams.category || "";

  // 1. Fetch featured image (isFeatured = true, type = IMAGE, isVerified = true)
  const featuredImage = await prisma.content.findFirst({
    where: { isFeatured: true, type: "IMAGE", isVerified: true },
    include: { user: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: "desc" },
  });

  // 2. Fetch featured video (isFeatured = true, type = VIDEO, isVerified = true)
  const featuredVideo = await prisma.content.findFirst({
    where: { isFeatured: true, type: "VIDEO", isVerified: true },
    include: { user: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: "desc" },
  });

  // 3. Fetch categories from DB
  const dbCategories = await prisma.category.findMany({
    orderBy: { name: "asc" }
  });

  // Sort "Other" to the end of the list
  const sortedCategories = dbCategories.filter(c => c.name.toLowerCase() !== "other");
  const otherCategory = dbCategories.find(c => c.name.toLowerCase() === "other");
  const categoriesList = otherCategory ? [...sortedCategories, otherCategory] : sortedCategories;

  // 4. Fetch all other verified content (exclude featuredImage and featuredVideo from this list)
  const excludedIds = [featuredImage?.id, featuredVideo?.id].filter(Boolean) as string[];
  
  const otherContents = await prisma.content.findMany({
    where: {
      isVerified: true,
      id: { notIn: excludedIds },
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
    take: 8,
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full px-8 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Text & Search */}
          <div className="max-w-xl">
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-6 tracking-tight">
              Discover.<br />
              Learn.<br />
              Get Inspired.
            </h1>
            <p className="text-slate-500 text-lg mb-10 leading-relaxed max-w-md">
              Explore awesome content from creators around the world. Only verified work.
            </p>
            
            <form action="/content" method="GET" className="flex items-center bg-white p-2 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
              <input 
                type="text" 
                name="search"
                defaultValue={searchQuery}
                placeholder="Search for creators, categories or content..." 
                className="flex-1 px-4 text-slate-700 focus:outline-none placeholder:text-slate-400 text-sm"
              />
              {selectedCategory && (
                <input type="hidden" name="category" value={selectedCategory} />
              )}
              <button type="submit" className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center">
                <Search size={20} />
              </button>
            </form>
          </div>

          {/* Right Column: Cards */}
          <div className="relative h-[400px] w-full hidden lg:flex justify-end">
            
            {/* Card 1 (Back/Left) - Featured Image */}
            {featuredImage ? (
              <Link 
                href={`/content/${featuredImage.id}`} 
                className="absolute top-10 right-32 md:right-40 bg-white p-4 rounded-3xl shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-slate-50 w-72 z-10 hover:-translate-y-2 hover:z-30 transition-all duration-300"
              >
                <div className="h-40 bg-slate-800 rounded-2xl mb-4 relative overflow-hidden flex justify-center items-center">
                  <img 
                    src={featuredImage.fileUrl} 
                    alt={featuredImage.title} 
                    className="absolute inset-0 w-full h-full object-cover" 
                  />
                </div>
                <h3 className="font-bold text-slate-900 mb-3 text-sm line-clamp-1">{featuredImage.title}</h3>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 overflow-hidden text-[10px] font-bold text-slate-500 flex items-center justify-center border border-slate-200">
                    {featuredImage.user?.avatar ? (
                      <img src={featuredImage.user.avatar} alt={featuredImage.user.name} className="w-full h-full object-cover" />
                    ) : (
                      featuredImage.user?.name?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-xs font-medium text-slate-600 truncate max-w-[120px]">{featuredImage.user?.name}</span>
                  <span className="text-indigo-600 ml-auto flex items-center gap-1 text-[10px] font-bold">
                    <CheckCircle size={12} /> Featured
                  </span>
                </div>
              </Link>
            ) : (
              /* Fallback Image Card */
              <div className="absolute top-10 right-32 md:right-40 bg-white p-4 rounded-3xl shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-slate-50 w-72 z-10 hover:-translate-y-2 transition-transform duration-300">
                <div className="h-40 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl mb-4 relative overflow-hidden flex justify-center items-center">
                  <div className="text-white text-xs font-bold px-4 text-center">Inspirational Concepts</div>
                </div>
                <h3 className="font-bold text-slate-900 mb-3 text-sm">Minimalist UI Dashboard</h3>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">S</div>
                  <span className="text-xs font-medium text-slate-600">Sarah Connor</span>
                  <span className="text-indigo-600 ml-auto flex items-center gap-1 text-[10px] font-bold">
                    <CheckCircle size={12} /> Mockup
                  </span>
                </div>
              </div>
            )}

            {/* Card 2 (Front/Right) - Featured Video Autoplay Muted */}
            {featuredVideo ? (
              <Link 
                href={`/content/${featuredVideo.id}`} 
                className="absolute top-32 right-0 bg-white p-4 rounded-3xl shadow-[0_20px_50px_rgb(0,0,0,0.12)] border border-slate-50 w-72 z-20 hover:-translate-y-2 hover:z-30 transition-all duration-300"
              >
                <div className="h-48 bg-slate-900 rounded-2xl mb-4 relative overflow-hidden flex justify-center items-center">
                  {(() => {
                    const ytId = getYouTubeId(featuredVideo.fileUrl);
                    if (ytId) {
                      return (
                        <iframe 
                          src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0`}
                          title={featuredVideo.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          className="absolute inset-0 w-full h-full object-cover pointer-events-none scale-125"
                        />
                      );
                    } else {
                      return (
                        <video 
                          src={featuredVideo.fileUrl} 
                          autoPlay 
                          loop 
                          muted 
                          playsInline 
                          className="absolute inset-0 w-full h-full object-cover" 
                        />
                      );
                    }
                  })()}
                </div>
                <h3 className="font-bold text-slate-900 mb-3 text-sm line-clamp-1">{featuredVideo.title}</h3>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 overflow-hidden text-[10px] font-bold text-slate-500 flex items-center justify-center border border-slate-200">
                    {featuredVideo.user?.avatar ? (
                      <img src={featuredVideo.user.avatar} alt={featuredVideo.user.name} className="w-full h-full object-cover" />
                    ) : (
                      featuredVideo.user?.name?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-xs font-medium text-slate-600 truncate max-w-[120px]">{featuredVideo.user?.name}</span>
                  <span className="text-indigo-600 ml-auto flex items-center gap-1 text-[10px] font-bold">
                    <CheckCircle size={12} /> Featured
                  </span>
                </div>
              </Link>
            ) : (
              /* Fallback Video Card */
              <div className="absolute top-32 right-0 bg-white p-4 rounded-3xl shadow-[0_20px_50px_rgb(0,0,0,0.12)] border border-slate-50 w-72 z-20 hover:-translate-y-2 transition-transform duration-300">
                <div className="h-48 bg-[#0a1128] rounded-2xl mb-4 relative overflow-hidden flex justify-center items-center">
                   <div className="w-24 h-24 border border-indigo-500/30 rounded-full flex items-center justify-center relative">
                     <div className="w-12 h-12 border border-indigo-400/50 rounded-full"></div>
                     <div className="absolute top-0 w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                     <div className="absolute bottom-0 w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                   </div>
                </div>
                <h3 className="font-bold text-slate-900 mb-3 text-sm">Interactive Animations</h3>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">M</div>
                  <span className="text-xs font-medium text-slate-600">Motion Lab</span>
                  <span className="text-indigo-600 ml-auto flex items-center gap-1 text-[10px] font-bold">
                    <CheckCircle size={12} /> Mockup
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Categories Section */}
        <div id="categories" className="mt-16 md:mt-24 w-full">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-5">Browse Categories</h2>
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
              <span className="font-semibold text-xs tracking-tight">All Categories</span>
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

        {/* All Other Verified Content Grid */}
        <div id="explore" className="mt-20 w-full">
          <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Explore Creations</h2>
              <p className="text-slate-400 text-xs mt-1">Browse and search through other verified submissions.</p>
            </div>
            
            <div className="flex items-center gap-4">
              {(selectedCategory || searchQuery) && (
                <Link 
                  href="/" 
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-3.5 py-2 rounded-xl hover:bg-indigo-100 transition-colors"
                >
                  <X size={14} /> Reset Filters
                </Link>
              )}
              <Link 
                href="/content" 
                className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 group"
              >
                View All <span className="group-hover:translate-x-1 transition-transform inline-block">&rarr;</span>
              </Link>
            </div>
          </div>

          {otherContents.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col items-center justify-center">
              <span className="text-4xl mb-4">🔍</span>
              <p className="text-slate-700 font-bold text-lg mb-1">No Creations Found</p>
              <p className="text-slate-400 text-sm max-w-sm px-4">We couldn't find any creations matching your current filters. Try resetting the filters or look back later!</p>
            </div>
          ) : (
            <CreationsGrid contents={otherContents as any} />
          )}
        </div>

        {/* About Section */}
        <div id="about" className="mt-24 w-full border-t border-slate-100 pt-16 pb-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3.5 py-1.5 rounded-full">About ShowCase</span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-4 mb-6 leading-tight">
                A premier community for verified creators to showcase their work.
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                ShowCase is a curation platform designed for photographers, videographers, developers, and educators. Only verified submissions make it to our landing feed, ensuring that everything you discover here is high-quality, professional-grade material.
              </p>
              <p className="text-slate-500 text-sm leading-relaxed">
                Whether you're looking to share your creations, build your portfolio, or find high-caliber material, ShowCase is the destination for inspiration.
              </p>
            </div>
            <div className="bg-indigo-600/5 border border-indigo-100 rounded-3xl p-8 md:p-10 flex flex-col gap-6 justify-center">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/10">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Verified Curation</h4>
                  <p className="text-slate-500 text-xs mt-1">Every submission is individually reviewed by administrators to ensure content integrity.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/10">
                  <Monitor size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Responsive Media Engine</h4>
                  <p className="text-slate-500 text-xs mt-1">High-performance video streaming and responsive image displays built in.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
