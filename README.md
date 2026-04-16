# 둥둥 (Dungdung)

3D 지구본 위에 여행 핀을 꽂는 여행 일기 소셜 플랫폼.

## 기술 스택

- **Framework:** Next.js 16 (App Router) + TypeScript
- **스타일링:** Tailwind CSS + shadcn/ui
- **3D 지도:** CesiumJS
- **상태 관리:** TanStack Query + Zustand
- **백엔드:** Supabase (PostgreSQL + PostGIS + Auth + Storage + Realtime)
- **배포:** Vercel

## 시작하기

### 사전 요구사항

- Node.js 20+
- pnpm
- [Supabase CLI](https://supabase.com/docs/guides/cli)

### 설치

```bash
pnpm install
```

### 환경변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local`에 아래 값을 채워넣습니다:

| 변수 | 설명 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `NEXT_PUBLIC_SITE_URL` | 앱 URL (로컬: `http://localhost:3000`) |
| `NEXT_PUBLIC_CESIUM_ION_TOKEN` | Cesium Ion 토큰 |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox API 토큰 |

### 로컬 DB 세팅

```bash
supabase start
supabase db reset        # 마이그레이션 + 시드 적용
```

### 개발 서버 실행

```bash
pnpm dev
```

`http://localhost:3000` 에서 확인

## 주요 명령어

```bash
pnpm dev          # 개발 서버 (Turbopack)
pnpm build        # 프로덕션 빌드
pnpm lint         # ESLint
pnpm typecheck    # TypeScript 타입 체크

supabase start                                                    # 로컬 Supabase 시작
supabase db reset                                                 # 마이그레이션 재적용
supabase gen types typescript --local > src/types/database.ts    # 타입 재생성
```

## 프로젝트 구조

```
src/
  app/                  Next.js App Router 페이지
  components/
    globe/              CesiumJS 격리 컴포넌트 (CSR only)
    ui/                 shadcn/ui 컴포넌트
  lib/supabase/         Supabase 클라이언트 (브라우저/서버)
  store/                Zustand 상태
  types/database.ts     Supabase 자동 생성 타입
  messages/ko.json      한국어 번역 (next-intl)
supabase/
  migrations/           SQL 마이그레이션 파일
```

## 스펙

전체 제품 스펙은 [SPEC.md](./SPEC.md) 참조.
