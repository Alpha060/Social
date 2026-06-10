import Link from "next/link";
import { PlaySquare, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-800 bg-slate-950 py-12 md:py-16 mt-auto">
      <div className="mx-auto max-w-7xl px-8">
        
        {/* Footer Top Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8 pb-12 border-b border-slate-800/60">
          
          {/* Brand/Logo column */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div className="bg-indigo-500/20 text-indigo-400 p-1.5 rounded-xl transition-transform duration-300 group-hover:scale-105">
                <PlaySquare size={18} />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight transition-colors duration-200">
                ShowCase
              </span>
            </Link>
            <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-[200px]">
              Discover, learn, and get inspired by verified creations from makers around the world.
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="col-span-1 flex flex-col gap-3.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Explore</h4>
            <ul className="flex flex-col gap-2.5 text-xs font-semibold text-slate-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/content" className="hover:text-white transition-colors">All Content</Link>
              </li>
              <li>
                <Link href="/#categories" className="hover:text-white transition-colors">Popular Categories</Link>
              </li>
              <li>
                <Link href="/#about" className="hover:text-white transition-colors">About Us</Link>
              </li>
            </ul>
          </div>

          {/* Portal Links Column */}
          <div className="col-span-1 flex flex-col gap-3.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Portal</h4>
            <ul className="flex flex-col gap-2.5 text-xs font-semibold text-slate-400">
              <li>
                <Link href="/login" className="hover:text-white transition-colors">Login</Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">Register</Link>
              </li>
              <li>
                <Link href="/user/dashboard" className="hover:text-white transition-colors">Creator Dashboard</Link>
              </li>
              <li>
                <Link href="/user/upload" className="hover:text-white transition-colors">Upload Content</Link>
              </li>
            </ul>
          </div>

          {/* Social Links Column */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-3.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Connect</h4>
            <div className="flex gap-3 items-center mt-1">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-300 hover:bg-indigo-600 hover:text-white transition-all shadow-sm" aria-label="Github">
                <svg className="w-[16px] h-[16px] fill-currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-300 hover:bg-indigo-600 hover:text-white transition-all shadow-sm" aria-label="Twitter">
                <svg className="w-[14px] h-[14px] fill-currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-300 hover:bg-indigo-600 hover:text-white transition-all shadow-sm" aria-label="LinkedIn">
                <svg className="w-[14px] h-[14px] fill-currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-300 hover:bg-indigo-600 hover:text-white transition-all shadow-sm" aria-label="Youtube">
                <svg className="w-[16px] h-[16px] fill-currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.507a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.507 9.388.507 9.388.507s7.517 0 9.388-.507a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-2">
              For support or business inquiries, contact support@showcase.com
            </p>
          </div>

        </div>

        {/* Footer Bottom Block */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 gap-4">
          <p className="text-[11px] font-semibold text-slate-500">
            © {new Date().getFullYear()} ShowCase. All rights reserved.
          </p>
          <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            Made with <Heart size={10} className="text-indigo-500 fill-indigo-500" /> by Verified Creators.
          </p>
        </div>

      </div>
    </footer>
  );
}
