"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  PlaySquare, 
  Home, 
  LayoutDashboard,
  UploadCloud, 
  User, 
  Bookmark, 
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

const mainNavItems = [
  { name: "Public Home", href: "/", icon: Home },
  { name: "Dashboard", href: "/user/dashboard", icon: LayoutDashboard },
  { name: "My Uploads", href: "/user/my-content", icon: UploadCloud },
  { name: "Profile", href: "/user/profile", icon: User },
  { name: "Bookmarks", href: "/user/bookmarks", icon: Bookmark },
  { name: "Settings", href: "/user/settings", icon: Settings },
];


export default function UserSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center gap-3 p-4 bg-white border-b border-slate-100 shrink-0 relative z-40 shadow-sm">
        <button onClick={() => setIsOpen(true)} className="p-1.5 text-slate-600 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors shadow-sm">
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
            <PlaySquare size={18} />
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">ShowCase</span>
        </div>
      </div>

      {/* Sidebar Backdrop for Mobile */}
      <div 
        className={`fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`} 
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Content */}
      <div className={`fixed inset-y-0 left-0 z-[70] w-64 bg-white border-r border-slate-100 flex flex-col py-6 px-4 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between md:mb-10 mb-6 px-2">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-1 rounded-lg hidden md:block">
              <PlaySquare size={20} />
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight hidden md:block">ShowCase</span>
            
            {/* Mobile Sidebar Title */}
            <span className="font-bold text-lg text-slate-900 tracking-tight md:hidden">Menu</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden p-2 text-slate-500 bg-slate-50 rounded-xl hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

      <nav className="flex-1 flex flex-col gap-1">
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm ${
                isActive 
                  ? "bg-indigo-50 text-indigo-600" 
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <item.icon size={18} className={isActive ? "text-indigo-600" : "text-slate-400"} />
              {item.name}
            </Link>
          );
        })}
        
        <div className="mt-auto pt-8">
          <button
            onClick={handleLogout}
            className="cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm text-red-500 hover:bg-red-50"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </nav>
      </div>
    </>
  );
}
