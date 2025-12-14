/** @type {import('next').NextConfig} */
const nextConfig = {
	// Ensure Vercel uses server runtime, not static export
	output: 'standalone',
	reactStrictMode: true,
};

export default nextConfig;
