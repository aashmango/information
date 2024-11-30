/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['dtutneopxvklvvmnubcy.supabase.co'],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@uiw/react-md-editor': '@uiw/react-md-editor/nohighlight',
    };
    return config;
  }
}

module.exports = nextConfig