"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

import Navbar from "../components/Navbar";
import Hero from "../components/Landing/Hero";
import StatsGrid from "../components/Landing/StatsGrid";
import AeoComparison from "../components/Landing/AeoComparison";
import HowItWorks from "../components/Landing/HowItWorks";
import SocialProof from "../components/Landing/SocialProof";
import ResultsSimulation from "../components/Landing/ResultsSimulation";
import PricingSection from "../components/Landing/PricingSection";
import FaqSection from "../components/Landing/FaqSection";

import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api/index";

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");

  const loadingSteps = [
    "Vecting Entity Map...",
    "Scanning Domain Authority...",
    "Mapping AI Citations...",
    "Finalizing Synthesis Strategy..."
  ];

  const handleAnalyze = async (url) => {
    setError("");
    if (!url || !url.includes(".")) {
      setError("Valid target URL required.");
      return;
    }

    setIsLoading(true);
    setLoadingStep(0);
    
    // Simulate loading steps for UX
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev < 3 ? prev + 1 : prev));
    }, 1200);

    try {
      localStorage.setItem("targetUrl", url);
      setTimeout(() => {
        clearInterval(interval);
        router.push(`/onboarding?url=${encodeURIComponent(url)}`);
      }, 5000);
    } catch (err) {
      toast.error("Audit node failure.");
      setIsLoading(false);
      clearInterval(interval);
    }
  };

  const handlePricingAction = async (planName) => {
    if (!user) {
      router.push("/signup");
      return;
    }
    const id = toast.loading(`Initializing ${planName} checkout...`);
    try {
      const token = await user.getIdToken();
      const res = await api.billing.createSession(planName.toLowerCase(), token);
      if (res.success && res.url) {
        window.location.href = res.url;
      } else throw new Error(res.error || "Checkout failure.");
    } catch (err) {
      toast.error(err.message, { id });
    }
  };

  return (
    <div className="bg-[#020617]">
      <Navbar />
      
      {/* Compositional Layout */}
      <Hero 
        onAnalyze={handleAnalyze} 
        loading={isLoading} 
        error={error} 
        loadingStep={loadingStep} 
        loadingSteps={loadingSteps} 
      />
      
      <StatsGrid />
      
      <AeoComparison />
      
      <HowItWorks />
      
      <ResultsSimulation />
      
      <SocialProof />
      
      <PricingSection onAction={handlePricingAction} />
      
      <FaqSection />

      {/* Basic Footer */}
      <footer className="relative z-10 px-6 py-20 border-t border-white/5 bg-slate-900/10">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-slate-500">
            <div className="flex flex-col items-center md:items-start gap-2">
               <span className="text-xl font-display font-black text-white italic">RankAI</span>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-700">© 2026 Autonomous SEO Synthesis</p>
            </div>
            <div className="flex gap-10 text-[10px] uppercase font-black tracking-widest">
               <a href="/pricing" className="hover:text-white transition-colors">Pricing</a>
               <a href="/login" className="hover:text-white transition-colors">Login</a>
               <a href="/signup" className="hover:text-white transition-colors">Platform</a>
               <a href="#" className="hover:text-white transition-colors">Terms</a>
            </div>
         </div>
      </footer>
    </div>
  );
}
