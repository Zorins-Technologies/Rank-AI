"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { auth, googleProvider } from "../../lib/firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const loadingToast = toast.loading("Authenticating...");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Welcome back!", { id: loadingToast });
      router.push("/blogs");
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message || "Invalid credentials.", { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const loadingToast = toast.loading("Connecting to Google...");
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Google login successful!", { id: loadingToast });
      router.push("/blogs");
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Google login failed.", { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-[#020617] text-slate-100 flex items-center justify-center p-6 overflow-hidden">
      {/* Background Aurora */}
      <div className="aurora-glow w-[800px] h-[800px] bg-brand-500/10 -top-40 -left-40" />
      <div className="aurora-glow w-[600px] h-[600px] bg-purple-500/10 -bottom-40 -right-40" />
      <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-10 space-y-4">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
          </Link>
          <h1 className="text-4xl font-display font-black tracking-tighter text-white">Welcome Back</h1>
          <p className="text-slate-500 font-medium">Continue your SEO intelligence journey.</p>
        </div>

        <div className="glass-card p-10 bg-slate-900/40 backdrop-blur-3xl ring-1 ring-white/5 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
              <input
                type="email"
                placeholder="name@company.com"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Secret Key</label>
              <input
                type="password"
                placeholder="••••••••"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-brand w-full py-4 text-[10px] font-black uppercase tracking-[0.25em]"
            >
              Sign In
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
              <span className="bg-[#0b1120] px-4 text-slate-600">Secure Social Connect</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="btn-secondary w-full py-4 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.15em]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Connect with Google
          </button>

          <p className="mt-10 text-center text-sm text-slate-500 font-medium">
            New to the node?{" "}
            <Link href="/signup" className="text-brand-400 font-black hover:text-brand-300 transition-colors uppercase text-xs tracking-widest">
              Create Agent
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
