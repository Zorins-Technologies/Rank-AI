"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function ResultsSimulation() {
  const [visitors, setVisitors] = useState(1000);
  const [conversionRate, setConversionRate] = useState(2);
  const [customerValue, setCustomerValue] = useState(100);

  const projectedTraffic = visitors * 12; 
  const estimatedRevenue = projectedTraffic * (conversionRate / 100) * customerValue;
  const roiMultiple = Math.round(estimatedRevenue / (79 * 12));

  return (
    <section className="relative z-10 px-6 py-32 bg-[#020617]">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-display font-black text-white leading-tight">
              Calculate Your <br />
              <span className="text-indigo-400 font-black">AI-Powered Alpha.</span>
            </h2>
            <p className="text-slate-400 text-lg font-medium leading-relaxed">
              Standard SEO is a linear gamble. RankAI is an exponential certainty. Use the simulator to project your recurring revenue growth at scale.
            </p>
            
            <div className="space-y-10 pt-4">
               <div className="space-y-4">
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-500">
                     <span>Current Visitors / Mo</span>
                     <span className="text-white">{visitors.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" min="100" max="50000" step="100" 
                    value={visitors} onChange={(e) => setVisitors(Number(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-full appearance-none"
                  />
               </div>

               <div className="space-y-4">
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-500">
                     <span>Conversion Rate (%)</span>
                     <span className="text-white">{conversionRate}%</span>
                  </div>
                  <input 
                    type="range" min="0.5" max="10" step="0.5" 
                    value={conversionRate} onChange={(e) => setConversionRate(Number(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-full appearance-none"
                  />
               </div>

               <div className="space-y-4">
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-500">
                     <span>Avg. Customer LTV ($)</span>
                     <span className="text-white">${customerValue}</span>
                  </div>
                  <input 
                    type="range" min="10" max="5000" step="10" 
                    value={customerValue} onChange={(e) => setCustomerValue(Number(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-full appearance-none"
                  />
               </div>
            </div>
          </div>

          <div className="glass-card p-12 bg-indigo-500/5 border-indigo-500/20 shadow-[0_0_100px_-20px_rgba(79,70,229,0.2)]">
             <div className="text-center space-y-12">
                <div>
                   <p className="text-[10px] uppercase font-black tracking-[0.4em] text-indigo-400 mb-2">Projected Annual Yield</p>
                   <p className="text-7xl font-display font-black text-white tracking-tighter">${estimatedRevenue.toLocaleString()}</p>
                </div>

                <div className="grid grid-cols-2 gap-8 border-y border-white/5 py-10">
                   <div>
                      <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1">Growth Multiplier</p>
                      <p className="text-4xl font-display font-black text-emerald-400">{roiMultiple}x</p>
                   </div>
                   <div>
                      <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1">Entity Reach</p>
                      <p className="text-4xl font-display font-black text-white">99%</p>
                   </div>
                </div>

                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest italic">
                  *Based on average RankAI performance benchmarks across B2B/SaaS sectors.
                </p>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}
