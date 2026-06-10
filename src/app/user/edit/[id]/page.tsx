"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle, ArrowLeft, Save } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditContent() {
  const { token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (res.ok && data.categories) {
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

  useEffect(() => {
    // Fetch existing content
    if (!id || !token) return;

    fetch(`/api/content/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.content) {
          setTitle(data.content.title || "");
          setDescription(data.content.description || "");
          setCategoryId(data.content.categoryId || "");
        }
        setIsLoadingContent(false);
      })
      .catch(() => {
        setIsLoadingContent(false);
        setMessage({ type: "error", text: "Failed to load content data." });
      });
  }, [id, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!title) {
      setMessage({ type: "error", text: "Title is required." });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/content/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, categoryId }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/user/my-content?action=edit");
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update content." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingContent) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <Link href="/user/my-content" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-6 font-medium w-fit">
        <ArrowLeft size={18} /> Back to My Uploads
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 mb-1">Edit Content</h1>
      <p className="text-slate-500 text-sm mb-8">Update the details and visibility of your content.</p>

      {message.text && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.type === 'success' && <CheckCircle size={20} />}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        
        <div className="space-y-6">
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
              rows={6}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all placeholder:text-slate-400 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end mt-8 pt-6 border-t border-slate-100">
          <button 
            type="submit"
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed text-white px-8 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </form>
    </div>
  );
}
