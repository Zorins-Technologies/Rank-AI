'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api/index';
import CalendarView from '@/components/dashboard/CalendarView';
import { toast } from 'react-hot-toast';
import { ChevronLeft, Loader2, Info } from 'lucide-react';

function CalendarContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const projectId = searchParams.get('project_id');

  const [calendarData, setCalendarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);

  useEffect(() => {
    if (token && projectId) {
      loadData();
    }
  }, [token, projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [calRes, projRes] = await Promise.all([
        api.publish.getCalendar(projectId, token),
        api.projects.getAll(token)
      ]);

      if (calRes.success) {
        setCalendarData(calRes.data);
      }
      
      const currentProj = projRes.data?.find(p => p.id === projectId);
      setProject(currentProj);

    } catch (err) {
      toast.error("Failed to load calendar data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!projectId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-2xl font-bold text-white mb-4">No Project Selected</h2>
        <button 
          onClick={() => router.push('/dashboard')}
          className="btn-brand"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-10">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-display font-black text-white mb-2">
              Content <span className="text-indigo-400">Calendar.</span>
            </h1>
            <p className="text-slate-400">
              {project ? `Managing roadmap for ${project.website_url.replace(/^https?:\/\//, '')}` : 'Managing your content roadmap'}
            </p>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
            <Info className="w-5 h-5 text-indigo-400" />
            <span className="text-xs text-indigo-300 font-medium">
              Autopilot runs daily at midnight UTC
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
          <p className="text-slate-500 font-medium italic">Synchronizing roadmap...</p>
        </div>
      ) : (
        <CalendarView projectId={projectId} initialData={calendarData} />
      )}
    </div>
  );
}

export default function CalendarPage() {
  return (
    <ProtectedRoute>
      <Navbar />
      <main className="min-h-screen bg-[#020617] text-slate-100 pt-20">
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>}>
          <CalendarContent />
        </Suspense>
      </main>
    </ProtectedRoute>
  );
}
