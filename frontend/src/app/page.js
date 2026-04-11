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

const faqs = [
  {
    question: "How is AEO different from SEO?",
    answer: "Traditional SEO focuses strictly on ranking in Google search results. AEO (Answer Engine Optimization) is about ensuring your brand is the primary source cited by AI engines like ChatGPT, Perplexity, and Gemini. RankAI does both automatically."
  },
  {
    question: "Is this safe for my Google rankings?",
    answer: "Absolutely. We follow Google's latest AI content guidelines, focusing on E-E-A-T (Experience, Expertise, Authoritativeness, and Trustworthiness). Our AI writes for humans first, ensuring long-term safety and ranking stability."
  },
  {
    question: "How fast will I see results?",
    answer: "While traditional SEO takes 6-12 months, our users typically see their first AI engine citations and indexing improvements within 3-6 weeks, thanks to our automated backlink and indexing accelerators."
  },
  {
    question: "Do you build real backlinks?",
    answer: "Yes. RankAI identifies high-authority platforms in your niche (like Medium, Reddit, and industry blogs) and secures placements, ensuring your brand builds genuine domain authority that AI engines trust."
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes. We don't believe in locking users into long-term contracts. You can cancel your subscription at any time directly through your dashboard with a single click."
  }
];

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
  const [activeFaq, setActiveFaq] = useState(null);
  
  // ROI Calculator State
  const [visitors, setVisitors] = useState(1000);
  const [conversionRate, setConversionRate] = useState(2);
  const [customerValue, setCustomerValue] = useState(100);

  const projectedTraffic = visitors * 12; 
  const estimatedRevenue = projectedTraffic * (conversionRate / 100) * customerValue;
  const roiMultiple = Math.round(estimatedRevenue / 79);

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

        {/* AEO Section */}
        <section className="relative z-10 px-6 py-32 bg-[#020617] border-t border-white/5">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-20 space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-4">
                 Answer Engine Optimization
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-white tracking-tight">
                The Future of SEO is <span className="text-emerald-400">AEO</span>
              </h2>
              <p className="text-slate-400 text-xl max-w-2xl mx-auto font-medium">
                Traditional SEO ranks you on Google. RankAI puts you inside AI answers.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start max-w-6xl mx-auto">
              
              {/* Left Column - Traditional SEO */}
              <div className="glass-card p-10 bg-slate-900/40 border-white/5 relative overflow-hidden group h-full">
                <div className="flex items-center justify-between mb-8 pb-8 border-b border-white/5">
                   <h3 className="text-2xl font-display font-black text-slate-300">Traditional SEO</h3>
                   <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                   </div>
                </div>
                
                <ul className="space-y-6">
                   {[
                     "Rankings on Google only",
                     "Slow results (6-12 months)",
                     "No AI visibility",
                     "Requires constant manual work"
                   ].map((item, i) => (
                     <li key={i} className="flex items-center gap-4 text-slate-400 font-medium">
                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                           <span className="text-[10px]">❌</span>
                        </div>
                        {item}
                     </li>
                   ))}
                </ul>
              </div>

              {/* Right Column - RankAI AEO */}
              <div className="glass-card p-10 bg-slate-900 shadow-[0_0_40px_rgba(16,185,129,0.1)] border-emerald-500/30 relative overflow-hidden group h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-brand-500/5 to-transparent" />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-8 pb-8 border-b border-emerald-500/20">
                     <h3 className="text-2xl font-display font-black text-white">RankAI <span className="text-emerald-400">(SEO + AEO)</span></h3>
                     <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                     </div>
                  </div>
                  
                  <ul className="space-y-6 mb-10 flex-grow">
                     {[
                       "Appears in ChatGPT, Gemini, Perplexity",
                       "Automated content + backlinks",
                       "Structured data (FAQ, schema)",
                       "AI-driven authority building"
                     ].map((item, i) => (
                       <li key={i} className="flex items-center gap-4 text-slate-200 font-bold">
                          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          </div>
                          {item}
                       </li>
                     ))}
                  </ul>

                  <div className="p-5 rounded-2xl bg-[#020617]/80 border border-emerald-500/20 flex flex-col sm:flex-row items-center gap-5 mt-auto">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex shrink-0 items-center justify-center border border-emerald-500/40 shadow-lg shadow-emerald-500/20">
                      <span className="text-2xl">📈</span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Impact Metric</p>
                      <p className="text-sm font-medium text-slate-200 leading-snug">
                         Your brand appears in <span className="text-emerald-400 font-black">34% of AI-generated answers</span> for your niche.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
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
                Start Ranking in AI Answers
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

        {/* ROI Calculator Section */}
        <section className="relative z-10 px-6 py-32 bg-[#020617] border-t border-white/5">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl md:text-5xl font-display font-black text-white tracking-tight">
                See Your Potential Growth with <span className="brand-text">RankAI</span>
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
                Estimate how much traffic and revenue you can generate in the next 6 months
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Inputs */}
              <div className="glass-card p-8 bg-slate-900/60 border-white/5 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 to-indigo-500" />
                
                <div>
                  <div className="flex justify-between mb-3">
                    <label className="text-sm font-bold text-slate-300">Monthly Visitors</label>
                    <span className="text-brand-400 font-bold bg-brand-500/10 px-2 py-0.5 rounded text-sm">{visitors.toLocaleString()}</span>
                  </div>
                  <input type="range" min="0" max="50000" step="500" value={visitors} onChange={(e) => setVisitors(Number(e.target.value))} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500" />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">
                    <span>0</span>
                    <span>50k+</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-3">
                    <label className="text-sm font-bold text-slate-300">Conversion Rate</label>
                    <span className="text-brand-400 font-bold bg-brand-500/10 px-2 py-0.5 rounded text-sm">{conversionRate}%</span>
                  </div>
                  <input type="range" min="1" max="10" step="0.5" value={conversionRate} onChange={(e) => setConversionRate(Number(e.target.value))} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500" />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">
                    <span>1%</span>
                    <span>10%</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-3">
                    <label className="text-sm font-bold text-slate-300">Average Customer Value ($)</label>
                    <span className="text-brand-400 font-bold bg-brand-500/10 px-2 py-0.5 rounded text-sm">${customerValue.toLocaleString()}</span>
                  </div>
                  <input type="range" min="10" max="1000" step="10" value={customerValue} onChange={(e) => setCustomerValue(Number(e.target.value))} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500" />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">
                    <span>$10</span>
                    <span>$1,000+</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0 text-slate-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                    Traditional SEO agencies cost <span className="text-slate-400 line-through">$3,000–$5,000/month</span>
                  </p>
                </div>
              </div>

              {/* Outputs */}
              <div className="glass-card p-8 lg:p-10 relative overflow-hidden group/roi border-emerald-500/20 bg-slate-900 shadow-[0_0_40px_rgba(16,185,129,0.05)] h-full flex flex-col justify-between">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-brand-500/5 to-transparent" />
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full" />
                
                <div className="relative z-10 space-y-10">
                  
                  <div className="flex flex-col md:flex-row md:items-baseline justify-between border-b border-white/5 pb-8 gap-4">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                      Projected Traffic
                    </p>
                    <p className="text-4xl font-display font-black text-white tabular-nums tracking-tight">
                      {projectedTraffic.toLocaleString()} <span className="text-sm text-slate-500 font-medium">/mo</span>
                    </p>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-baseline justify-between border-b border-white/5 pb-8 gap-4">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Estimated Revenue
                    </p>
                    <p className="text-5xl font-display font-black text-emerald-400 tabular-nums tracking-tight drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                      ${estimatedRevenue.toLocaleString()} <span className="text-sm text-slate-500 font-medium">/mo</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">ROI Multiple</p>
                    <div className="flex items-center gap-2">
                       <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 font-black rounded-lg border border-emerald-500/20 shadow-lg flex items-center gap-2">
                         <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                         </span>
                         {roiMultiple}x ROI
                       </span>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 pt-10 mt-auto">
                  <button 
                    onClick={() => {
                      const input = document.getElementById("url-input");
                      if (input) {
                        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        setTimeout(() => input.focus(), 800);
                      }
                    }}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 active:scale-95 text-[#020617] font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
                  >
                    Start Getting These Results
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </button>
                  <p className="text-center text-[10px] text-slate-500 mt-4 uppercase tracking-widest font-bold">
                    *Results are estimates and may vary based on niche and competition.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="relative z-10 px-6 py-32 border-t border-white/5 bg-slate-950">
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

        {/* FAQ Section */}
        <section className="relative z-10 px-6 py-32 bg-[#020617] border-t border-white/5">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl md:text-5xl font-display font-black text-white tracking-tight">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="glass-card overflow-hidden border-white/5 bg-slate-900/40">
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full px-8 py-6 text-left flex items-center justify-between group"
                  >
                    <span className="text-lg font-bold text-slate-200 group-hover:text-white transition-colors">{faq.question}</span>
                    <motion.span
                      animate={{ rotate: activeFaq === idx ? 180 : 0 }}
                      className="text-slate-500 group-hover:text-brand-400"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </motion.span>
                  </button>
                  <AnimatePresence>
                    {activeFaq === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-8 pb-8"
                      >
                        <p className="text-slate-400 leading-relaxed font-medium">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="relative z-10 px-6 py-32 bg-gradient-to-b from-slate-950 to-brand-950 overflow-hidden border-t border-white/5">
          <div className="absolute inset-0 bg-grid opacity-10" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-500/20 blur-[120px] rounded-full" />
          
          <div className="mx-auto max-w-4xl relative z-10 text-center">
            <h2 className="text-5xl md:text-7xl font-display font-black text-white tracking-tighter mb-6 leading-tight">
              Ready to Dominate <br /><span className="brand-text">AI Search?</span>
            </h2>
            <p className="text-slate-400 text-xl font-medium mb-12 max-w-2xl mx-auto">
              Join 12,000+ businesses ranking on autopilot with RankAI. 
            </p>

            {/* URL Input CTA */}
            <form onSubmit={handleAnalyze} className="relative max-w-xl mx-auto mb-6">
              <label htmlFor="final-url-input" className="sr-only">Website URL</label>
              <div className="relative group">
                <input
                  id="final-url-input"
                  type="text"
                  placeholder="Enter your website URL..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-8 py-6 bg-slate-900/80 border border-white/10 rounded-2xl text-white placeholder-slate-500 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500/50 transition-all text-lg pr-44"
                />
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="absolute right-2 top-2 bottom-2 px-8 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-800 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-lg shadow-brand-500/20"
                >
                  {isLoading ? "Starting..." : "Get Started Free"}
                </button>
              </div>
            </form>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">
              No credit card required &bull; Takes 30 seconds
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 bg-slate-950 border-t border-white/5 px-6 pt-24 pb-12 overflow-hidden">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 lg:gap-8 mb-20">
              {/* Brand Column */}
              <div className="col-span-2 lg:col-span-2 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 text-2xl font-black">
                    ⚡
                  </div>
                  <span className="text-2xl font-display font-black tracking-tight text-white uppercase italic">Rank AI</span>
                </div>
                <p className="text-slate-400 font-medium leading-relaxed max-w-xs">
                  Rank on Google, ChatGPT & Perplexity. Automatically.
                </p>
                <div className="flex gap-4 items-center pt-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 rounded-full border border-emerald-500/20">
                    <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none">GDPR Compliant</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-500/5 rounded-full border border-brand-500/20">
                    <svg className="w-4 h-4 text-brand-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.9L9.003 9.122 15.836 4.9 9.003 1.057 2.166 4.9zM15.836 4.9l-.001 7.236-6.833 3.868V9.122l6.834-4.222zM9.002 9.122v6.982L2.167 12.138V4.9l6.835 4.222z" clipRule="evenodd" /></svg>
                    <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest leading-none">Secure Payments</span>
                  </div>
                </div>
              </div>

              {/* Product */}
              <div className="space-y-6">
                <h4 className="text-white font-black uppercase text-xs tracking-widest">Product</h4>
                <ul className="space-y-4 text-sm font-medium text-slate-500">
                  <li><button className="hover:text-brand-400 transition-colors">Features</button></li>
                  <li><button className="hover:text-brand-400 transition-colors">Pricing</button></li>
                  <li><button className="hover:text-brand-400 transition-colors">Dashboard</button></li>
                  <li><button className="hover:text-brand-400 transition-colors underline decoration-brand-500/50">Early Access</button></li>
                </ul>
              </div>

              {/* Company */}
              <div className="space-y-6">
                <h4 className="text-white font-black uppercase text-xs tracking-widest">Company</h4>
                <ul className="space-y-4 text-sm font-medium text-slate-500">
                  <li><button className="hover:text-brand-400 transition-colors">About Us</button></li>
                  <li><button className="hover:text-brand-400 transition-colors">Careers</button></li>
                  <li><button className="hover:text-brand-400 transition-colors italic">The Vision</button></li>
                </ul>
              </div>

              {/* Legal */}
              <div className="space-y-6">
                <h4 className="text-white font-black uppercase text-xs tracking-widest">Legal</h4>
                <ul className="space-y-4 text-sm font-medium text-slate-500">
                  <li><button className="hover:text-brand-400 transition-colors">Privacy Policy</button></li>
                  <li><button className="hover:text-brand-400 transition-colors">Terms of Service</button></li>
                </ul>
              </div>
            </div>

            <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">
                &copy; 2026 RankAI. All rights reserved.
              </p>
              <div className="flex gap-8 items-center">
                 <button className="text-slate-600 hover:text-white transition-colors flex items-center gap-2">
                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                   <span className="text-[10px] font-black uppercase tracking-widest">Twitter</span>
                 </button>
                 <button className="text-slate-600 hover:text-white transition-colors flex items-center gap-2">
                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                   <span className="text-[10px] font-black uppercase tracking-widest">LinkedIn</span>
                 </button>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
