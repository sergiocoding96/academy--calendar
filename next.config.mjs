/**
 * @type {import('next').NextConfig}
 * Note: "layout.css preloaded but not used" in dev is a known Next.js issue (see #51524).
 * Dashboard sidebars use prefetch={false} to reduce it; the warning is dev-only and harmless.
 */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
