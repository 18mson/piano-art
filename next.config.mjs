/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Prevents duplicate double-mount of Web Audio and Pixi context in dev mode
};

export default nextConfig;
