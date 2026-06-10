"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Edit3, FileText, Play, Image as ImageIcon, Loader2 } from "lucide-react";
import { FaYoutube, FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function UserProfile() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState("about");
  
  const [uploads, setUploads] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (!token) return;
    
    setLoadingData(true);
    // Fetch uploads
    fetch('/api/content', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { if (data.contents) setUploads(data.contents); })
      .catch(console.error);

    // Fetch bookmarks
    fetch('/api/profile/bookmarks', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { if (data.bookmarks) setBookmarks(data.bookmarks); })
      .catch(console.error)
      .finally(() => setLoadingData(false));
  }, [token]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Cover Image */}
        <div className="h-48 md:h-64 bg-slate-200 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80" />
        </div>

        {/* Profile Info Section */}
        <div className="px-8 pb-8">
          
          <div className="flex justify-between items-start">
            {/* Avatar & Basic Info */}
            <div className="flex gap-6 -mt-16 relative z-10">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-sm flex items-center justify-center bg-slate-800 text-white text-4xl font-bold">
                 {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              
              <div className="mt-20">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
                  {user.role === 'ADMIN' && (
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle size={10} /> Admin
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-sm mt-1 max-w-md">
                  {user.bio || "No bio added yet."}
                </p>
                
                {/* Social Icons Quick Row */}
                <div className="flex gap-3 mt-4">
                  {user.twitter && <FaTwitter size={18} className="text-blue-400 cursor-pointer hover:opacity-80 transition-opacity" />}
                  {user.youtube && <FaYoutube size={18} className="text-red-500 cursor-pointer hover:opacity-80 transition-opacity" />} 
                  {user.instagram && <FaInstagram size={18} className="text-pink-500 cursor-pointer hover:opacity-80 transition-opacity" />}
                  {user.linkedin && <FaLinkedin size={18} className="text-blue-700 cursor-pointer hover:opacity-80 transition-opacity" />}
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <div className="mt-4">
              <Link href="/user/settings" className="border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <Edit3 size={16} />
                Edit Profile
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-8 mt-10 border-b border-slate-100">
            <button 
              className={`cursor-pointer pb-3 font-medium text-sm transition-colors relative ${activeTab === 'about' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
              onClick={() => setActiveTab('about')}
            >
              About
              {activeTab === 'about' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600" />}
            </button>
            <button 
              className={`cursor-pointer pb-3 font-medium text-sm transition-colors relative ${activeTab === 'uploads' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
              onClick={() => setActiveTab('uploads')}
            >
              Uploads ({uploads.length})
              {activeTab === 'uploads' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600" />}
            </button>
            <button 
              className={`cursor-pointer pb-3 font-medium text-sm transition-colors relative ${activeTab === 'bookmarks' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
              onClick={() => setActiveTab('bookmarks')}
            >
              Bookmarks ({bookmarks.length})
              {activeTab === 'bookmarks' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600" />}
            </button>
          </div>

          {/* Tab Content - About */}
          {activeTab === 'about' && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-12">
              
              {/* Left Column: Personal Details */}
              <div className="space-y-6">
                <div className="grid grid-cols-3">
                  <span className="text-sm font-bold text-slate-900 col-span-1">Full Name</span>
                  <span className="text-sm text-slate-500 col-span-2">{user.name}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-sm font-bold text-slate-900 col-span-1">Email</span>
                  <span className="text-sm text-slate-500 col-span-2">{user.email}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-sm font-bold text-slate-900 col-span-1">Bio</span>
                  <span className="text-sm text-slate-500 col-span-2">{user.bio || "No bio added yet."}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-sm font-bold text-slate-900 col-span-1">Member Since</span>
                  <span className="text-sm text-slate-500 col-span-2">
                    {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Right Column: Social Links */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-4">Social Links</h3>
                <div className="space-y-4">
                  {!user.youtube && !user.instagram && !user.twitter && !user.linkedin && (
                    <p className="text-sm text-slate-500">No social links added yet.</p>
                  )}
                  {user.youtube && (
                    <div className="flex items-center gap-3">
                      <FaYoutube size={18} className="text-red-500" />
                      <span className="text-sm text-slate-500 w-32">YouTube Channel</span>
                      <a href={user.youtube} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 hover:underline">View Profile</a>
                    </div>
                  )}
                  {user.instagram && (
                    <div className="flex items-center gap-3">
                      <FaInstagram size={18} className="text-pink-500" />
                      <span className="text-sm text-slate-500 w-32">Instagram</span>
                      <a href={user.instagram} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 hover:underline">View Profile</a>
                    </div>
                  )}
                  {user.twitter && (
                    <div className="flex items-center gap-3">
                      <FaTwitter size={18} className="text-blue-400" />
                      <span className="text-sm text-slate-500 w-32">Twitter</span>
                      <a href={user.twitter} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 hover:underline">View Profile</a>
                    </div>
                  )}
                  {user.linkedin && (
                    <div className="flex items-center gap-3">
                      <FaLinkedin size={18} className="text-blue-700" />
                      <span className="text-sm text-slate-500 w-32">LinkedIn</span>
                      <a href={user.linkedin} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 hover:underline">View Profile</a>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* Tab Content - Uploads */}
          {activeTab === 'uploads' && (
            <div className="mt-8">
              {loadingData ? (
                <div className="py-8 text-center"><Loader2 className="animate-spin inline-block text-indigo-600" size={24}/></div>
              ) : uploads.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No uploads found.</p>
              ) : (
                <div className="space-y-4">
                  {uploads.map(upload => (
                    <div key={upload.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${
                          upload.type === 'PDF' ? 'bg-red-500' : upload.type === 'VIDEO' ? 'bg-slate-800' : 'bg-slate-800'
                        }`}>
                          {upload.type === 'PDF' && <FileText size={18} />}
                          {upload.type === 'IMAGE' && <ImageIcon size={18} />}
                          {upload.type === 'VIDEO' && <Play size={18} fill="currentColor" />}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{upload.title}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{upload.type}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        upload.isVerified ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                      }`}>
                        {upload.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                  ))}
                  <div className="text-center pt-4">
                    <Link href="/user/my-content" className="text-sm text-indigo-600 font-medium hover:underline">View all in My Uploads</Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab Content - Bookmarks */}
          {activeTab === 'bookmarks' && (
            <div className="mt-8">
              {loadingData ? (
                <div className="py-8 text-center"><Loader2 className="animate-spin inline-block text-indigo-600" size={24}/></div>
              ) : bookmarks.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No bookmarks yet.</p>
              ) : (
                <div className="space-y-4">
                  {bookmarks.map(bookmark => {
                    const content = bookmark.content;
                    if (!content) return null;
                    return (
                      <div key={bookmark.id} className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 ${
                          content.type === 'PDF' ? 'bg-red-500' : content.type === 'VIDEO' ? 'bg-slate-800' : 'bg-slate-800'
                        }`}>
                          {content.type === 'PDF' && <FileText size={18} />}
                          {content.type === 'IMAGE' && <ImageIcon size={18} />}
                          {content.type === 'VIDEO' && <Play size={18} fill="currentColor" />}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{content.title}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">By {content.user?.name || 'Unknown'}</p>
                        </div>
                      </div>
                    )
                  })}
                  <div className="text-center pt-4">
                    <Link href="/user/bookmarks" className="text-sm text-indigo-600 font-medium hover:underline">View all Bookmarks</Link>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
