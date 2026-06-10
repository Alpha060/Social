"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Eye, FileText, Image as ImageIcon, Play, TrendingUp, Users, BarChart3, PieChart } from "lucide-react";

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
  views: number;
  isVerified: boolean;
  isFeatured: boolean;
  createdAt: string;
  user: { id: string; name: string; avatar: string | null };
  category: { name: string } | null;
}

interface UserItem {
  id: string;
  name: string;
  avatar: string | null;
  _count: { contents: number };
}

export default function AdminReportsPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [allContent, setAllContent] = useState<ContentItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const [statsRes, contentRes, usersRes] = await Promise.all([
        fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/content", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const statsData = await statsRes.json();
      const contentData = await contentRes.json();
      const usersData = await usersRes.json();
      setStats(statsData);
      setAllContent(contentData.contents || []);
      setUsers(usersData.users || []);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  // Compute analytics
  const imageCount = allContent.filter((c) => c.type === "IMAGE").length;
  const videoCount = allContent.filter((c) => c.type === "VIDEO").length;
  const pdfCount = allContent.filter((c) => c.type === "PDF").length;
  const total = allContent.length || 1;

  const topContent = [...allContent].sort((a, b) => b.views - a.views).slice(0, 5);
  const topCreators = [...users].sort((a, b) => b._count.contents - a._count.contents).slice(0, 5);

  // Category distribution
  const categoryMap: Record<string, number> = {};
  allContent.forEach((c) => {
    const cat = c.category?.name || "Uncategorized";
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });
  const categoryDistribution = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const barColors = ["bg-indigo-500", "bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-cyan-500", "bg-teal-500", "bg-orange-500", "bg-yellow-500"];

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
        <p className="text-sm text-slate-400 mt-1">Platform insights and performance metrics</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Verification Rate</p>
          <p className="text-2xl font-extrabold text-slate-900">
            {stats?.totalContent ? Math.round((stats.verifiedContent / stats.totalContent) * 100) : 0}%
          </p>
          <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${stats?.totalContent ? (stats.verifiedContent / stats.totalContent) * 100 : 0}%` }}
            />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Avg Views/Content</p>
          <p className="text-2xl font-extrabold text-slate-900">
            {formatNumber(stats?.totalContent ? Math.round(stats.totalViews / stats.totalContent) : 0)}
          </p>
          <p className="text-xs text-slate-400 mt-2">{formatNumber(stats?.totalViews ?? 0)} total views</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Content/User</p>
          <p className="text-2xl font-extrabold text-slate-900">
            {stats?.totalUsers ? (stats.totalContent / stats.totalUsers).toFixed(1) : 0}
          </p>
          <p className="text-xs text-slate-400 mt-2">{stats?.totalUsers ?? 0} users</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Pending Queue</p>
          <p className="text-2xl font-extrabold text-orange-600">{stats?.pendingContent ?? 0}</p>
          <p className="text-xs text-slate-400 mt-2">items to review</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Type Distribution */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-5 flex items-center gap-2">
            <PieChart size={16} className="text-indigo-600" /> Content by Type
          </h3>
          <div className="space-y-4">
            {[
              { label: "Images", count: imageCount, color: "bg-blue-500", icon: <ImageIcon size={14} /> },
              { label: "Videos", count: videoCount, color: "bg-yellow-500", icon: <Play size={14} fill="currentColor" /> },
              { label: "PDFs", count: pdfCount, color: "bg-red-500", icon: <FileText size={14} /> },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${item.color}/10 flex items-center justify-center text-sm`}>
                  <span className={item.color.replace("bg-", "text-")}>{item.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-700">{item.label}</span>
                    <span className="text-xs font-bold text-slate-500">{item.count} ({Math.round((item.count / total) * 100)}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${(item.count / total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-5 flex items-center gap-2">
            <BarChart3 size={16} className="text-indigo-600" /> Content by Category
          </h3>
          {categoryDistribution.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No data available</p>
          ) : (
            <div className="space-y-3">
              {categoryDistribution.map(([name, count], idx) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-600 w-24 truncate">{name}</span>
                  <div className="flex-1 h-6 bg-slate-50 rounded-lg overflow-hidden relative">
                    <div
                      className={`h-full ${barColors[idx % barColors.length]} rounded-lg transition-all duration-500 flex items-center justify-end pr-2`}
                      style={{ width: `${Math.max((count / (categoryDistribution[0]?.[1] || 1)) * 100, 10)}%` }}
                    >
                      <span className="text-[10px] font-bold text-white">{count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Content by Views */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp size={16} className="text-indigo-600" /> Top Content by Views
            </h3>
          </div>
          <div className="divide-y divide-slate-50">
            {topContent.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">No content yet</div>
            ) : (
              topContent.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50/50 transition-colors">
                  <span className="text-xs font-extrabold text-slate-300 w-5 text-center">#{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{item.title}</p>
                    <p className="text-xs text-slate-400">{item.user.name} • {item.category?.name || "No category"}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-slate-900">{formatNumber(item.views)}</p>
                    <p className="text-[10px] text-slate-400">views</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Creators */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users size={16} className="text-indigo-600" /> Top Creators
            </h3>
          </div>
          <div className="divide-y divide-slate-50">
            {topCreators.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">No users yet</div>
            ) : (
              topCreators.map((u, idx) => (
                <div key={u.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50/50 transition-colors">
                  <span className="text-xs font-extrabold text-slate-300 w-5 text-center">#{idx + 1}</span>
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs overflow-hidden shrink-0">
                    {u.avatar ? (
                      <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                    ) : (
                      u.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{u.name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-slate-900">{u._count.contents}</p>
                    <p className="text-[10px] text-slate-400">uploads</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
