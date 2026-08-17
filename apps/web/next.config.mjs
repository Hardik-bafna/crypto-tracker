/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@crypto-tracer/types",
    "@crypto-tracer/blockchain",
    "@crypto-tracer/graph",
    "@crypto-tracer/entities",
    "@crypto-tracer/analysis",
    "@crypto-tracer/clustering",
    "@crypto-tracer/risk",
    "@crypto-tracer/ai",
  ],
};

export default nextConfig;
