"use client";

export default function BlogCardSkeleton() {
  return (
    <div className="glass-card p-5 animate-pulse-slow">
      {/* Image Skeleton */}
      <div className="mb-4 h-44 overflow-hidden rounded-3xl bg-slate-800/50 shimmer" />
      
      {/* Badge Skeleton */}
      <div className="flex gap-2 mb-4">
        <div className="h-6 w-20 rounded-full bg-slate-800/50 shimmer" />
        <div className="h-6 w-16 rounded-full bg-slate-800/50 shimmer" />
      </div>

      {/* Title Skeleton */}
      <div className="space-y-2 mb-4">
        <div className="h-6 w-full rounded-lg bg-slate-800/50 shimmer" />
        <div className="h-6 w-2/3 rounded-lg bg-slate-800/50 shimmer" />
      </div>

      {/* Description Skeleton */}
      <div className="space-y-2 mb-6">
        <div className="h-4 w-full rounded-md bg-slate-800/30 shimmer" />
        <div className="h-4 w-full rounded-md bg-slate-800/30 shimmer" />
        <div className="h-4 w-4/5 rounded-md bg-slate-800/30 shimmer" />
      </div>

      {/* Footer Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 rounded-md bg-slate-800/50 shimmer" />
        <div className="h-4 w-20 rounded-md bg-slate-800/50 shimmer" />
      </div>
    </div>
  );
}
