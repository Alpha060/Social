"use client";

import Link from "next/link";
import { PlaySquare, EyeOff, Eye, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.role === 'ADMIN') {
        router.push("/admin/dashboard");
      } else {
        router.push("/user/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#f5f5f7] font-sans antialiased">
      
      {/* Top Header Placeholder for Apple Alignment */}
      <div className="h-14 w-full flex items-center justify-between px-8 bg-white/70 backdrop-blur-md border-b border-slate-200/40">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-indigo-600 text-white p-1.5 rounded-xl transition-transform duration-300 group-hover:scale-105 shadow-md shadow-indigo-600/10">
            <PlaySquare size={18} />
          </div>
          <span className="font-extrabold text-base text-slate-900 tracking-tight transition-colors duration-200 group-hover:text-indigo-600">ShowCase</span>
        </Link>
        <Link href="/" className="text-xs font-semibold text-[#0071e3] hover:underline">
          Back to Home
        </Link>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[460px] bg-white rounded-3xl border border-slate-200/60 p-8 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.04)]">
          
          {/* Logo & Headline */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="bg-indigo-600 text-white p-2.5 rounded-2xl shadow-md shadow-indigo-600/10 mb-4">
              <PlaySquare size={26} />
            </div>
            <h2 className="text-3xl font-extrabold text-[#1d1d1f] tracking-tight mb-2">Sign in to ShowCase</h2>
            <p className="text-[#86868b] text-sm font-medium">Discover. Learn. Get Inspired.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-semibold border border-red-100 flex items-center gap-2">
              <span className="text-sm">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[11px] font-bold text-[#86868b] uppercase tracking-wider mb-2 ml-1">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com" 
                required
                className="w-full border border-slate-200 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-[#0071e3]/10 focus:border-[#0071e3] bg-[#fbfbfd] text-[#1d1d1f] transition-all placeholder:text-slate-400 font-medium"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[11px] font-bold text-[#86868b] uppercase tracking-wider ml-1">Password</label>
                <a href="#" className="text-xs font-semibold text-[#0071e3] hover:underline mr-1">Forgot?</a>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  required
                  className="w-full border border-slate-200 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-[#0071e3]/10 focus:border-[#0071e3] bg-[#fbfbfd] text-[#1d1d1f] transition-all placeholder:text-slate-400 font-medium"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#1d1d1f] hover:bg-black active:scale-[0.98] text-white py-3.5 rounded-full font-bold transition-all shadow-md shadow-slate-900/10 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed mt-8 text-sm cursor-pointer"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Social Divider */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="h-px bg-slate-100 flex-1"></div>
            <span className="text-[11px] text-[#86868b] font-bold uppercase tracking-wider">Or connect with</span>
            <div className="h-px bg-slate-100 flex-1"></div>
          </div>

          {/* Social Logins */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <button className="flex-1 flex items-center justify-center rounded-2xl border border-slate-200/80 bg-white py-3 shadow-sm hover:bg-[#f5f5f7] transition-all cursor-pointer">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </button>
            <button className="flex-1 flex items-center justify-center rounded-2xl border border-slate-200/80 bg-white py-3 shadow-sm hover:bg-[#f5f5f7] transition-all cursor-pointer" aria-label="Apple sign in">
              <svg className="w-5 h-5 fill-[#1d1d1f]" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.05 2.53.68 3.14.68.61 0 1.95-.76 3.47-.64 1.39.06 2.65.65 3.45 1.77-2.98 1.64-2.51 5.31.25 6.43-.65 1.72-1.55 3.32-2.31 4.73zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.38-2.02 4.31-3.74 4.25z"/>
              </svg>
            </button>
          </div>

          <p className="text-center mt-10 text-xs font-semibold text-[#86868b]">
            New to ShowCase? <Link href="/register" className="text-[#0071e3] font-bold hover:underline">Create an Account</Link>
          </p>

        </div>
      </div>

      {/* Footer Block */}
      <div className="py-6 w-full text-center text-[10px] font-bold text-[#86868b] border-t border-slate-200/40 bg-white/40">
        © {new Date().getFullYear()} ShowCase. Built with Apple ID styling principles.
      </div>
    </div>
  );
}
