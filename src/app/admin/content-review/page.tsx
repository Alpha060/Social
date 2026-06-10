"use client";

import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Check, X, Star, StarOff, Eye, FileText, Image as ImageIcon, Play, ExternalLink, Filter, Trash2 } from "lucide-react";

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

interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  type: string;
  fileUrl: string;
  thumbnail: string | null;
  isVerified: boolean;
  isFeatured: boolean;
  views: number;
  createdAt: string;
  user: { id: string; name: string; email: string; avatar: string | null };
  category: { id: string; name: string } | null;
}

function AdminContentReviewContent() {
  const { token, user: currentUser, loading: authLoading } = useAuth();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<"pending" | "all">(
    searchParams?.get("tab") === "pending" ? "pending" : "all"
  );
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/login");
      return;
    }
    if (!token) return;
    fetchContent();
  }, [token, viewMode, authLoading, currentUser, router]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const url = viewMode === "pending" ? "/api/admin/pending" : "/api/content";
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setContent(data.contents || []);
    } catch (err) {
      console.error("Failed to fetch content", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: "verify" | "unverify" | "feature" | "unfeature") => {
    setActionLoading(id);
    try {
      await fetch(`/api/admin/content/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      await fetchContent();
    } catch (err) {
      console.error("Action failed", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    setActionLoading(id);
    try {
      await fetch(`/api/admin/content/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteConfirm(null);
      await fetchContent();
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setActionLoading(null);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "IMAGE": return <ImageIcon size={14} />;
      case "VIDEO": return <Play size={14} fill="currentColor" />;
      case "PDF": return <FileText size={14} />;
      default: return <FileText size={14} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "IMAGE": return "bg-blue-50 text-blue-600";
      case "VIDEO": return "bg-yellow-50 text-yellow-600";
      case "PDF": return "bg-red-50 text-red-600";
      default: return "bg-slate-50 text-slate-600";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Content Review</h1>
          <p className="text-sm text-slate-400 mt-1">
            {viewMode === "pending" ? `${content.length} items awaiting review` : `${content.length} total items`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("pending")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === "pending"
                ? "bg-orange-500 text-white shadow-md"
                : "bg-white border border-slate-200 text-slate-500 hover:border-slate-300"
            }`}
          >
            Pending Only
          </button>
          <button
            onClick={() => setViewMode("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === "all"
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-white border border-slate-200 text-slate-500 hover:border-slate-300"
            }`}
          >
            All Content
          </button>
        </div>
      </div>

      {/* Content Grid */}
      {content.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Check size={28} className="text-green-500" />
          </div>
          <p className="text-slate-500 font-semibold text-sm">
            {viewMode === "pending" ? "All content has been reviewed!" : "No content yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
          {content.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              {/* Thumbnail / Preview */}
              <div className="h-40 bg-slate-100 relative overflow-hidden">
                {item.type === "IMAGE" && item.fileUrl ? (
                  <img src={item.fileUrl} alt={item.title} className="w-full h-full object-cover" />
                ) : item.type === "VIDEO" && (item.thumbnail || getYouTubeId(item.fileUrl)) ? (
                  <img 
                    src={
                      item.thumbnail || 
                      `https://img.youtube.com/vi/${getYouTubeId(item.fileUrl)}/hqdefault.jpg`
                    } 
                    alt={item.title} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${
                    item.type === "VIDEO" ? "bg-slate-900" : "bg-gradient-to-br from-slate-100 to-slate-200"
                  }`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getTypeColor(item.type)}`}>
                      {getTypeIcon(item.type)}
                    </div>
                  </div>
                )}
                
                {/* Status badges */}
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.isVerified ? "bg-green-500 text-white" : "bg-orange-500 text-white"
                  }`}>
                    {item.isVerified ? "Verified" : "Pending"}
                  </span>
                  {item.isFeatured && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500 text-white">
                      ⭐ Featured
                    </span>
                  )}
                </div>

                {/* Type badge */}
                <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${getTypeColor(item.type)}`}>
                  {getTypeIcon(item.type)} {item.type}
                </span>
              </div>

              {/* Content Info */}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{item.title}</h3>
                  <span className="text-xs font-semibold text-slate-500 shrink-0">
                    {item.views}
                  </span>
                </div>
                {item.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">{item.description}</p>
                )}
                
                <div className="flex items-center gap-3 mt-auto mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold overflow-hidden">
                      {item.user.avatar ? (
                        <img src={item.user.avatar} alt={item.user.name} className="w-full h-full object-cover" />
                      ) : (
                        item.user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="text-xs text-slate-500 font-medium">{item.user.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-300">•</span>
                  <span className="text-xs text-slate-400 truncate">{item.category?.name || "No category"}</span>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-3 border-t border-slate-50">
                  {actionLoading === item.id ? (
                    <Loader2 size={16} className="animate-spin text-slate-400 mx-auto" />
                  ) : (
                    <>
                      {!item.isVerified ? (
                        <button
                          onClick={() => handleAction(item.id, "verify")}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-green-50 text-green-600 text-xs font-bold hover:bg-green-100 transition-colors cursor-pointer"
                          title="Approve"
                        >
                          <Check size={14} /> <span className="hidden sm:inline">Approve</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAction(item.id, "unverify")}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-orange-50 text-orange-600 text-xs font-bold hover:bg-orange-100 transition-colors cursor-pointer"
                          title="Unverify"
                        >
                          <X size={14} /> <span className="hidden sm:inline">Unverify</span>
                        </button>
                      )}

                      {item.isVerified && (
                        <button
                          onClick={() => handleAction(item.id, item.isFeatured ? "unfeature" : "feature")}
                          className={`py-2 px-2 sm:px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                            item.isFeatured
                              ? "bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                              : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                          }`}
                          title={item.isFeatured ? "Unfeature" : "Feature"}
                        >
                          {item.isFeatured ? <StarOff size={14} /> : <Star size={14} />}
                          <span className="hidden sm:inline">{item.isFeatured ? "Unfeature" : "Feature"}</span>
                        </button>
                      )}

                      <Link
                        href={`/content/${item.id}`}
                        className="py-2 px-2 sm:px-3 rounded-xl bg-slate-50 text-slate-500 text-xs font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5"
                        title="View"
                      >
                        <ExternalLink size={14} />
                      </Link>

                      {deleteConfirm === item.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="px-2 py-2 rounded-xl bg-red-600 text-white text-[10px] sm:text-xs font-bold hover:bg-red-700 cursor-pointer"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-2 py-2 rounded-xl bg-slate-100 text-slate-500 text-[10px] sm:text-xs font-bold cursor-pointer"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(item.id)}
                          className="py-2 px-2 sm:px-3 rounded-xl bg-red-50 text-red-500 text-xs font-bold hover:bg-red-100 transition-colors cursor-pointer flex items-center justify-center"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminContentReviewPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    }>
      <AdminContentReviewContent />
    </Suspense>
  );
}
