import type { NextConfig } from 'next'
import type { Configuration as WebpackConfig } from 'webpack'

const nextConfig: NextConfig = {
  webpack: (config: WebpackConfig) => {
    if (typeof window !== 'undefined') {
      config.resolve = {
        ...config.resolve,
        fallback: {
          ...(config.resolve?.fallback ?? {}),
          fs: false,
          net: false,
          tls: false,
          child_process: false,
        }
      };
    }
    return config;
  },
  transpilePackages: ['@google/generative-ai'],
  
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      }
    ]
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  // 增加 Serverless 函数超时时间
  serverRuntimeConfig: {
    maxDuration: 60 // 设置为60秒
  }
}