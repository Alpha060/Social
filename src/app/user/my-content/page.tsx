"use client";

import Link from "next/link";
import { Image as ImageIcon, Video, FileText, Play, Loader2, Plus, Eye, Edit2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

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

export default function MyUploadsPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    if (!token) return;
    
    fetch('/api/content', {
      headers: { Authorization: `Bearer ${token}` }
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

  const filteredContents = contents.filter(upload => {
    if (activeTab === "All") return true;
    if (activeTab === "Video") return upload.type === "VIDEO";
    if (activeTab === "Image") return upload.type === "IMAGE";
    if (activeTab === "PDF") return upload.type === "PDF";
    if (activeTab === "Pending") return !upload.isVerified;
    if (activeTab === "Verified") return upload.isVerified;
    return true;
  });

  const tabs = ["All", "Video", "Image", "PDF", "Pending", "Verified"];

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this content?")) return;
    
    try {
      const res = await fetch(`/api/content/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setContents(prev => prev.filter(c => c.id !== id));
        router.push("?action=delete");
      } else {
        alert("Failed to delete content.");
      }
    } catch (err) {
      alert("An error occurred while deleting.");
    }
  };

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
          <h1 className="text-2xl font-bold text-slate-900 mb-1">My Uploads</h1>
          <p className="text-slate-500 text-sm">Manage and track your content.</p>
        </div>
        <Link 
          href="/user/upload?from=my-content" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Upload New
        </Link>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          {/* Tabs */}
          <div className="flex gap-6 text-sm font-medium text-slate-500 border-b border-slate-100">
            {tabs.map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`cursor-pointer pb-3 px-1 transition-colors ${
                  activeTab === tab 
                    ? "text-indigo-600 border-b-2 border-indigo-600" 
                    : "hover:text-slate-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Uploads List */}
        <div className="flex flex-col">
          {filteredContents.length === 0 ? (
            <div className="p-16 text-center text-slate-500 flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-400">
                <FileText size={32} />
              </div>
              <p className="font-medium text-slate-900 text-lg mb-1">No uploads found</p>
              <p className="text-sm">Try changing your filters or upload new content.</p>
            </div>
          ) : (
            filteredContents.map((upload) => (
              <div key={upload.id} className="flex items-center justify-between p-5 px-6 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-sm overflow-hidden relative shrink-0 ${
                    upload.type === 'PDF' ? 'bg-red-500' : 'bg-slate-100'
                  }`}>
                    {upload.type === 'PDF' && <FileText size={24} />}
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
                          <Play size={24} fill="currentColor" />
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-base font-bold text-slate-900 hover:text-indigo-600 cursor-pointer transition-colors">
                      <Link href={`/content/${upload.id}`}>{upload.title}</Link>
                    </h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-medium">
                      <span>{upload.type}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span>{upload.views || 0} views</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="w-24">
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                      upload.isVerified ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                    }`}>
                      {upload.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  <div className="w-28 text-right hidden md:block">
                    <span className="text-sm text-slate-500 font-medium">
                      {new Date(upload.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 border-l border-slate-100 pl-4 ml-2">
                    <Link href={`/content/${upload.id}`} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View">
                      <Eye size={18} />
                    </Link>
                    <Link href={`/user/edit/${upload.id}`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                      <Edit2 size={18} />
                    </Link>
                    <button 
                      onClick={() => handleDelete(upload.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                      <Trash2 size={18} />
                    </button>
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
