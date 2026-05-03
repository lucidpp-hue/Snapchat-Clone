/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
            },
            {
                protocol: "https",
                // Vercel Blob public store — matches *.public.blob.vercel-storage.com
                hostname: "*.public.blob.vercel-storage.com",
            },
        ],
    },
};

export default nextConfig;
