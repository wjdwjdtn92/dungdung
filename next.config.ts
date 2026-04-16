import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  // workspace root 경고 해소 — 이 프로젝트 디렉토리를 루트로 명시
  turbopack: {
    root: path.resolve(__dirname),
    // CesiumJS worker 파일 접근 허용 (cesium 설치 후 활성화)
    // resolveAlias: {
    //   'cesium/Workers': path.resolve(__dirname, 'node_modules/cesium/Build/Cesium/Workers'),
    // },
  },
  images: {
    remotePatterns: [
      {
        // Supabase Storage (프로젝트 URL로 교체 필요)
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/**',
      },
      {
        // Google 프로필 이미지 (OAuth)
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
}

export default nextConfig
