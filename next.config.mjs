/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["fylgaowoigzaxqhgugxr.supabase.co"],
  },
  experimental: {
    globalNotFound: true,
  },
};

export default nextConfig;
