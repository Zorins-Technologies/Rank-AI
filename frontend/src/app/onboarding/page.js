"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { api } from "@/lib/api/index";

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialUrl = searchParams.get("url") || "";

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    url: initialUrl,
    brand_name: "",
    language: "English",
    target_country: "Global",
    audience_type: "",
    brand_voice: "Professional & Authoritative",
    primary_goals: "Maximize Search Traffic",
    content_style: "SEO Blog Posts",
    key_offerings: "",
    competitors: "",
  });

  useEffect(() => {
    if (!formData.url) {
      const stored = localStorage.getItem("targetUrl");
      if (stored) setFormData((s) => ({ ...s, url: stored }));
    }
  }, [formData.url]);

  const updateForm = (key, val) => setFormData((s) => ({ ...s, [key]: val }));

  const nextStep = () => {
    if (step === 1 && !formData.brand_name.trim()) return toast.error("Brand name is required.");
    if (step === 2 && !formData.audience_type.trim()) return toast.error("Audience description is required.");
    if (step === 4 && !formData.key_offerings.trim()) return toast.error("Key offerings are required.");
    if (step < 6) setStep(step + 1);
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const payload = {
        url: formData.url,
        context: {
          brand_name: formData.brand_name,
          language: formData.language,
          target_country: formData.target_country,
          audience_type: formData.audience_type,
          brand_voice: formData.brand_voice,
          primary_goals: formData.primary_goals,
          content_style: formData.content_style,
          key_offerings: formData.key_offerings.split(',').map(i => i.trim()).filter(Boolean),
          competitors: formData.competitors.split(',').map(i => i.trim()).filter(Boolean),
        }
      };

      localStorage.setItem("onboarding_data", JSON.stringify(payload));
      
      const data = await api.projects.getGuestPreview(payload.url, payload.context);

      if (data.success && data.preview_topics) {
        localStorage.setItem("preview_topics", JSON.stringify(data.preview_topics));
        toast.success("Strategy generated successfully!");
        router.push("/preview");
      } else {
        throw new Error(data.error || "Generation failed.");
      }
    } catch (err) {
      toast.error(err.message || "An error occurred during generation.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 w-full max-w-2xl mx-auto z-10 relative">
      <div className="w-full space-y-8">
        
        {/* Progress Tracker */}
        <div className="flex justify-between relative mb-8 px-2">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-white/5 rounded-full" />
          <motion.div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-indigo-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((step - 1) / 5) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div 
              key={i} 
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold relative z-10 transition-all duration-300 ${
                step >= i ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]" : "bg-slate-900 border border-white/10 text-slate-500"
              }`}
            >
              {i === 6 ? <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 13l4 4L19 7" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/></svg> : i}
            </div>
          ))}
        </div>

        <div className="glass-card p-8 sm:p-12 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-display font-bold mb-2">Business Target</h2>
                <p className="text-slate-400 text-sm mb-6">Let's start with your target domain and brand.</p>
                
                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1 block mb-2">Website URL</label>
                    <input 
                      id="website_url"
                      name="website_url"
                      type="text" 
                      value={formData.url}
                      onChange={(e) => updateForm("url", e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1 block mb-2">Brand Name</label>
                    <input 
                      id="brand_name"
                      name="brand_name"
                      autoFocus
                      type="text" 
                      placeholder="e.g. Acme Corp" 
                      value={formData.brand_name}
                      onChange={(e) => updateForm("brand_name", e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-display font-bold mb-2">Target Market</h2>
                <p className="text-slate-400 text-sm mb-6">Who is your primary audience?</p>
                
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1 block mb-2">Language</label>
                      <select 
                        id="language"
                        name="language"
                        value={formData.language}
                        onChange={(e) => updateForm("language", e.target.value)}
                        className="input-field"
                      >
                        <option>English</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1 block mb-2">Country</label>
                      <select 
                        id="target_country"
                        name="target_country"
                        value={formData.target_country}
                        onChange={(e) => updateForm("target_country", e.target.value)}
                        className="input-field"
                      >
                        <option>Global</option>
                        <option>United States</option>
                        <option>United Kingdom</option>
                        <option>Canada</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1 block mb-2">Audience Description</label>
                    <input 
                      id="audience_type"
                      name="audience_type"
                      autoFocus
                      type="text" 
                      placeholder="e.g. B2B SaaS Founders, Fitness Enthusiasts" 
                      value={formData.audience_type}
                      onChange={(e) => updateForm("audience_type", e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-display font-bold mb-2">Brand Identity</h2>
                <p className="text-slate-400 text-sm mb-6">Define your voice and primary objective.</p>
                
                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1 block mb-2 cursor-pointer" htmlFor="brand_voice">Brand Voice</label>
                    <select 
                      id="brand_voice"
                      name="brand_voice"
                      value={formData.brand_voice}
                      onChange={(e) => updateForm("brand_voice", e.target.value)}
                      className="input-field"
                    >
                      <option>Professional & Authoritative</option>
                      <option>Casual & Friendly</option>
                      <option>Witty & Bold</option>
                      <option>Technical & Concise</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1 block mb-2 cursor-pointer" htmlFor="primary_goals">Primary Goal</label>
                    <select 
                      id="primary_goals"
                      name="primary_goals"
                      value={formData.primary_goals}
                      onChange={(e) => updateForm("primary_goals", e.target.value)}
                      className="input-field"
                    >
                      <option>Maximize Search Traffic</option>
                      <option>Generate Qualified Leads</option>
                      <option>Drive E-commerce Conversions</option>
                      <option>Build Industry Authority</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-display font-bold mb-2">Product & Style</h2>
                <p className="text-slate-400 text-sm mb-6">What do you offer and how should we write about it?</p>
                
                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1 block mb-2 cursor-pointer" htmlFor="content_style">Content Style</label>
                    <select 
                      id="content_style"
                      name="content_style"
                      value={formData.content_style}
                      onChange={(e) => updateForm("content_style", e.target.value)}
                      className="input-field"
                    >
                      <option>SEO Blog Posts</option>
                      <option>Deep-Dive Guides</option>
                      <option>Listicles & Roundups</option>
                      <option>Case Studies</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1 block mb-2 cursor-pointer" htmlFor="key_offerings">Key Offerings (Comma separated)</label>
                    <textarea 
                      id="key_offerings"
                      name="key_offerings"
                      autoFocus
                      rows={3}
                      placeholder="e.g. Managed HR services, Payroll software" 
                      value={formData.key_offerings}
                      onChange={(e) => updateForm("key_offerings", e.target.value)}
                      className="input-field resize-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-display font-bold mb-2">Competitive Landscape</h2>
                <p className="text-slate-400 text-sm mb-6">Who are your main rivals online?</p>
                
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1 block mb-2 cursor-pointer" htmlFor="competitors">Competitors (Comma separated)</label>
                  <textarea 
                    id="competitors"
                    name="competitors"
                    autoFocus
                    rows={4}
                    placeholder="e.g. competitor1.com, competitor2.io" 
                    value={formData.competitors}
                    onChange={(e) => updateForm("competitors", e.target.value)}
                    className="input-field resize-none"
                  />
                </div>
              </motion.div>
            )}

            {step === 6 && (
              <motion.div key="step6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                {loading ? (
                  <div className="space-y-6">
                    <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto" />
                    <h2 className="text-2xl font-display font-bold tracking-tight">Compiling Intelligence...</h2>
                    <p className="text-slate-400 text-sm">Engineering your personalized growth roadmap.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto shadow-inner border border-indigo-500/20">
                      <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-display font-bold text-white">Strategy Lock Ready</h2>
                    <p className="text-slate-400 text-sm max-w-sm mx-auto">We've captured your brand DNA. Ready to generate your custom AI strategy.</p>
                    <button 
                      onClick={handleComplete}
                      className="btn-brand w-full mt-4 !py-4 shadow-[0_10px_30px_rgba(79,70,229,0.3)]"
                    >
                      Generate Full Roadmap
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Controls */}
          {step < 6 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
              <button 
                onClick={() => step > 1 ? setStep(step - 1) : router.push("/")}
                className="text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                type="button"
              >
                Back
              </button>
              <button 
                onClick={nextStep}
                className="btn-primary !px-10 !py-2.5 !text-sm"
                type="button"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
