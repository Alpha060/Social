"use client";

import Link from "next/link";
import { Check, X, FileText, Image as ImageIcon, Video, Play, Loader2, Users, Eye, BarChart3, Clock, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface Stats {
  totalUsers: number;
  totalContent: number;
  pendingContent: number;
  verifiedContent: number;
  totalViews: number;
}

interface ContentItem {
  id: string;
  title: string;
  type: string;
  isVerified: boolean;
  isFeatured: boolean;
  views: number;
  createdAt: string;
  user: { id: string; name: string; email: string; avatar: string | null };
  category: { id: string; name: string } | null;
}

export default function AdminDashboard() {
  const { token, user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [pending, setPending] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (!token) return;
    fetchData();
  }, [token, authLoading, user, router]);

  const fetchData = async () => {
    try {
      const [statsRes, pendingRes] = await Promise.all([
        fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/pending", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const statsData = await statsRes.json();
      const pendingData = await pendingRes.json();
      setStats(statsData);
      setPending(pendingData.contents || []);
    } catch (err) {
      console.error("Failed to fetch admin data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: "verify" | "delete") => {
    setActionLoading(id);
    try {
      if (action === "verify") {
        await fetch(`/api/admin/content/${id}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "verify" }),
        });
      } else {
        await fetch(`/api/admin/content/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      // Refresh data
      await fetchData();
    } catch (err) {
      console.error("Action failed", err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Content", value: stats?.totalContent ?? 0, icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Verified", value: stats?.verifiedContent ?? 0, icon: Check, color: "text-green-600", bg: "bg-green-50" },
    { label: "Pending", value: stats?.pendingContent ?? 0, icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Total Views", value: stats?.totalViews ?? 0, icon: Eye, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "IMAGE": return <ImageIcon size={16} />;
      case "VIDEO": return <Play size={16} fill="currentColor" />;
      case "PDF": return <FileText size={16} />;
      default: return <FileText size={16} />;
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Overview of your platform activity</p>
        </div>
        <Link
          href="/admin/content-review"
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/10 active:scale-95"
        >
          Review Content
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{formatNumber(stat.value)}</h2>
              <p className="text-slate-400 text-xs font-semibold mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pending Approvals Table (Left 2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Pending Approvals</h3>
              <p className="text-xs text-slate-400 mt-0.5">{pending.length} items awaiting review</p>
            </div>
            <Link href="/admin/content-review?tab=pending" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
              View All →
            </Link>
          </div>
          
          {pending.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Check size={28} className="text-green-500" />
              </div>
              <p className="text-slate-500 font-semibold text-sm">All caught up!</p>
              <p className="text-slate-400 text-xs mt-1">No pending content to review.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Creator</th>
                    <th className="px-6 py-3.5">Content</th>
                    <th className="px-6 py-3.5">Type</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {pending.slice(0, 6).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs overflow-hidden">
                            {item.user.avatar ? (
                              <img src={item.user.avatar} alt={item.user.name} className="w-full h-full object-cover" />
                            ) : (
                              item.user.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <span className="font-semibold text-slate-800 text-xs">{item.user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/content/${item.id}`} className="text-slate-700 font-medium text-xs hover:text-indigo-600 transition-colors line-clamp-1">
                          {item.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-slate-500 text-xs">
                          {getTypeIcon(item.type)}
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">{item.category?.name || "—"}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {actionLoading === item.id ? (
                            <Loader2 size={16} className="animate-spin text-slate-400" />
                          ) : (
                            <>
                              <button
                                onClick={() => handleAction(item.id, "verify")}
                                className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors cursor-pointer"
                                title="Approve"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={() => handleAction(item.id, "delete")}
                                className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                                title="Reject"
                              >
                                <X size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Links Panel (Right col) */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
          </div>
          <div className="p-4 flex flex-col gap-3 flex-1">
            <Link href="/admin/content-review?tab=pending" className="flex items-center gap-3 p-4 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Clock size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Review Content</h4>
                <p className="text-xs text-slate-400">{pending.length} pending items</p>
              </div>
            </Link>
            <Link href="/admin/users" className="flex items-center gap-3 p-4 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Manage Users</h4>
                <p className="text-xs text-slate-400">{stats?.totalUsers ?? 0} registered users</p>
              </div>
            </Link>
            <Link href="/admin/categories" className="flex items-center gap-3 p-4 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BarChart3 size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Categories</h4>
                <p className="text-xs text-slate-400">Manage content categories</p>
              </div>
            </Link>
            <Link href="/admin/reports" className="flex items-center gap-3 p-4 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <TrendingUp size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Analytics</h4>
                <p className="text-xs text-slate-400">{formatNumber(stats?.totalViews ?? 0)} total views</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
