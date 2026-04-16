@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

3D 지구본 위에 여행 핀을 꽂는 여행 일기 소셜 플랫폼 **둥둥(Dungdung)**. 상세 스펙은 `SPEC.md` (v1.1) 참조.

## 기술 스택

- **Framework:** Next.js 14+ (App Router) + TypeScript (strict)
- **스타일링:** Tailwind CSS + shadcn/ui (Radix 기반)
- **3D 지도:** CesiumJS (CSR only, SSR 비활성화 필수)
- **상태 관리:** TanStack Query (서버) + Zustand (UI)
- **폼:** react-hook-form + zod
- **백엔드:** Supabase (PostgreSQL 15 + **PostGIS** + Auth + Storage + Realtime + Image Transformation)
- **외부 API:** Google OAuth, Mapbox Geocoding, Vercel OG
- **관측성:** Sentry + Vercel Analytics + PostHog
- **테스트:** Vitest + Testing Library + Playwright
- **배포:** Vercel

## 개발 명령어

```bash
npm run dev          # 개발 서버
npm run build        # 프로덕션 빌드
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit

supabase start       # 로컬 Supabase 시작
supabase db reset    # 마이그레이션 재적용
supabase gen types typescript --local > src/types/database.ts
```

## 아키텍처 핵심 원칙

### CesiumJS 격리 (필수)
- `src/components/globe/` 디렉토리에 완전 격리 — 외부는 props/이벤트만 사용
- `next/dynamic` + `{ ssr: false }`로 lazy load (bundle-dynamic-imports)
- 초기 화면은 정적 블러 이미지 + 스켈레톤으로 LCP 확보 → Cesium 로드 후 swap
- 엔진 교체 가능성을 전제로 `GlobeEngine` 추상화 유지

### 공간 쿼리 (PostGIS)
- `pins.location`을 `geography(Point, 4326)` 컬럼으로 저장 (lat/lng와 병존)
- GiST 인덱스: `CREATE INDEX ON pins USING GIST (location)`
- 뷰포트 검색은 `ST_DWithin` / `ST_MakeEnvelope`
- 클러스터링은 MVP에서 클라이언트 사이드 Supercluster

### 인증 & RLS
- Google OAuth 2.0 (Supabase Auth)
- 모든 테이블 RLS 활성화
- **`visibility = 'friends'` 정의:** 작성자의 **팔로워**에게만 보임 (상호 팔로우 아님)
- 미인증 읽기 허용: `/explore`, `/pins/[id]` (public), `/[username]`

### 데이터 계층 구조
```
User → Trip → Pin → pin_photos (최대 10장)
             └── pin_tags → tags
     → follows, likes, comments, notifications
```

- Pin은 Trip 없이 독립 가능 (`trip_id` nullable)
- `visibility`는 Pin/Trip 각각 독립 설정
- 트립 private이면 하위 public 핀은 트립 페이지에서 숨김 (쿼리에서 필터)

### 사진 처리 파이프라인
1. `exifr`로 EXIF GPS 파싱 (클라이언트)
2. `browser-image-compression`으로 최대 2048px + WebP 변환
3. Supabase Storage 업로드: `{user_id}/{pin_id}/{uuid}.webp`
4. 표시 시 Supabase Image Transformation URL 사용 (`?width=800&quality=80`)
5. Next.js `<Image>` + 커스텀 loader로 연결

### 위치 지정 우선순위
1. 사진 EXIF GPS
2. Mapbox Geocoding 검색
3. 3D 지구 직접 클릭

### 알림 시스템
- `notifications` 테이블에 영구 저장 (follow/like/comment)
- Supabase Realtime 채널 `notifications:{user_id}`로 실시간 push
- 동일 (recipient, actor, type, target) 조합은 unique로 중복 방지
- 30일 경과는 배치로 삭제

### Vercel/React 성능 규칙 (핵심)
- `bundle-barrel-imports` — `@/components/ui`처럼 배럴 import 금지, 직접 경로 사용
- `async-parallel` — 독립적인 fetch는 `Promise.all()` 병렬 처리
- `server-parallel-fetching` — 서버 컴포넌트에서 fetch 병렬 구조화
- `bundle-defer-third-party` — PostHog 등 분석 도구는 hydration 후 로드
- `rerender-no-inline-components` — 컴포넌트 안에 컴포넌트 선언 금지

## 폴더 구조

```
src/
  app/
    (auth)/auth/callback/   Google OAuth 콜백
    (marketing)/            랜딩, explore (SSR)
    (protected)/            로그인 필수 라우트
      feed/ map/ trips/ pins/ settings/ notifications/
    [username]/             사용자 프로필 (SSR)
    pins/[id]/              핀 상세 (SSR + OG)
  components/
    globe/                  CesiumJS 격리 (CSR only)
    ui/                     shadcn/ui 컴포넌트
    feed/ pins/ trips/      도메인별 컴포넌트
  lib/
    supabase/
      client.ts             브라우저 클라이언트
      server.ts             서버 클라이언트
  store/                    Zustand 스토어
  types/
    database.ts             supabase gen types 자동 생성
  messages/
    ko.json                 next-intl 번역
supabase/
  migrations/               SQL 마이그레이션 파일
  seed.sql
```

## 라우팅 구조

```
/                    메인 랜딩 (3D 지구, 비로그인 허용)
/explore             공개 핀 탐색 (SSR, 비로그인 허용)
/feed                팔로우 피드 (로그인 필수)
/map                 내 개인 지도 (로그인 필수, CSR)
/trips/[id]          트립 상세 (CSR)
/pins/[id]           핀 상세 (SSR + OG 메타태그)
/[username]          사용자 프로필 (SSR)
/notifications       알림 목록
/auth/callback       Google OAuth 콜백
```

- 비공개 핀 공유 링크 접근 시 **404** 반환 (403 대신 존재 은닉)
- SSR 페이지 내 3D 섹션은 반드시 `dynamic(ssr: false)`로 분리

## 개발 환경

```bash
supabase start       # 로컬 Postgres + Auth + Storage
supabase db reset    # 마이그레이션 재적용
supabase gen types typescript --local > src/types/database.ts
```

### 환경변수 (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_CESIUM_ION_TOKEN=
NEXT_PUBLIC_MAPBOX_TOKEN=
SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=
```

## 주요 제약사항

- 핀당 사진 최대 10장, 장당 10MB, WebP 변환 후 업로드
- 허용 포맷: JPEG, PNG, HEIC, WebP
- 동영상 MVP 미지원
- 피드 페이지네이션: **cursor-based** 고정 (`created_at`, `id` 복합 커서) — offset 금지
- `visibility` 값: `public` | `friends` | `private`
- i18n: MVP는 `ko` 단독이지만 구조는 `next-intl` 기반 i18n-ready 유지
- 타임존: `timestamptz`는 UTC, `pins.visited_at`은 로컬 date + `visited_tz` IANA 문자열 별도

## 주의사항 / 관례

- **보안 우선:** 모든 신규 테이블 RLS 필수, 서비스 키는 서버 전용
- **타입 생성 자동화:** 스키마 변경 시 `supabase gen types` 재실행
- **OG 카드 필수:** 공개 핀/프로필 SSR 페이지는 반드시 OG 메타태그 + Vercel OG 이미지
- **에러 핸들링:** 사용자 입력 경계(폼, 업로드)에서만 방어. 내부 경로는 trust
- **MVP 법률 요건:** `/privacy`, `/terms` 페이지는 v1.0 런칭 전 필수
