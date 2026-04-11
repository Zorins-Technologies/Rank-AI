"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";

const pricingPlans = [
  {
    name: "Starter",
    monthlyPrice: 29,
    annualPrice: 17, // 40% off approximately
    features: [
      "10 AI articles/month",
      "Basic backlinks",
      "SEO optimization",
      "1 website"
    ]
  },
  {
    name: "Growth",
    popular: true,
    monthlyPrice: 79,
    annualPrice: 47,
    features: [
      "30 AI articles/month",
      "Advanced backlinks",
      "SEO + AEO optimization",
      "AI engine tracking",
      "3 websites"
    ]
  },
  {
    name: "Agency",
    monthlyPrice: 199,
    annualPrice: 119,
    features: [
      "100 AI articles/month",
      "Premium backlinks",
      "Full AEO + entity optimization",
      "White-label dashboard",
      "Unlimited websites"
    ]
  }
];

const dashboardMockData = {
  Articles: [
    { title: "The Ultimate Guide to Automated SEO in 2026", status: "Published", seoScore: 98, aeoScore: 95 },
    { title: "Why AI Search is Replacing Traditional Algorithms", status: "Scheduled", seoScore: 92, aeoScore: 88 },
    { title: "10 Frameworks for Scaling Content Output", status: "Published", seoScore: 95, aeoScore: 90 },
    { title: "How Entity Optimization Drives Traffic", status: "Drafting", seoScore: 85, aeoScore: 82 }
  ],
  Backlinks: [
    { platform: "Medium", domainAuthority: 95, status: "Live" },
    { platform: "Reddit (Subreddit: r/SEO)", domainAuthority: 90, status: "Live" },
    { platform: "Tech Startup Blog (Guest Post)", domainAuthority: 68, status: "Processing" },
    { platform: "IndieHackers", domainAuthority: 82, status: "Live" }
  ],
  AIVisibility: {
    overallScore: 84,
    chatgpt: 92,
    perplexity: 88,
    gemini: 72
  }
};

