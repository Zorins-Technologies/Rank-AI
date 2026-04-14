"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/dashboard", label: "Projects" },
  { href: "/generate", label: "Studio" },
  { href: "/keywords", label: "Research" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="fixed top-6 left-0 right-0 z-50 px-4 sm:px-6 pointer-events-none">
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto glass-card bg-slate-950/60 pointer-events-auto"
      >
        <div className="px-5 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <span className="text-lg font-display font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors hidden sm:block">
              RankAI
            </span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <div className="hidden md:flex items-center bg-slate-900/50 rounded-xl p-1 border border-white/5 mr-2">
              {navItems.map(({ href, label }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`relative px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? "text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span className="relative z-10">{label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute inset-0 bg-white/10 rounded-lg"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {user ? (
                <motion.div 
                  key="user-actions"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-3"
                >
                  <Link href="/dashboard" className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors group">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border border-white/10 flex items-center justify-center text-xs font-bold text-white overflow-hidden shadow-inner">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        user.email?.[0]?.toUpperCase() || "U"
                      )}
                    </div>
                    <span className="hidden lg:block text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                      {user.displayName || user.email?.split("@")[0]}
                    </span>
                  </Link>
                  <button 
                    onClick={logout}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    aria-label="Logout"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="auth-actions"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-3"
                >
                  <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-2 py-2">
                    Log in
                  </Link>
                  <Link href="/signup" className="btn-brand !py-2 !px-4 text-sm !rounded-lg">
                    Get Started
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.nav>
    </div>
  );
}
