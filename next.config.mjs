/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: '50mb',
        },
        middlewareClientMaxBodySize: '50mb', // Added to allow large uploads through middleware
    },
};

export default nextConfig;
