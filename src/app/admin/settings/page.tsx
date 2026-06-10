"use client";

import { useAuth } from "@/context/AuthContext";
import { Shield, User, Mail, Calendar, Globe, Info } from "lucide-react";

export default function AdminSettingsPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Admin profile and platform configuration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Admin Profile Card */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-2xl overflow-hidden mb-4 shadow-inner">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0).toUpperCase()
            )}
          </div>
          <h3 className="text-lg font-bold text-slate-900">{user?.name}</h3>
          <p className="text-sm text-slate-400 mt-0.5">{user?.email}</p>
          <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold">
            <Shield size={12} /> Administrator
          </span>
          <p className="text-xs text-slate-400 mt-4">
            Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—"}
          </p>
        </div>

        {/* Account Details */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-6">Account Information</h3>
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/50 border border-slate-100/50">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <User size={18} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{user?.name || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/50 border border-slate-100/50">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                <Mail size={18} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{user?.email || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/50 border border-slate-100/50">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Shield size={18} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{user?.role || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/50 border border-slate-100/50">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Calendar size={18} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Member Since</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Info size={16} className="text-indigo-600" /> Platform Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100/50">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Platform Name</p>
            <p className="text-sm font-bold text-slate-900 mt-1">ShowCase</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100/50">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Version</p>
            <p className="text-sm font-bold text-slate-900 mt-1">1.0.0</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100/50">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Framework</p>
            <p className="text-sm font-bold text-slate-900 mt-1">Next.js + Prisma</p>
          </div>
        </div>
      </div>
    </div>
  );
}
