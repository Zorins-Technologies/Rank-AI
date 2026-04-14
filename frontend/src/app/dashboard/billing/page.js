"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "../../../components/Navbar";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { useAuth } from "../../../context/AuthContext";
import { api } from "../../../lib/api/index";

export default function BillingPage() {
  const { user } = useAuth();
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [upgrading, setUpgrading] = useState(null);

  useEffect(() => {
    if (user) {
      loadUsage();
    }
  }, [user]);

  const loadUsage = async () => {
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const res = await api.billing.getUsage(token);
      if (res.success) {
        setUsage(res);
      }
    } catch (err) {
      console.error("Billing Load Error:", err);
      setError("Failed to load billing details.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan) => {
    try {
      setUpgrading(plan);
      const token = await user.getIdToken();
      const res = await api.billing.createSession(plan, token);
      if (res.success && res.url) {
        window.location.href = res.url;
      }
    } catch (err) {
      console.error("Upgrade Error:", err);
      alert("Failed to initiate checkout. Please try again.");
    } finally {
      setUpgrading(null);
    }
  };

  const calculatePercentage = (current, limit) => {
    if (limit === 9999) return 0;
    return Math.min(Math.round((current / limit) * 100), 100);
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="min-h-screen bg-[#020617] text-slate-100 pb-20 pt-32 px-6">
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
        <div className="aurora-glow w-[600px] h-[600px] top-0 left-0 bg-brand-500/10" />
        
        <div className="max-w-4xl mx-auto space-y-12 relative z-10">
          
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-4xl font-display font-black tracking-tight gradient-text">
              Billing & <span className="brand-text">Usage.</span>
            </h1>
            <p className="text-slate-400 font-medium">Manage your subscription and track your generation quotas.</p>
          </div>

          {loading ? (
             <div className="shimmer p-12 space-y-8 w-full">
               <div className="h-8 w-48 bg-slate-800 rounded" />
               <div className="space-y-4">
                 <div className="h-4 w-full bg-slate-800 rounded" />
                 <div className="h-4 w-2/3 bg-slate-800 rounded" />
               </div>
             </div>
          ) : usage ? (
            <div className="space-y-8">
              
              {/* Current Plan Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-10 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Active Subscription</p>
                    <h2 className="text-3xl font-display font-black text-white italic uppercase tracking-tighter">
                      {usage.plan} <span className="brand-text">Plan</span>
                    </h2>
                    <p className="text-slate-400 text-sm font-medium">
                      Status: <span className={`uppercase font-black ${usage.subscription_status === 'active' || usage.subscription_status === 'trialing' ? 'text-emerald-400' : 'text-orange-400'}`}>
                        {usage.subscription_status}
                      </span>
                    </p>
                    {usage.subscription_status === 'trialing' && (
                      <p className="text-xs text-brand-400 font-bold">Trial ends: {new Date(usage.trial_ends_at).toLocaleDateString()}</p>
                    )}
                  </div>

                  <div className="flex gap-4">
                    {usage.plan !== 'agency' && (
                      <button 
                        onClick={() => handleUpgrade(usage.plan === 'starter' ? 'growth' : 'agency')}
                        disabled={upgrading !== null}
                        className="btn-brand px-8 py-3 text-xs font-black uppercase tracking-widest"
                      >
                        {upgrading ? "Processing..." : "Upgrade Plan"}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Usage Stats Grid */}
              <div className="grid md:grid-cols-2 gap-8">
                
                {/* Projects Usage */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-card p-8 space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Website Projects</h3>
                    <span className="text-white font-bold">{usage.usage.projects} / {usage.limits.projects === 9999 ? "∞" : usage.limits.projects}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${calculatePercentage(usage.usage.projects, usage.limits.projects)}%` }}
                      className="h-full bg-brand-500 shadow-[0_0_15px_rgba(var(--brand-primary-rgb),0.5)]"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                    Total websites you can manage simultaneously. Agency users get unlimited projects.
                  </p>
                </motion.div>

                {/* Blog Usage */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-card p-8 space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Monthly Blogs</h3>
                    <span className="text-white font-bold">{usage.usage.blogs} / {usage.limits.blogs === 9999 ? "∞" : usage.limits.blogs}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${calculatePercentage(usage.usage.blogs, usage.limits.blogs)}%` }}
                      className="h-full bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                    Blogs generated across all projects in the last 30 days. Resets every month.
                  </p>
                </motion.div>

              </div>

              {/* Invoices/History Placeholder */}
              <div className="glass-card p-8 border-dashed border-white/10 opacity-50">
                <p className="text-center text-slate-500 text-xs font-bold uppercase tracking-widest italic">
                  Billing history available on the Stripe Portal
                </p>
              </div>

            </div>
          ) : (
            <div className="glass-card p-20 text-center">
              <p className="text-red-400 font-bold">{error || "Something went wrong."}</p>
              <button onClick={loadUsage} className="btn-brand mt-4">Retry</button>
            </div>
          )}

        </div>
      </main>
    </ProtectedRoute>
  );
}
