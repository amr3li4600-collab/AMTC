export default function StudentsLoading() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-pulse w-full">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-cockpit-border">
        <div className="h-8 w-48 bg-slate-200 dark:bg-cockpit-border/60 rounded-lg" />
        <div className="flex gap-3">
          <div className="h-10 w-32 bg-slate-200 dark:bg-cockpit-border/60 rounded-xl" />
          <div className="h-10 w-32 bg-slate-200 dark:bg-cockpit-border/60 rounded-xl" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white dark:bg-cockpit-surface rounded-2xl border border-slate-100 dark:border-cockpit-border p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="h-10 w-64 bg-slate-100 dark:bg-cockpit-canvas/60 rounded-xl" />
          <div className="h-10 w-24 bg-slate-100 dark:bg-cockpit-canvas/60 rounded-xl" />
        </div>
        <div className="h-12 w-full bg-slate-100/50 dark:bg-cockpit-border/30 rounded-lg" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-16 w-full bg-slate-50 dark:bg-cockpit-canvas/60 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
