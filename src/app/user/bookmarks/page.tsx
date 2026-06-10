"use client";

import { FileText, Image as ImageIcon, Play, Loader2, Bookmark as BookmarkIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function BookmarksPage() {
  const { token } = useAuth();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    
    fetch('/api/profile/bookmarks', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data.bookmarks) {
        setBookmarks(data.bookmarks);
      }
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">My Bookmarks</h1>
          <p className="text-slate-500 text-sm">Content you've saved for later.</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex flex-col">
          {bookmarks.length === 0 ? (
            <div className="p-16 text-center text-slate-500 flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-400">
                <BookmarkIcon size={32} />
              </div>
              <p className="font-medium text-slate-900 text-lg mb-1">No bookmarks yet</p>
              <p className="text-sm">When you bookmark content, it will appear here.</p>
            </div>
          ) : (
            bookmarks.map((bookmark) => {
              const content = bookmark.content;
              if (!content) return null;
              
              return (
                <div key={bookmark.id} className="flex items-center justify-between p-5 px-6 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-sm ${
                      content.type === 'PDF' ? 'bg-red-500' : 
                      content.type === 'VIDEO' ? 'bg-slate-800' : 'bg-slate-800'
                    }`}>
                      {content.type === 'PDF' && <FileText size={24} />}
                      {content.type === 'IMAGE' && <ImageIcon size={24} />}
                      {content.type === 'VIDEO' && <Play size={24} fill="currentColor" />}
                    </div>
                    
                    <div>
                      <h4 className="text-base font-bold text-slate-900 hover:text-indigo-600 cursor-pointer transition-colors">{content.title}</h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-medium">
                        <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{content.type}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span>{content.user?.name || "Unknown User"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-10">
                    <div className="w-32 text-right">
                      <span className="text-sm text-slate-500 font-medium">
                        {new Date(bookmark.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  );
}
