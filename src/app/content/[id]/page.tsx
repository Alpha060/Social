"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Eye, Calendar, User } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ContentViewerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { token } = useAuth();

  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (!id) return;

    const hasViewed = localStorage.getItem(`viewed_${id}`);
    const recordView = !hasViewed;

    const headers: any = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    fetch(`/api/content/${id}?recordView=${recordView}`, { headers })
      .then(res => {
        if (!res.ok) throw new Error("Content not found");
        return res.json();
      })
      .then(data => {
        setContent(data.content);
        setLoading(false);
        if (recordView) {
          localStorage.setItem(`viewed_${id}`, "true");
        }
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id, token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">404</h1>
        <p className="text-lg text-slate-500 mb-8">The content you are looking for does not exist or has been removed.</p>
        <button
          onClick={() => router.back()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft size={18} /> Go Back
        </button>
      </div>
    );
  }

  const getYouTubeInfo = (url: string) => {
    try {
      const parsedUrl = new URL(url);
      let videoId = "";
      let isShort = false;

      if (parsedUrl.hostname.includes("youtube.com") || parsedUrl.hostname.includes("youtu.be")) {
        if (parsedUrl.pathname.startsWith("/shorts/")) {
          videoId = parsedUrl.pathname.split("/")[2];
          isShort = true;
        } else if (parsedUrl.hostname.includes("youtu.be")) {
          videoId = parsedUrl.pathname.slice(1);
        } else if (parsedUrl.pathname === "/watch") {
          videoId = parsedUrl.searchParams.get("v") || "";
        }
      }
      return { videoId, isShort };
    } catch {
      return { videoId: "", isShort: false };
    }
  };

  const ytInfo = content.type === "VIDEO" ? getYouTubeInfo(content.fileUrl) : { videoId: "", isShort: false };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8 w-full flex-1">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-8 font-medium"
        >
          <ArrowLeft size={18} /> Back
        </button>

        {/* Content Viewer Area */}
        <div className={(ytInfo.isShort || content.type === "IMAGE") ? "flex items-center justify-center mb-10" : "bg-black rounded-2xl shadow-lg mb-8 flex items-center justify-center min-h-[400px] border border-slate-200"}>
          {content.type === "IMAGE" && (
            <div className="bg-white rounded-2xl p-4 shadow-xl border border-slate-200 flex items-center justify-center group relative cursor-zoom-in" onClick={() => setIsZoomed(true)}>
              <img src={content.fileUrl} alt={content.title} className="max-w-full max-h-[75vh] object-contain rounded-lg group-hover:opacity-95 transition-opacity" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/60 text-white px-4 py-2 rounded-full font-medium backdrop-blur-sm shadow-lg pointer-events-none">
                  Click to Zoom
                </div>
              </div>
            </div>
          )}
          {content.type === "VIDEO" && (
            ytInfo.videoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${ytInfo.videoId}?autoplay=1`}
                title={content.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className={`max-w-full max-h-[75vh] ${ytInfo.isShort ? "w-auto aspect-[9/16] h-[75vh] rounded-[2rem] shadow-2xl border-[6px] border-slate-900 bg-slate-900" : "w-full aspect-video rounded-xl"}`}
              />
            ) : (
              <video autoPlay controls src={content.fileUrl} className="max-w-full max-h-[70vh] w-full rounded-xl" poster={content.thumbnail || ""} />
            )
          )}
          {content.type === "PDF" && (
            <iframe src={content.fileUrl} className="w-full h-[70vh] rounded-xl" title={content.title} />
          )}
        </div>

        {/* Content Details */}
        <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{content.title}</h1>
              <div className="flex items-center gap-4 flex-wrap text-sm text-slate-500 font-medium">
                <span className="flex items-center gap-1.5"><Eye size={16} /> {content.views} Views</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                <span className="flex items-center gap-1.5"><Calendar size={16} /> {new Date(content.createdAt).toLocaleDateString()}</span>
                {content.category && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                    <span className="bg-slate-100 px-3 py-1 rounded-full text-slate-700">{content.category.name}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 mt-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-lg">
              {content.user?.avatar ? (
                <img src={content.user.avatar} alt={content.user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                content.user?.name ? content.user.name.charAt(0).toUpperCase() : <User size={20} />
              )}
            </div>
            <div>
              <p className="font-bold text-slate-900">{content.user?.name || "Unknown User"}</p>
              <p className="text-sm text-slate-500">Uploader</p>
            </div>
          </div>

          {content.description && (
            <div className="mt-8 pt-8 border-t border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Description</h3>
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{content.description}</p>
            </div>
          )}
        </div>

        {/* Zoom Modal */}
        {isZoomed && content.type === "IMAGE" && (
          <div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out backdrop-blur-sm"
            onClick={() => setIsZoomed(false)}
          >
            <img src={content.fileUrl} alt={content.title} className="max-w-full max-h-full object-contain" />
            <div className="absolute top-6 right-6 text-white/50 bg-black/20 p-2 rounded-full hover:bg-black/40 hover:text-white transition-colors cursor-pointer">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
