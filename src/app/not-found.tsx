import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800 p-4">
      <h1 className="text-6xl font-bold text-amtc-navy">404</h1>
      <h2 className="text-xl font-semibold mt-2 mb-4">Page Not Found</h2>
      <p className="text-slate-500 mb-6 text-center max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/admin"
        className="btn-primary py-2 px-6 rounded-lg bg-navy text-white hover:bg-navy/90"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
