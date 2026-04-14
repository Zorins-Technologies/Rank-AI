"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import { projectsApi } from "../../lib/api/index";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signup, loginWithGoogle } = useAuth();

  const handlePostAuth = async (loadingToast) => {
    try {
      const intent = new URLSearchParams(window.location.search).get("intent");
      const onboardingData = localStorage.getItem("onboarding_data");

      if (intent === "onboarding" && onboardingData) {
        toast.loading("Transferring intelligence to core...", { id: loadingToast });
        const parsed = JSON.parse(onboardingData);
        // Wait for auth to propagate
        const { auth } = await import('../../lib/firebase');
        if (auth.currentUser) {
          const token = await auth.currentUser.getIdToken();
          await projectsApi.create({
            website_url: parsed.url,
            brand_name: parsed.context.brand_name,
            language: parsed.context.language,
            target_country: parsed.context.target_country,
            audience_type: parsed.context.audience_type,
            key_offerings: parsed.context.key_offerings,
            competitors: parsed.context.competitors
          }, token);
          localStorage.removeItem("onboarding_data");
          localStorage.removeItem("preview_topics");
        }
      }

      toast.success("Account created successfully!", { id: loadingToast });
      router.push("/dashboard");
    } catch (e) {
      console.error(e);
      toast.error("Initialization failed, but account was created.", { id: loadingToast });
      router.push("/dashboard");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    const id = toast.loading("Creating your account...");
    try {
      await signup(email, password);
      await handlePostAuth(id);
    } catch (err) {
      toast.error(err.message || "Signup failed.", { id });
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    const id = toast.loading("Connecting to Google...");
    try {
      await loginWithGoogle();
      await handlePostAuth(id);
    } catch (err) {
      toast.error("Google connect failed.", { id });
      setLoading(false);
    }
  };

  return (
    <main className="relative flex items-center justify-center min-h-[calc(100vh-4rem)] p-6 z-10 w-full max-w-md mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Create Account</h1>
          <p className="text-slate-400 mt-2">Start automating your growth pipeline.</p>
        </div>

        <div className="glass-card p-8 sm:p-10">
          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1 mb-2 block">Email Address</label>
              <input
                type="email"
                placeholder="name@company.com"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1 mb-2 block">Password</label>
              <input
                type="password"
                placeholder="Min 8 characters"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-brand w-full mt-2">
              Sign Up
            </button>
          </form>

          <div className="relative my-8 flex items-center justify-center text-xs font-bold uppercase tracking-widest">
            <span className="absolute inset-x-0 h-px bg-white/10" />
            <span className="bg-slate-900 px-4 text-slate-500 relative z-10">Or continue with</span>
          </div>

          <button onClick={handleGoogleSignup} disabled={loading} className="btn-secondary w-full flex gap-3 text-sm">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>

          <p className="mt-8 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-400 font-semibold hover:text-indigo-300">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
