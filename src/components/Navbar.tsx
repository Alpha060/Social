"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { PlaySquare, Menu, X, ChevronDown, LogOut, Home, User, Settings, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close mobile menu on pathname change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "All Contents", href: "/content" },
    { name: "Categories", href: "/#categories" },
    { name: "About", href: "/#about" },
  ];

  const dashboardUrl = user?.role === "ADMIN" ? "/admin/dashboard" : "/user/dashboard";

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/75 backdrop-blur-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04),_0_4px_6px_-2px_rgba(0,0,0,0.02)] transition-all duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-8 relative">
        
        {/* Left Side: Menu + Logo */}
        <div className="flex items-center gap-3 md:gap-0">
          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-xl border border-slate-200 bg-white p-1.5 text-slate-600 transition-all hover:bg-slate-50 shadow-sm"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Brand/Logo */}
          <Link href="/" className="flex items-center gap-2 group md:ml-0 ml-1">
            <div className="bg-indigo-600 text-white p-1.5 rounded-xl transition-transform duration-300 group-hover:scale-105 shadow-md shadow-indigo-600/10">
              <PlaySquare size={20} />
            </div>
            <span className="font-extrabold text-xl text-slate-900 tracking-tight transition-colors duration-200 group-hover:text-indigo-600">
              ShowCase
            </span>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative py-1 transition-colors hover:text-slate-950 duration-200 ${
                  isActive ? "text-indigo-600 font-bold" : ""
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-indigo-600 transition-all duration-300" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Auth Section (Desktop + Mobile) */}
        <div className="flex items-center gap-3 md:gap-4 text-sm font-semibold">
          {loading ? (
            <div className="h-9 w-20 animate-pulse rounded-xl bg-slate-200" />
          ) : user ? (
            /* User Dropdown */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 rounded-xl border border-slate-200/60 bg-white p-1.5 pr-3 pl-2.5 text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700 shadow-inner">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="h-full w-full rounded-lg object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="max-w-[100px] truncate text-xs font-bold">{user.name.split(" ")[0]}</span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-56 origin-top-right rounded-2xl border border-slate-100 bg-white p-2 shadow-xl ring-1 ring-black/5 focus:outline-none transition-all duration-200">
                  <div className="px-3 py-2.5 border-b border-slate-50 mb-1.5">
                    <p className="text-xs font-semibold text-slate-400">Signed in as</p>
                    <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                    <p className="text-[11px] font-medium text-slate-400 truncate">{user.email}</p>
                  </div>

                  <Link
                    href={dashboardUrl}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
                  >
                    <LayoutDashboard size={15} className="text-slate-400" />
                    Dashboard
                  </Link>

                  <Link
                    href="/user/profile"
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
                  >
                    <User size={15} className="text-slate-400" />
                    Profile Settings
                  </Link>

                  <Link
                    href="/user/settings"
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
                  >
                    <Settings size={15} className="text-slate-400" />
                    Account Settings
                  </Link>

                  <div className="my-1.5 border-t border-slate-50" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <LogOut size={15} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Login & Sign Up */
            <>
              <Link href="/login" className="hidden md:block text-slate-600 hover:text-slate-900 transition-colors py-2 px-3">
                Login
              </Link>
              <Link
                href="/register"
                className="hidden md:flex bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-95 duration-200"
              >
                Sign Up
              </Link>
              <Link href="/login" className="md:hidden text-indigo-600 text-xs sm:text-sm font-bold bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 shadow-sm">
                Login
              </Link>
            </>
          )}
        </div>
      </div>

      </header>

      {/* Mobile Sidebar Backdrop */}
      <div 
        className={`fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-[70] w-64 bg-white shadow-2xl transition-transform duration-300 ease-in-out md:hidden flex flex-col ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2 group" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="bg-indigo-600 text-white p-1.5 rounded-xl shadow-sm">
              <PlaySquare size={18} />
            </div>
            <span className="font-extrabold text-lg text-slate-900 tracking-tight">ShowCase</span>
          </Link>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 text-slate-400 bg-slate-50 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-col gap-2 p-5 flex-1 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-sm font-semibold rounded-xl px-4 py-3 transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600 font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          
          <div className="my-4 border-t border-slate-100" />
          
          {!user && !loading && (
            <div className="flex flex-col gap-3 mt-2">
              <Link
                href="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex justify-center rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/10 transition-colors"
              >
                Create an Account
              </Link>
            </div>
          )}
        </nav>
      </div>
    </>
  );
}
