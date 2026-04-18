import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // 로컬 네트워크에서 모바일 테스트용 — 개발 환경 전용
  allowedDevOrigins: ['192.168.200.159', '127.0.0.1', 'localhost', '0.0.0.0'],
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  webpack(config) {
    // CesiumJS는 /public/cesium/Cesium.js를 런타임 script 태그로 로드 (번들링 제외)
    // webpack externals로 등록해 import('cesium') 참조를 글로벌 Cesium으로 연결
    config.externals = [
      ...(Array.isArray(config.externals) ? config.externals : config.externals ? [config.externals] : []),
      { cesium: 'Cesium' },
    ];

    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

    return config;
  },
};

export default nextConfig;
