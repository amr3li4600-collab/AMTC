export default function EligibilityLoading() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-pulse w-full">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-cockpit-border">
        <div className="h-8 w-48 bg-slate-200 dark:bg-cockpit-border/60 rounded-lg" />
      </div>

      {/* Main Content Area Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-cockpit-surface rounded-2xl border border-slate-100 dark:border-cockpit-border p-6 shadow-card space-y-4">
            <div className="h-6 w-40 bg-slate-200 dark:bg-cockpit-border/60 rounded-lg" />
            <div className="space-y-3">
              {[1, 2].map((j) => (
                <div key={j} className="h-20 w-full bg-slate-50 dark:bg-cockpit-canvas/60 rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
