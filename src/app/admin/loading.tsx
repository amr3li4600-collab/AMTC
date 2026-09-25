export default function AdminLoading() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-cockpit-border">
        <div className="space-y-2">
          <div className="h-7 w-48 sm:w-64 bg-slate-200 dark:bg-cockpit-border/60 rounded-lg" />
          <div className="h-4 w-64 sm:w-96 bg-slate-100 dark:bg-cockpit-border/40 rounded-md" />
        </div>
        <div className="flex gap-2.5">
          <div className="h-9 w-28 bg-slate-200 dark:bg-cockpit-border/60 rounded-xl" />
          <div className="h-9 w-32 bg-slate-200 dark:bg-cockpit-border/60 rounded-xl" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-cockpit-surface rounded-2xl border border-slate-100 dark:border-cockpit-border p-5 shadow-card space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-slate-200 dark:bg-cockpit-border/60 rounded" />
              <div className="h-9 w-9 bg-slate-100 dark:bg-cockpit-border/40 rounded-xl" />
            </div>
            <div className="h-8 w-16 bg-slate-200 dark:bg-cockpit-border/60 rounded" />
            <div className="h-3 w-32 bg-slate-100 dark:bg-cockpit-border/40 rounded" />
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-cockpit-surface rounded-2xl border border-slate-100 dark:border-cockpit-border p-6 shadow-card space-y-4">
          <div className="h-5 w-40 bg-slate-200 dark:bg-cockpit-border/60 rounded" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 w-full bg-slate-50 dark:bg-cockpit-canvas/60 rounded-xl" />
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-cockpit-surface rounded-2xl border border-slate-100 dark:border-cockpit-border p-6 shadow-card space-y-4">
          <div className="h-5 w-36 bg-slate-200 dark:bg-cockpit-border/60 rounded" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 w-full bg-slate-50 dark:bg-cockpit-canvas/60 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