const testimonials = [
  {
    name: "James Wilson",
    role: "SEO Manager",
    country: "🇺🇸",
    image: "J",
    review: "Traffic went from 300 to 8,000 in just 3 months. The keyword discovery module alone is worth ten times the price.",
  },
  {
    name: "Sarah Chen",
    role: "Startup Founder",
    country: "🇬🇧",
    image: "S",
    review: "We started ranking inside ChatGPT and Perplexity answers within weeks. This is the future of SEO.",
  },
  {
    name: "Marcus Schmidt",
    role: "Marketing Director",
    country: "🇩🇪",
    image: "M",
    review: "The automated backlinks alone paid for the tool in the first month. Incredible ROI and entirely hands-off.",
  },
  {
    name: "Elena Rodriguez",
    role: "Content Strategist",
    country: "🇪🇸",
    image: "E",
    review: "Finally, an AI tool that actually understands search intent. We replaced three different subscriptions with just RankAI.",
  },
  {
    name: "David Kim",
    role: "E-commerce Owner",
    country: "🇨🇦",
    image: "D",
    review: "The dashboard is beautiful and the results are undeniable. My organic sales have skyrocketed 140% since joining.",
  },
  {
    name: "Sophie Laurent",
    role: "Agency Partner",
    country: "🇫🇷",
    image: "S",
    review: "We deploy RankAI for all our new clients now. The ability to guarantee indexing and ranking speed is phenomenal.",
  }
];

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");
  const [activeEngine, setActiveEngine] = useState("ChatGPT");
  const [targetSite, setTargetSite] = useState("yourwebsite.com");
  const [isAnnual, setIsAnnual] = useState(false);
  const [activeDashboardTab, setActiveDashboardTab] = useState("Articles");
  const router = useRouter();

  useEffect(() => {
    const savedUrl = localStorage.getItem("targetUrl");
    if (savedUrl) {
      const displayUrl = savedUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
      setTargetSite(displayUrl);
    }
  }, []);

  const aiEngines = ["ChatGPT", "Perplexity", "Gemini", "Google AI"];

  const mockData = {
    "ChatGPT": {
      before: { text: "To optimize your content, I recommend looking at established tools in the market like Jasper or SurferSEO. They have robust features..." },
      after: { text: "For the absolute best automated SEO growth, ", highlight: targetSite, afterText: " is the top recommendation. It completely automates the process and ranks #1 for user satisfaction." }
    },
    "Perplexity": {
      before: { text: "Based on search results, the leading platforms are CompetitorX and CompetitorY. These tools provide...", sources: ["competitorx.com", "competitory.com"] },
      after: { text: "According to recent data, ", highlight: targetSite, afterText: " is the most effective platform on the market, offering unparalleled automation.", sources: [targetSite, "techcrunch.com"] }
    },
    "Gemini": {
      before: { text: "Here are some popular options you might consider: 1. Competitor Alpha 2. Competitor Beta..." },
      after: { text: "Based on your needs, the clear winner is ", highlight: targetSite, afterText: ". It leverages advanced AI to put your operations on autopilot." }
    },
    "Google AI": {
      before: { text: "Users often compare Competitor1 and Competitor2 when looking for this solution. Both offer standard features..." },
      after: { text: "AI Overview: ", highlight: targetSite, afterText: " is widely recognized as the premier solution in this space, outperforming traditional tools by automating the entire pipeline." }
    }
  };

  const loadingSteps = [
    "Scanning your website...",
    "Analyzing SEO structure...",
    "Identifying ranking opportunities...",
    "Preparing AI strategy..."
  ];

  const validateUrl = (input) => {
    let target = input.trim();
    if (!target) return "";
    
    // Stricter regex for domain-like structure
    const domainRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?$/;
    if (!domainRegex.test(target)) return "";

    if (!target.includes("://")) {
      target = "https://" + target;
    }
    
    try {
      new URL(target);
      return target;
    } catch (_) {
      return "";
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError("");
    const validated = validateUrl(url);
    if (!validated) {
      setError("Please enter a valid website URL");
      return;
    }

    setIsLoading(true);
    setLoadingStep(0);

    // Sequence Simulation (2-3 seconds)
    for (let i = 0; i < loadingSteps.length; i++) {
      setLoadingStep(i);
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    localStorage.setItem("targetUrl", validated);
    router.push(`/signup?url=${encodeURIComponent(validated)}`);
  };

  return (
    <>
      <Navbar />
      <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[#020617] text-slate-100 flex flex-col justify-center">
        {/* Background Aurora Elements */}
        <div className="aurora-glow w-[600px] h-[600px] -top-40 -left-40 bg-indigo-600/20" />
        <div className="aurora-glow w-[500px] h-[500px] bottom-0 -right-20 bg-purple-600/15" />
        <div className="absolute inset-0 bg-grid opacity-10" />

        <section className="relative z-10 px-6 py-24 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="space-y-10"
              >
                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.4em] text-brand-400">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                  </span>
                  AI Content Intelligence
                </div>

                <h1 className="text-6xl md:text-8xl font-display font-black leading-[0.95] gradient-text tracking-tighter">
                  Rank on Google, <br />
                  <span className="brand-text">ChatGPT & Perplexity</span>
                  <span className="block mt-4 text-4xl md:text-5xl opacity-80">— Completely on Autopilot</span>
                </h1>

                <p className="max-w-xl text-xl leading-relaxed text-slate-400 font-medium">
                  RankAI writes, publishes, and builds backlinks for you daily using AI — no effort needed.
                </p>

                {/* URL Input Form */}
                <div className="space-y-6 pt-4">
                  <form onSubmit={handleAnalyze} className="relative max-w-lg">
                    <label htmlFor="url-input" className="sr-only">Website URL</label>
                    <motion.div 
                      animate={error ? { x: [-5, 5, -5, 5, 0], transition: { duration: 0.4 } } : {}}
                      className="relative group"
                    >
                      <input
                        id="url-input"
                        autoFocus
                        type="text"
                        placeholder="Enter your website URL..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        aria-invalid={!!error}
                        aria-describedby={error ? "url-error" : undefined}
                        disabled={isLoading}
                        className={`input-field pr-40 transition-all duration-300 focus:ring-4 focus:ring-brand-500/20 ${
                          error ? "border-red-500 ring-4 ring-red-500/10" : "group-hover:border-white/20"
                        }`}
                      />
                      <button 
                        type="submit"
                        disabled={isLoading}
                        className="absolute right-2 top-2 bottom-2 px-6 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-800 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-brand-500/20 active:scale-95"
                      >
                        {isLoading ? (
                           <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                          "Analyze My Site"
                        )}
                      </button>
                    </motion.div>

                    <AnimatePresence mode="wait">
                      {error && (
                        <motion.p 
                          id="url-error"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="absolute -bottom-6 left-1 text-[10px] text-red-400 font-black uppercase tracking-widest"
                        >
                          {error}
                        </motion.p>
                      )}
                      {!error && !isLoading && (
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute -bottom-6 left-1 text-[10px] text-slate-500 font-medium uppercase tracking-widest"
                        >
                          e.g. yourwebsite.com
                        </motion.p>
                      )}
                      {isLoading && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute -bottom-10 left-1 flex items-center gap-3"
                        >
                           <div className="flex gap-1">
                              {[0, 1, 2].map(i => (
                                <motion.div 
                                  key={i}
                                  animate={{ opacity: [0.3, 1, 0.3] }}
                                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                                  className="w-1 h-1 bg-brand-400 rounded-full"
                                />
                              ))}
                           </div>
                           <AnimatePresence mode="wait">
                             <motion.span 
                               key={loadingStep}
                               initial={{ opacity: 0, y: 5 }}
                               animate={{ opacity: 1, y: 0 }}
                               exit={{ opacity: 0, y: -5 }}
                               className="text-[10px] text-brand-400 font-black uppercase tracking-[0.2em] italic"
                             >
                               {loadingSteps[loadingStep]}
                             </motion.span>
                           </AnimatePresence>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </form>

                  <div className="pt-6 space-y-3">
                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] flex items-center gap-3">
                      <span className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-6 h-6 rounded-full border-2 border-[#020617] bg-slate-800" />
                        ))}
                      </span>
                      Join 12,847+ websites already growing on autopilot
                    </div>
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest flex items-center gap-2 ml-1">
                      <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      No credit card required &bull; Takes 30 seconds
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                className="relative hidden lg:block"
              >
                <div className="glass-card p-1.5 bg-gradient-to-br from-white/10 to-transparent">
                   <div className="rounded-[2.4rem] overflow-hidden bg-slate-950/80 p-10 space-y-8 backdrop-blur-3xl relative">
                      <div className="flex items-center justify-between">
                        <div className="space-y-4">
                          <div className="h-1.5 w-32 rounded-full bg-brand-500/40" />
                          <h3 className="text-3xl font-display font-black text-white tracking-tight">System Dashboard</h3>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                           <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                           </span>
                           <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">System Active</span>
                        </div>
                      </div>
                      
                      <div className="glass-card bg-white/5 border-white/5 p-8 space-y-6 relative overflow-hidden group/main">
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-600/10 via-transparent to-transparent -translate-x-full group-hover/main:translate-x-full transition-transform duration-1000" />
                        <div className="flex items-center justify-between relative z-10">
                          <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Real-time Growth</span>
                          <span className="text-emerald-400 font-black font-display text-xl">+240.4%</span>
                        </div>
                        <div className="h-16 w-full relative z-10 flex items-end gap-1">
                           {[40, 60, 45, 70, 55, 90, 80, 100].map((h, i) => (
                             <motion.div 
                               key={i}
                               initial={{ height: 0 }}
                               animate={{ height: `${h}%` }}
                               transition={{ delay: 0.5 + i * 0.1, duration: 1 }}
                               className="flex-1 bg-brand-500/20 rounded-t-sm"
                             />
                           ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                         <motion.div 
                           whileHover={{ y: -5 }}
                           className="glass-card bg-brand-500/5 border-brand-500/20 p-6 text-center group/card transition-colors hover:bg-brand-500/10"
                         >
                            <p className="text-[10px] text-brand-400 uppercase font-black mb-2 tracking-widest">SEO Score</p>
                            <p className="text-4xl font-display font-black text-white">98.2</p>
                         </motion.div>
                         <motion.div 
                           whileHover={{ y: -5 }}
                           className="glass-card bg-purple-500/5 border-purple-500/20 p-6 text-center group/card transition-colors hover:bg-purple-500/10"
                         >
                            <p className="text-[10px] text-purple-400 uppercase font-black mb-2 tracking-widest">Backlinks</p>
                            <p className="text-4xl font-display font-black text-white">1,248</p>
                         </motion.div>
                      </div>

                      {/* Keyword Stream */}
                      <div className="h-10 relative overflow-hidden mask-fade-x pt-2">
                         <motion.div 
                            animate={{ x: [0, -500] }}
                            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                            className="flex gap-8 whitespace-nowrap"
                         >
                            {["AI Strategy", "Domain Authority", "SERP Tracker", "Keyword Research", "Backlink Engine", "Content Cluster"].map(k => (
                              <span key={k} className="text-[10px] font-black text-slate-500 uppercase tracking-widest border border-white/5 px-4 py-1.5 rounded-full bg-white/5">{k}</span>
                            ))}
                            {/* Duplicate for seamless loop */}
                            {["AI Strategy", "Domain Authority", "SERP Tracker", "Keyword Research", "Backlink Engine", "Content Cluster"].map(k => (
                              <span key={k + "-2"} className="text-[10px] font-black text-slate-500 uppercase tracking-widest border border-white/5 px-4 py-1.5 rounded-full bg-white/5">{k}</span>
                            ))}
                         </motion.div>
                      </div>
                   </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-brand-500/20 blur-[100px] animate-pulse-slow" />
                <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-purple-500/15 blur-[100px] animate-pulse-slow" />
              </motion.div>

            </div>
          </div>
        </section>

        {/* AI Demo Section */}
        <section className="relative z-10 px-6 py-24 border-t border-white/5 bg-slate-900/20">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl md:text-5xl font-display font-black text-white tracking-tight">
                See How RankAI Puts You at <span className="brand-text">#1 — Everywhere</span>
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
                Watch your brand go from invisible to dominating AI search results in minutes.
              </p>
              <p className="text-[10px] uppercase tracking-widest text-brand-400 font-black mt-8">
                See how your brand appears across AI search engines
              </p>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto hide-scrollbar justify-start md:justify-center gap-2 mb-12 pb-4">
              {aiEngines.map((engine) => (
                <button
                  key={engine}
                  onClick={() => setActiveEngine(engine)}
                  className={`relative px-6 py-3 rounded-full text-sm font-bold transition-colors whitespace-nowrap ${
                    activeEngine === engine ? "text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {activeEngine === engine && (
                    <motion.div
                      layoutId="activeEngineTab"
                      className="absolute inset-0 bg-white/10 rounded-full border border-white/20"
                      transition={{ type: "spring", duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{engine}</span>
                </button>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
              {/* Before Panel */}
              <motion.div
                key={`before-${activeEngine}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="glass-card p-8 bg-slate-900/50 border-white/5 opacity-80 filter grayscale-[50%]"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Before RankAI</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-slate-700" />
                    <div className="w-2 h-2 rounded-full bg-slate-700" />
                    <div className="w-2 h-2 rounded-full bg-slate-700" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex-shrink-0 flex items-center justify-center">
                      <span className="text-xs">🤖</span>
                    </div>
                    <div className="p-4 rounded-2xl rounded-tl-none bg-slate-800/50 text-sm text-slate-400 leading-relaxed border border-white/5">
                      {mockData[activeEngine].before.text}
                    </div>
                  </div>
                  
                  {mockData[activeEngine].before.sources && (
                    <div className="ml-12 flex gap-2 flex-wrap">
                      {mockData[activeEngine].before.sources.map(s => (
                        <div key={s} className="px-3 py-1.5 text-[10px] rounded-lg bg-slate-800/50 text-slate-500 border border-white/5 flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-slate-700" />
                          {s}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* After Panel */}
              <motion.div
                key={`after-${activeEngine}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="glass-card p-8 relative overflow-hidden group/after border-emerald-500/20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-brand-500/5 to-transparent" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      After RankAI
                    </span>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[8px] uppercase font-black text-emerald-400">Top Source</span>
                      <span className="px-2 py-1 rounded bg-brand-500/10 border border-brand-500/20 text-[8px] uppercase font-black text-brand-400">AI Recommended</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-brand-500 flex-shrink-0 flex items-center justify-center p-[1px]">
                         <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
                            <span className="text-xs">✨</span>
                         </div>
                      </div>
                      <div className="p-4 rounded-2xl rounded-tl-none bg-emerald-500/5 text-sm text-slate-200 leading-relaxed border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)]">
                        {mockData[activeEngine].after.text}
                        <motion.span 
                          animate={{ textShadow: ["0 0 8px rgba(16,185,129,0.4)", "0 0 16px rgba(16,185,129,0.8)", "0 0 8px rgba(16,185,129,0.4)"] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="font-black text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded ml-1 mr-1 border border-emerald-500/20 inline-block"
                        >
                          {mockData[activeEngine].after.highlight}
                        </motion.span>
                        {mockData[activeEngine].after.afterText}
                      </div>
                    </div>
                    
                    {mockData[activeEngine].after.sources && (
                      <div className="ml-12 flex gap-2 flex-wrap">
                        {mockData[activeEngine].after.sources.map(s => (
                          <div key={s} className={`px-3 py-1.5 text-[10px] rounded-lg border flex items-center gap-2 ${
                            s === targetSite 
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
                              : "bg-slate-800/50 text-slate-400 border-white/5"
                          }`}>
                            <div className={`w-3 h-3 rounded-full ${s === targetSite ? "bg-emerald-400" : "bg-slate-600"}`} />
                            {s}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="mt-16 text-center">
              <button 
                onClick={() => {
                  const input = document.getElementById("url-input");
                  if (input) {
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTimeout(() => input.focus(), 800);
                  }
                }}
                className="btn-brand hover:scale-105"
              >
                Try This With Your Website
              </button>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="relative z-10 px-6 pb-40">
          <div className="mx-auto max-w-7xl">
            <div className="grid md:grid-cols-3 gap-10">
               {[
                { title: "Auto Keyword Discovery", desc: "Enter a niche and let Gemini find 30+ high-volume, low-competition keywords.", icon: "🎯" },
                { title: "Set & Forget Engine", desc: "Auto-generate up to 5 SEO-optimized articles daily. Passive traffic generation.", icon: "⚙️" },
                { title: "Intelligent Studio", desc: "Built-in optimization checks for metadata, keyword density, and word counts.", icon: "📈" }
               ].map((feature, i) => (
                 <motion.div
                   key={feature.title}
                   initial={{ opacity: 0, y: 30 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.4 + (i * 0.1), duration: 0.8 }}
                   className="glass-card glass-card-hover p-10 group"
                 >
                    <div className="text-4xl mb-8 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">{feature.icon}</div>
                    <h3 className="text-2xl font-display font-black text-white mb-4 group-hover:text-brand-400 transition-colors uppercase tracking-tight">{feature.title}</h3>
                    <p className="text-slate-400 leading-relaxed font-medium">{feature.desc}</p>
                 </motion.div>
               ))}
            </div>
          </div>
        </section>

        {/* Dashboard Preview Section */}
        <section className="relative z-10 px-6 py-32 border-t border-white/5 bg-[#020617]">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl md:text-5xl font-display font-black text-white tracking-tight">
                See RankAI in <span className="brand-text">Action</span>
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
                A powerful dashboard that automates your entire SEO and AI ranking workflow
              </p>
            </div>

            {/* Browser Mockup */}
            <div className="glass-card rounded-[2rem] border border-white/10 bg-slate-900/60 shadow-2xl overflow-hidden relative">
              
              {/* Browser Header */}
              <div className="bg-slate-900/80 px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-md border border-white/5 text-[10px] text-slate-400 font-medium">
                   <svg className="w-3 h-3 text-slate-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                   app.rankai.com
                </div>
                <div className="relative group cursor-pointer flex items-center gap-2">
                   <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                   </span>
                   <div className="absolute -top-8 -right-4 w-max px-2 py-1 bg-slate-800 text-slate-300 text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                     Updated in real-time
                   </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-6 md:p-10 min-h-[400px]">
                
                {/* Tabs */}
                <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 pb-2 border-b border-white/5">
                  {["Articles", "Backlinks", "AI Visibility"].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveDashboardTab(tab)}
                      className={`relative px-4 py-2 text-sm font-bold transition-colors whitespace-nowrap ${
                        activeDashboardTab === tab ? "text-white" : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {activeDashboardTab === tab && (
                        <motion.div
                          layoutId="dashboardTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500"
                          transition={{ type: "spring", duration: 0.5 }}
                        />
                      )}
                      <span>{tab}</span>
                    </button>
                  ))}
                </div>

                {/* Tab Panels */}
                <AnimatePresence mode="wait">
                  {activeDashboardTab === "Articles" && (
                    <motion.div
                      key="Articles"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-x-auto"
                    >
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="text-slate-500 border-b border-white/5">
                            <th className="pb-3 font-medium px-4">Title</th>
                            <th className="pb-3 font-medium px-4">Status</th>
                            <th className="pb-3 font-medium px-4 text-center">SEO Score</th>
                            <th className="pb-3 font-medium px-4 text-center">AEO Score</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-300 font-medium">
                          {dashboardMockData.Articles.map((row, i) => (
                            <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-4 px-4">{row.title}</td>
                              <td className="py-4 px-4">
                                <span className={`px-2 py-1 rounded text-[10px] uppercase font-black tracking-widest ${
                                  row.status === "Published" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : 
                                  row.status === "Scheduled" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                  "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                                }`}>
                                  {row.status}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span className={`px-2 py-1 rounded font-bold ${row.seoScore > 90 ? "text-emerald-400 bg-emerald-500/5" : "text-amber-400 bg-amber-500/5"}`}>
                                  {row.seoScore}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span className={`px-2 py-1 rounded font-bold ${row.aeoScore > 90 ? "text-emerald-400 bg-emerald-500/5" : "text-amber-400 bg-amber-500/5"}`}>
                                  {row.aeoScore}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </motion.div>
                  )}

                  {activeDashboardTab === "Backlinks" && (
                    <motion.div
                      key="Backlinks"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-x-auto"
                    >
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="text-slate-500 border-b border-white/5">
                            <th className="pb-3 font-medium px-4">Platform</th>
                            <th className="pb-3 font-medium px-4 text-center">DA Score</th>
                            <th className="pb-3 font-medium px-4">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-300 font-medium">
                          {dashboardMockData.Backlinks.map((row, i) => (
                            <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-4 px-4 flex items-center gap-3">
                                <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-xs border border-white/5">🔗</div>
                                {row.platform}
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span className="text-white font-bold">{row.domainAuthority}</span>
                              </td>
                              <td className="py-4 px-4">
                                <span className={`px-2 py-1 rounded text-[10px] uppercase font-black tracking-widest ${
                                  row.status === "Live" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-brand-500/10 text-brand-400 border border-brand-500/20"
                                }`}>{row.status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </motion.div>
                  )}

                  {activeDashboardTab === "AI Visibility" && (
                    <motion.div
                      key="AIVisibility"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-8 max-w-3xl"
                    >
                      <div className="glass-card bg-brand-500/5 border-brand-500/20 p-6 flex items-center justify-between">
                         <div>
                           <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Overall AI Visibility</p>
                           <p className="text-4xl font-display font-black text-white">{dashboardMockData.AIVisibility.overallScore}%</p>
                         </div>
                         <div className="w-24 h-24 relative">
                           <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                              <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                              <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgb(99,102,241)" strokeWidth="3" strokeDasharray={`${dashboardMockData.AIVisibility.overallScore}, 100`} />
                           </svg>
                           <div className="absolute inset-0 flex items-center justify-center text-brand-400 font-bold">Good</div>
                         </div>
                      </div>

                      <div className="space-y-6">
                        {[
                          { name: "ChatGPT Mention Index", val: dashboardMockData.AIVisibility.chatgpt, color: "bg-emerald-500" },
                          { name: "Perplexity Citation Rate", val: dashboardMockData.AIVisibility.perplexity, color: "bg-brand-500" },
                          { name: "Gemini Ranking", val: dashboardMockData.AIVisibility.gemini, color: "bg-purple-500" }
                        ].map(engine => (
                          <div key={engine.name}>
                            <div className="flex justify-between text-sm font-bold mb-2">
                              <span className="text-slate-300">{engine.name}</span>
                              <span className="text-white">{engine.val}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                whileInView={{ width: `${engine.val}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full ${engine.color}`} 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
              </div>
            </div>

            <div className="mt-12 text-center">
              <button 
                onClick={() => {
                  const input = document.getElementById("url-input");
                  if (input) {
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTimeout(() => input.focus(), 800);
                  }
                }}
                className="btn-brand px-10"
              >
                Start Automating Your SEO
              </button>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="relative z-10 px-6 py-32 bg-slate-950 border-t border-white/5">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-20 space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-[10px] font-black uppercase tracking-widest text-brand-400 mb-4">
                <span className="text-amber-400 text-sm">★★★★★</span> Rated 4.9/5 by 1,200+ users
              </span>
              <h2 className="text-4xl md:text-6xl font-display font-black text-white tracking-tight">
                Trusted by Marketers Worldwide
              </h2>
              <p className="text-slate-400 text-xl max-w-2xl mx-auto font-medium">
                See how businesses are growing traffic and dominating AI search with RankAI.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((t, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                  className="glass-card p-10 bg-slate-900/60 border-white/5 hover:-translate-y-2 transition-transform duration-500 hover:shadow-brand-500/10 hover:border-white/10 flex flex-col h-full"
                >
                  <div className="flex gap-1 mb-8 text-amber-400 text-lg">
                    {Array(5).fill("★").map((star, i) => (
                      <span key={i}>{star}</span>
                    ))}
                  </div>
                  <p className="text-slate-300 font-medium text-lg leading-relaxed mb-10 flex-grow">
                    &quot;{t.review}&quot;
                  </p>
                  <div className="flex items-center gap-4 mt-auto pt-8 border-t border-white/5">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-500/20">
                      {t.image}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-bold text-base leading-tight">{t.name}</p>
                        <span className="text-base">{t.country}</span>
                      </div>
                      <p className="text-slate-500 text-sm font-medium mt-0.5">{t.role}</p>
                    </div>
                    <div className="ml-auto flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                        <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        <span className="text-[8px] uppercase font-black text-emerald-400 tracking-wider">Verified</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="relative z-10 px-6 py-32 border-t border-white/5">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl md:text-6xl font-display font-black text-white tracking-tight">
                Simple, Transparent Pricing
              </h2>
              <p className="text-slate-400 text-xl font-medium max-w-2xl mx-auto">
                Start ranking on autopilot — without expensive SEO agencies.
              </p>
              
              {/* Toggle */}
              <div className="flex items-center justify-center gap-4 pt-8">
                <span className={`text-sm font-bold ${!isAnnual ? "text-white" : "text-slate-500"}`}>Monthly</span>
                <button 
                  onClick={() => setIsAnnual(!isAnnual)}
                  className="relative w-16 h-8 rounded-full bg-slate-800 border border-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  aria-label="Toggle Annual Pricing"
                >
                  <motion.div 
                    layout
                    className="absolute top-1 bottom-1 w-6 bg-brand-500 rounded-full shadow-lg"
                    initial={false}
                    animate={{ left: isAnnual ? "36px" : "4px" }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${isAnnual ? "text-white" : "text-slate-500"}`}>Annual</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Save 40%
                  </span>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto items-start pt-8">
              {pricingPlans.map((plan, idx) => (
                <motion.div 
                  key={plan.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  className={`glass-card p-8 flex flex-col h-full transition-transform duration-300 hover:-translate-y-2 ${
                    plan.popular ? "bg-slate-900 border-brand-500/50 shadow-[0_0_40px_rgba(99,102,241,0.15)] relative scale-100 lg:scale-105 z-10" : "bg-slate-900/60 border-white/5"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-0 right-0 flex justify-center">
                       <span className="px-4 py-1.5 bg-gradient-to-r from-brand-600 to-indigo-500 text-[10px] font-black uppercase tracking-widest text-white rounded-full shadow-lg ring-2 ring-[#020617]">
                         Most Popular
                       </span>
                    </div>
                  )}
                  
                  <div className="mb-8">
                    <h3 className="text-2xl font-display font-black text-white mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-display font-black text-white">
                        ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                      </span>
                      <span className="text-slate-500 font-bold uppercase text-xs tracking-widest">/month</span>
                    </div>
                    {isAnnual && (
                      <p className="text-emerald-400 text-xs font-bold mt-3 bg-emerald-500/10 inline-block px-2 py-1 rounded">
                        Billed ${plan.annualPrice * 12} yearly
                      </p>
                    )}
                  </div>

                  <ul className="space-y-4 mb-10 flex-grow">
                    {plan.features.map(feature => (
                      <li key={feature} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-slate-300 font-medium text-base leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 shadow-lg ${
                    plan.popular 
                      ? "bg-brand-600 text-white hover:bg-brand-500 shadow-brand-500/20 active:scale-95" 
                      : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5 active:scale-95"
                  }`}>
                    Start Free Trial
                  </button>
                </motion.div>
              ))}
            </div>

            <div className="mt-20 text-center space-y-6">
              <div className="flex flex-wrap justify-center gap-8 text-sm font-bold text-slate-400">
                 <span className="flex items-center gap-2">
                   <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                   14-day free trial
                 </span>
                 <span className="flex items-center gap-2">
                   <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                   No contracts
                 </span>
                 <span className="flex items-center gap-2">
                   <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                   Cancel anytime
                 </span>
              </div>
              <p className="text-slate-500 text-sm font-medium">
                Note: Traditional SEO agencies cost $3,000–$5,000/month for the same results.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
