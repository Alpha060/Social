"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Play, FileText, X, ExternalLink, Eye, ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

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
  user: { id: string; name: string; avatar: string | null } | null;
  category: { id: string; name: string } | null;
}

interface CreationsGridProps {
  contents: ContentItem[];
}

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

export default function CreationsGrid({ contents }: CreationsGridProps) {
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

  const incrementViews = async (itemId: string) => {
    try {
      await fetch(`/api/content/${itemId}`, { method: "PATCH" });
    } catch (err) {
      console.error("Failed to increment views", err);
    }
  };

  const handleOpenModal = (item: ContentItem) => {
    setSelectedItem(item);
    incrementViews(item.id);
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
        {contents.map((item) => {
          const isYoutubeVideo = item.type === "VIDEO" && getYouTubeId(item.fileUrl) !== "";
          const isShorts = item.type === "VIDEO" && item.fileUrl.includes("/shorts/");

          return (
            <div
              key={item.id}
              onClick={() => handleOpenModal(item)}
              className="group bg-white rounded-3xl border border-slate-100/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full cursor-pointer relative"
            >
              {/* Thumbnail / Preview container */}
              <div className="aspect-[4/3] bg-slate-950 relative overflow-hidden shrink-0">
                {item.type === "IMAGE" && (
                  <img
                    src={item.fileUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                {item.type === "VIDEO" && (
                  <>
                    <img
                      src={
                        item.thumbnail ||
                        (isYoutubeVideo
                          ? `https://img.youtube.com/vi/${getYouTubeId(item.fileUrl)}/hqdefault.jpg`
                          : "/video-placeholder.png")
                      }
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/35 transition-colors">
                      <div className="bg-white/20 backdrop-blur-md rounded-full p-2.5 text-white shadow-lg group-hover:scale-110 transition-transform flex items-center justify-center">
                        <Play size={18} fill="currentColor" className="ml-1" />
                      </div>
                    </div>
                  </>
                )}
                {item.type === "PDF" && (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-rose-500 to-red-600 text-white p-4">
                    <FileText size={36} className="drop-shadow-sm" />
                    <span className="text-[10px] font-bold uppercase mt-2.5 tracking-wider bg-white/20 px-2 py-0.5 rounded">
                      PDF
                    </span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-3 sm:p-5 flex flex-col flex-1 justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    {item.category?.name && (
                      <span className="text-[9px] sm:text-[10px] uppercase font-extrabold tracking-wider text-indigo-600 bg-indigo-50/70 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full truncate max-w-[100px] sm:max-w-none">
                        {item.category.name}
                      </span>
                    )}
                    
                    {/* Dedicated Detail Page Button */}
                    <Link
                      href={`/content/${item.id}`}
                      onClick={(e) => e.stopPropagation()} // Prevent modal opening
                      className="p-1.5 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-slate-100 duration-200 cursor-pointer flex items-center gap-1 shadow-sm opacity-60 group-hover:opacity-100"
                      title="Open dedicated page"
                    >
                      <ArrowUpRight size={13} />
                    </Link>
                  </div>
                  
                  <h3 className="font-bold text-slate-800 text-xs sm:text-sm mt-2 sm:mt-3 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                    {item.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-50">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-100 overflow-hidden text-[9px] sm:text-[10px] font-bold text-slate-500 flex items-center justify-center border border-slate-200 shrink-0">
                    {item.user?.avatar ? (
                      <img src={item.user.avatar} alt={item.user.name} className="w-full h-full object-cover" />
                    ) : (
                      item.user?.name?.charAt(0).toUpperCase() || "U"
                    )}
                  </div>
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-600 truncate max-w-[120px]">
                    {item.user?.name || "Creator"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold ml-auto">
                    {new Date(item.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Popup Viewer */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-slate-900/80"
            />

            {/* Modal Box Container */}
            {(() => {
              const ytId = getYouTubeId(selectedItem.fileUrl);
              const isShorts = selectedItem.fileUrl.includes("/shorts/");

              // Determine aspect classes for container
              let sizeClasses = "max-w-4xl w-full aspect-video";
              if (selectedItem.type === "IMAGE") {
                sizeClasses = "max-w-4xl w-full max-h-[85vh] flex items-center justify-center";
              } else if (selectedItem.type === "VIDEO" && isShorts) {
                sizeClasses = "max-w-[380px] aspect-[9/16] h-[85vh]";
              } else if (selectedItem.type === "PDF") {
                sizeClasses = "max-w-5xl w-full h-[85vh]";
              }

              const isVideo = selectedItem.type === "VIDEO";

              return (
                <motion.div
                  initial={isVideo ? { opacity: 0 } : { scale: 0.95, opacity: 0, y: 15 }}
                  animate={isVideo ? { opacity: 1 } : { scale: 1, opacity: 1, y: 0 }}
                  exit={isVideo ? { opacity: 0 } : { scale: 0.95, opacity: 0, y: 15 }}
                  transition={isVideo ? { duration: 0.2 } : { type: "spring", duration: 0.4 }}
                  className={`relative bg-slate-950 rounded-3xl shadow-2xl z-10 flex items-center justify-center ${sizeClasses}`}
                >
                  {/* Close Button */}
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="absolute top-4 right-4 z-20 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white rounded-full transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>

                  {selectedItem.type === "IMAGE" && (
                    <img
                      src={selectedItem.fileUrl}
                      alt={selectedItem.title}
                      className="max-w-full max-h-[85vh] object-contain rounded-3xl"
                    />
                  )}

                  {selectedItem.type === "VIDEO" && (() => {
                    if (ytId) {
                      return (
                        <div 
                          className={`relative w-full h-full flex items-center justify-center rounded-3xl ${
                            isShorts ? "w-full h-full" : "w-full aspect-video"
                          }`}
                          style={{
                            backgroundImage: `url(https://img.youtube.com/vi/${ytId}/maxresdefault.jpg)`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundColor: '#0f172a'
                          }}
                        >
                          <iframe
                            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&controls=1`}
                            title={selectedItem.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            className="w-full h-full rounded-3xl"
                          />
                        </div>
                      );
                    }

                    return (
                      <video
                        src={selectedItem.fileUrl}
                        controls
                        autoPlay
                        className="w-full h-full object-contain"
                      />
                    );
                  })()}

                  {selectedItem.type === "PDF" && (
                    <iframe
                      src={`${selectedItem.fileUrl}#view=FitH`}
                      className="w-full h-full border-0 bg-white"
                      title={selectedItem.title}
                    />
                  )}
                </motion.div>
              );
            })()}
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
