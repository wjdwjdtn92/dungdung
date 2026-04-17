import type { NextConfig } from 'next';
import path from 'path';
import webpack from 'webpack';

const nextConfig: NextConfig = {
  // 로컬 네트워크에서 모바일 테스트용 — 개발 환경 전용
  allowedDevOrigins: ['192.168.200.159'],
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
  webpack(config, { isServer }) {
    if (!isServer) {
      // CesiumJS: CESIUM_BASE_URL을 /cesium으로 지정 (public/cesium에 static 파일 위치)
      config.plugins.push(
        new webpack.DefinePlugin({
          CESIUM_BASE_URL: JSON.stringify('/cesium'),
        }),
      );
    }

    // CesiumJS Worker 파일을 번들에서 제외 — 외부 스크립트로 로드
    config.module.rules.push({
      test: /\.js$/,
      include: /cesium/,
      use: { loader: 'source-map-loader' },
      enforce: 'pre',
    });

    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

    return config;
  },
};

export default nextConfig;
