/** @type {import('next').NextConfig} */
// NOTE: Next.js App Router (app/api) ne supporte pas bodyParser ni api: { bodyParser: false }.
// La taille max d'upload est gérée côté client et dans la route API (voir app/api/books/upload-pdf/route.ts).
const nextConfig = {
	// Ensure Vercel uses server runtime, not static export
	output: 'standalone',
	reactStrictMode: true,
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'i.ibb.co',
			},
		],
	},
};

export default nextConfig;
