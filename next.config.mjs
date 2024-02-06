/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'qqkobjmfkitckzlnaacb.supabase.co',
        protocol: 'https',
      },
    ],
  },
};

export default nextConfig;
