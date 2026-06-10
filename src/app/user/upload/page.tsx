"use client";

import { useState, useRef, useEffect } from "react";
import { Image as ImageIcon, Video, FileText, UploadCloud, Link as LinkIcon, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function UploadContent() {
  const { token } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<"image" | "video" | "pdf">("image");
  const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file");
  
  const [file, setFile] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (res.ok && data.categories) {
          // Ensure "Other" is always at the bottom of the list
          const sorted = data.categories.sort((a: any, b: any) => {
            if (a.name === "Other") return 1;
            if (b.name === "Other") return -1;
            return a.name.localeCompare(b.name);
          });
          setCategories(sorted);
        }
      } catch (err) {
        console.error("Failed to fetch categories");
      }
    };
    fetchCategories();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage({ type: "", text: "" });
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Enforce 100MB limit for videos
      if (selectedFile.type.startsWith("video/") && selectedFile.size > 100 * 1024 * 1024) {
        setMessage({ type: "error", text: "Video file exceeds the 100MB maximum size limit." });
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!title) {
      setMessage({ type: "error", text: "Title is required." });
      return;
    }

    if (!categoryId) {
      setMessage({ type: "error", text: "Please select a category." });
      return;
    }

    if (uploadMethod === "file" && !file) {
      setMessage({ type: "error", text: "Please select a file to upload." });
      return;
    }

    if (uploadMethod === "url" && !linkUrl) {
      setMessage({ type: "error", text: "Please provide a valid URL." });
      return;
    }

    setIsSubmitting(true);

    try {
      let finalLinkUrl = linkUrl;

      if (uploadMethod === "file" && file) {
        setMessage({ type: "info", text: "Uploading file to storage..." });
        
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExt}`;
        
        let folder = 'images';
        if (file.type.startsWith('video/')) folder = 'videos';
        else if (file.type === 'application/pdf') folder = 'pdfs';
        
        const filePath = `${folder}/${fileName}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('content-bucket')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (uploadError) {
          console.error("Supabase upload error:", uploadError);
          setMessage({ type: "error", text: "Failed to upload file to storage bucket. Please ensure the bucket exists." });
          setIsSubmitting(false);
          return;
        }
        
        const { data: publicUrlData } = supabase.storage
          .from('content-bucket')
          .getPublicUrl(filePath);
          
        finalLinkUrl = publicUrlData.publicUrl;
      }

      setMessage({ type: "info", text: "Saving content details..." });

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      if (categoryId) formData.append("categoryId", categoryId);
      
      const typeMap = { image: "IMAGE", video: "VIDEO", pdf: "PDF" };
      formData.append("type", typeMap[activeTab]);
      formData.append("linkUrl", finalLinkUrl);

      const res = await fetch("/api/content", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Content uploaded successfully!" });
        // Reset form
        setFile(null);
        setLinkUrl("");
        setTitle("");
        setDescription("");
        setCategoryId("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        
        const searchParams = new URLSearchParams(window.location.search);
        const from = searchParams.get("from") === "my-content" ? "my-content" : "dashboard";
        router.push(`/user/${from}?success=true`);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to upload content." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Upload New Content</h1>
      <p className="text-slate-500 text-sm mb-8">Share your knowledge and creativity with the world.</p>

      {message.text && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 
          message.type === 'error' ? 'bg-red-50 text-red-700' :
          'bg-blue-50 text-blue-700'
        }`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <Loader2 size={20} className={message.type === 'info' ? "animate-spin" : ""} />}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        
        {/* Tabs */}
        <div className="flex gap-8 mb-8 border-b border-slate-100 px-2">
          <button 
            type="button"
            className={`flex items-center gap-2 pb-4 font-medium text-sm transition-colors relative ${activeTab === 'image' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
            onClick={() => { setActiveTab('image'); setFile(null); }}
          >
            <ImageIcon size={18} /> Image
            {activeTab === 'image' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600" />}
          </button>
          <button 
            type="button"
            className={`flex items-center gap-2 pb-4 font-medium text-sm transition-colors relative ${activeTab === 'video' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
            onClick={() => { setActiveTab('video'); setFile(null); }}
          >
            <Video size={18} /> Video (MP4)
            {activeTab === 'video' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600" />}
          </button>
          <button 
            type="button"
            className={`flex items-center gap-2 pb-4 font-medium text-sm transition-colors relative ${activeTab === 'pdf' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
            onClick={() => { setActiveTab('pdf'); setFile(null); setUploadMethod("file"); }}
          >
            <FileText size={18} /> PDF
            {activeTab === 'pdf' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600" />}
          </button>
        </div>

        {/* Upload Method Toggle (Images/Videos Only) */}
        {activeTab !== 'pdf' && (
          <div className="flex gap-4 mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="uploadMethod" 
                checked={uploadMethod === "file"} 
                onChange={() => setUploadMethod("file")}
                className="text-indigo-600 focus:ring-indigo-600"
              />
              <span className="text-sm font-medium text-slate-700">Upload File</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="uploadMethod" 
                checked={uploadMethod === "url"} 
                onChange={() => setUploadMethod("url")}
                className="text-indigo-600 focus:ring-indigo-600"
              />
              <span className="text-sm font-medium text-slate-700">Provide URL</span>
            </label>
          </div>
        )}

        {/* Upload Area */}
        {uploadMethod === "file" ? (
          <div 
            className="border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center py-16 mb-8 transition-colors hover:bg-slate-100/50 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange}
              accept={
                activeTab === 'image' ? "image/*" : 
                activeTab === 'video' ? "video/mp4,video/webm" : 
                "application/pdf"
              }
            />
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
              <UploadCloud size={32} className={file ? "text-indigo-600" : "text-slate-400"} />
            </div>
            <p className="text-slate-700 font-medium mb-2">
              {file ? file.name : "Drag & drop your file here"}
            </p>
            <p className="text-slate-400 text-sm mb-4">{file ? "Click to change file" : "or"}</p>
            {!file && (
              <button type="button" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors mb-4">
                Browse Files
              </button>
            )}
            <p className="text-xs text-slate-400">
              {activeTab === 'image' && "PNG, JPG, GIF up to 10MB"}
              {activeTab === 'video' && "MP4, WebM up to 100MB"}
              {activeTab === 'pdf' && "PDF up to 50MB"}
            </p>
          </div>
        ) : (
          <div className="mb-8">
            <label className="block text-sm font-bold text-slate-900 mb-2">Direct URL</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <LinkIcon size={18} className="text-slate-400" />
              </div>
              <input 
                type="url" 
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder={`https://example.com/path/to/${activeTab}`} 
                className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">The content will be fetched and displayed from this URL everywhere on the platform.</p>
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Title <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title" 
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Category <span className="text-red-500">*</span></label>
            <div className="relative">
              <select 
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={`w-full border border-slate-200 rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all bg-white ${categoryId === "" ? "text-slate-400" : "text-slate-900"}`}
              >
                <option value="" disabled>Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell something about your content..." 
              rows={4}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all placeholder:text-slate-400 resize-none"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-8">
          <button 
            type="submit"
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed text-white px-8 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            {isSubmitting ? "Uploading..." : "Upload"}
          </button>
        </div>

      </form>
    </div>
  );
}
