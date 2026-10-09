/** @type {import('next').NextConfig} */

// Build-time validation of essential environment variables
if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
  const requiredEnvs = ['ADMIN_EMAIL', 'ADMIN_PASSWORD', 'ADMIN_SESSION_SECRET'];
  const missingEnvs = requiredEnvs.filter(env => !process.env[env]);
  
  if (missingEnvs.length > 0) {
    throw new Error(`\n❌ SECURITY ERROR: Missing required environment variables: ${missingEnvs.join(', ')}.\nPlease configure these in your Vercel deployment settings.\n`);
  }

  if (process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.length < 32) {
    throw new Error("\n❌ SECURITY ERROR: ADMIN_SESSION_SECRET must be at least 32 characters long in production.\n");
  }
}

const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
