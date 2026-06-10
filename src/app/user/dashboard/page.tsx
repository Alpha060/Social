"use client";

import Link from "next/link";
import { Clock, Image as ImageIcon, Video, FileText, Play, Loader2 } from "lucide-react";
import { useEffect, useState, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams, useRouter } from "next/navigation";

function ActionToast() {
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);
  const [toastData, setToastData] = useState<{message: string, bgColor: string, icon: string, iconBg: string} | null>(null);

  useEffect(() => {
    const action = searchParams?.get("action") || (searchParams?.get("success") === "true" ? "upload" : null);
    
    if (action) {
      if (action === "upload") {
        setToastData({ message: "Content uploaded successfully!", bgColor: "bg-green-400", icon: "🎉", iconBg: "bg-green-300" });
      } else if (action === "delete") {
        setToastData({ message: "Content deleted successfully!", bgColor: "bg-red-400", icon: "🗑️", iconBg: "bg-red-300" });
      } else if (action === "edit") {
        setToastData({ message: "Content updated successfully!", bgColor: "bg-blue-400", icon: "✏️", iconBg: "bg-blue-300" });
      }

      // Clean the URL so refreshing doesn't show the toast again
      window.history.replaceState(null, '', window.location.pathname);

      // Trigger CSS transition
      setTimeout(() => setShow(true), 10);
      
      setTimeout(() => {
        setShow(false);
        setTimeout(() => setToastData(null), 500);
      }, 2000);
    }
  }, [searchParams]);

  if (!toastData) return null;

  return (
    <div className={`fixed top-8 left-1/2 z-[100] transition-all duration-500 ease-in-out transform -translate-x-1/2 ${
      show ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0'
    }`}>
      <div className={`${toastData.bgColor} text-white px-6 py-4 rounded-full text-sm font-bold shadow-2xl flex items-center gap-3`}>
        <div className={`w-7 h-7 ${toastData.iconBg} rounded-full flex items-center justify-center text-lg shadow-inner`}>{toastData.icon}</div>
        <span>{toastData.message}</span>
      </div>
    </div>
  );
}

export default function UserDashboard() {
  const { user, token, loading: authLoading } = useAuth();
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (!token) return;
    
    fetch('/api/content', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.contents) {
        setContents(data.contents);
      }
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [token]);

  const totalUploads = contents.length;
  const verifiedCount = contents.filter(c => c.isVerified).length;
  const pendingCount = contents.filter(c => !c.isVerified).length;
  const totalViews = contents.reduce((acc, c) => acc + (c.views || 0), 0);

  const stats = [
    { label: "Total Uploads", value: totalUploads.toString(), color: "text-indigo-600" },
    { label: "Verified", value: verifiedCount.toString(), color: "text-green-600" },
    { label: "Pending", value: pendingCount.toString(), color: "text-orange-500" },
    { label: "Total Views", value: totalViews >= 1000 ? `${(totalViews/1000).toFixed(1)}K` : totalViews.toString(), color: "text-slate-900" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      <Suspense fallback={null}>
        <ActionToast />
      </Suspense>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Welcome back, {user?.name?.split(' ')[0] || 'Creator'}! 👋</h1>
          <p className="text-slate-500 text-sm">Here's what's happening with your content.</p>
        </div>
        <Link 
          href="/user/upload?from=dashboard" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          Upload New
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
            <h2 className={`text-3xl font-bold mb-1 ${stat.color}`}>{stat.value}</h2>
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* My Uploads Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-2">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4">My Uploads</h3>
          
          {/* Tabs */}
          <div className="flex gap-6 text-sm font-medium text-slate-500 border-b border-slate-100">
            <button className="cursor-pointer text-indigo-600 border-b-2 border-indigo-600 pb-3 px-1">All</button>
            <button className="cursor-pointer hover:text-slate-900 pb-3 px-1 transition-colors">Video</button>
            <button className="cursor-pointer hover:text-slate-900 pb-3 px-1 transition-colors">Image</button>
            <button className="cursor-pointer hover:text-slate-900 pb-3 px-1 transition-colors">PDF</button>
            <button className="cursor-pointer hover:text-slate-900 pb-3 px-1 transition-colors">Pending</button>
            <button className="cursor-pointer hover:text-slate-900 pb-3 px-1 transition-colors">Verified</button>
          </div>
        </div>

        {/* Uploads List */}
        <div className="flex flex-col">
          {contents.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No uploads found. Start by uploading your first content!
            </div>
          ) : (
            contents.map((upload) => (
              <div key={upload.id} className="flex items-center justify-between p-4 px-6 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  {/* Thumbnail Placeholder */}
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white overflow-hidden relative shrink-0 ${
                    upload.type === 'PDF' ? 'bg-red-500' : 'bg-slate-100'
                  }`}>
                    {upload.type === 'PDF' && <FileText size={20} />}
                    {upload.type === 'IMAGE' && (
                      <img src={upload.fileUrl} alt={upload.title} className="w-full h-full object-cover" />
                    )}
                    {upload.type === 'VIDEO' && (
                      <>
                        <img 
                          src={
                            upload.thumbnail || 
                            (upload.fileUrl.includes('youtube.com') || upload.fileUrl.includes('youtu.be') 
                              ? `https://img.youtube.com/vi/${
                                  upload.fileUrl.includes('/shorts/') ? upload.fileUrl.split('/shorts/')[1].split('?')[0] : 
                                  upload.fileUrl.includes('youtu.be') ? upload.fileUrl.split('youtu.be/')[1].split('?')[0] :
                                  new URLSearchParams(upload.fileUrl.split('?')[1]).get('v')
                                }/hqdefault.jpg` 
                              : upload.fileUrl)
                          } 
                          alt={upload.title} 
                          className="w-full h-full object-cover" 
                          onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 hidden">
                          <Play size={20} fill="currentColor" />
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{upload.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{upload.type}</p>
                  </div>
                </div>

                <div className="flex items-center gap-16">
                  <div className="w-24">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      upload.isVerified ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                    }`}>
                      {upload.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  <div className="w-24 text-right">
                    <span className="text-xs text-slate-500 font-medium">
                      {new Date(upload.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
