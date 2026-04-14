'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api/index';
import { useAuth } from '@/context/AuthContext';
import { Calendar, Clock, Globe, AlertCircle, CheckCircle2, Send, CalendarDays } from 'lucide-react';

const statusConfig = {
  planned: { color: 'text-slate-400 bg-slate-100 dark:bg-slate-800/50', icon: Clock, label: 'Planned' },
  pending: { color: 'text-slate-400 bg-slate-100 dark:bg-slate-800/50', icon: Clock, label: 'Planned' },
  generating: { color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20', icon: Calendar, label: 'Generating' },
  publishing: { color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20', icon: Globe, label: 'Publishing' },
  published: { color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20', icon: CheckCircle2, label: 'Published' },
  failed: { color: 'text-rose-500 bg-rose-50 dark:bg-rose-900/20', icon: AlertCircle, label: 'Failed' },
};

export default function CalendarView({ projectId, initialData = [] }) {
  const { token } = useAuth();
  const [items, setItems] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);

  const handlePublishNow = async (blogId) => {
    if (!blogId) return;
    setActionId(blogId);
    try {
      const res = await api.publish.manual(blogId, token);
      if (res.success) {
        // Optimistic update
        setItems(prev => prev.map(item => 
          item.id === blogId ? { ...item, status: 'published', is_published: true } : item
        ));
      }
    } catch (err) {
      console.error('Publish failed:', err);
    } finally {
      setActionId(null);
    }
  };

  const handleReschedule = async (planId, daysOffset = 1) => {
    const today = new Date();
    today.setDate(today.getDate() + daysOffset);
    const newDateStr = today.toISOString().split('T')[0];

    setActionId(planId);
    try {
      const res = await api.publish.reschedule(planId, newDateStr, token);
      if (res.success) {
        // In a real app, we'd refetch or calculate the new date locally
        // For now, we'll just show a success state or re-fetch
        window.location.reload(); 
      }
    } catch (err) {
      console.error('Reschedule failed:', err);
    } finally {
      setActionId(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <CalendarDays className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No Content Scheduled</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8">
          Enable Autopilot or generate a Growth Roadmap to populate your content calendar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Content Roadmap</h2>
        <div className="flex gap-4">
          {Object.entries(statusConfig).filter(([k]) => ['planned', 'published', 'failed'].includes(k)).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${config.color.split(' ')[0]}`} />
              <span className="text-xs text-slate-500 font-medium">{config.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        {items.map((item) => {
          const config = statusConfig[item.status] || statusConfig.planned;
          const StatusIcon = config.icon;
          const displayDate = new Date(item.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });

          return (
            <div 
              key={item.id}
              className="group flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.color}`}>
                  <StatusIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {displayDate}
                    </span>
                    <span className="text-xs text-slate-400">|</span>
                    <span className="text-xs text-indigo-500 font-semibold uppercase tracking-wider">
                      {item.keyword}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.status !== 'published' && (
                  <>
                    <button
                      onClick={() => handleReschedule(item.plan_id, 3)}
                      disabled={actionId === item.plan_id}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                      title="Reschedule (+3 days)"
                    >
                      <Calendar className="w-5 h-5" />
                    </button>
                    {item.id && (
                      <button
                        onClick={() => handlePublishNow(item.id)}
                        disabled={actionId === item.id}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm shadow-indigo-200 dark:shadow-none"
                      >
                        <Send className="w-4 h-4" />
                        {actionId === item.id ? 'Publishing...' : 'Publish Now'}
                      </button>
                    )}
                  </>
                )}
                {item.status === 'published' && (
                  <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-sm font-bold rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Live
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
