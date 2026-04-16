# 지도 기반 여행 블로그 앱 — 제품 스펙 (SPEC.md)

> 인터뷰 기반 스펙
> 초안 작성일: 2026-04-16
> v1.1 보완일: 2026-04-16
> 상태: MVP 설계 확정 → 개발 착수 대기

---

## 변경 이력

| 버전 | 날짜 | 주요 변경 |
|------|------|-----------|
| v1.0 | 2026-04-16 | 초기 스펙 작성 |
| v1.1 | 2026-04-16 | 팔로우/friends 정의, notifications 스키마, PostGIS, 관측성/테스트/개발환경/법적 준수 섹션 추가, 비기능 요건 재조정 |

---

## 1. 제품 비전

**한 줄 요약:** 3D 지구본 위에 여행의 순간을 핀으로 꽂고, 나만의 세계 지도를 완성해가는 여행 일기 소셜 플랫폼.

**핵심 가치:**
- 지도가 일기장이 된다. 텍스트+사진을 위치에 연결해 공간적 기억으로 저장.
- 아름다운 3D 지구본 시각화로 "내가 가본 곳"을 한눈에 조감.
- SNS형 팔로우/피드로 다른 여행자의 루트를 탐색하고 영감을 얻음.

---

## 2. 플랫폼

| 항목 | 결정 사항 |
|------|-----------|
| 1차 플랫폼 | **웹앱** (Next.js 기반, 모바일 반응형) |
| 2차 플랫폼 | 모바일 앱 (MVP 검증 후 결정) |
| 배포 대상 | Vercel (웹), App Store / Play Store (추후) |

---

## 3. 기술 스택

### 프론트엔드
- **Framework:** Next.js 14+ (App Router)
- **언어:** TypeScript (strict)
- **스타일링:** Tailwind CSS
- **컴포넌트 라이브러리:** shadcn/ui (Radix UI 기반, 접근성 확보)
- **3D 지도:** CesiumJS (위성 텍스처 + GPU 가속 3D 지구)
- **상태 관리:**
  - 서버 상태: **TanStack Query (React Query)** — fetching, 캐시, 낙관적 업데이트
  - 클라이언트 UI 상태: **Zustand** — 전역 UI 상태(지구 카메라, 모달 등)
- **폼:** react-hook-form + zod (validation)
- **EXIF 파싱:** exifr
- **이미지 리사이즈:** browser-image-compression

### 백엔드 / 인프라
- **BaaS:** Supabase
  - PostgreSQL 15 + **PostGIS 확장** (공간 쿼리)
  - Supabase Auth (Google OAuth)
  - Supabase Storage (미디어 파일)
  - Supabase Realtime (알림, 피드 업데이트)
  - Supabase Image Transformation (WebP 리사이즈 CDN)
- **서버리스 함수:** Supabase Edge Functions (Deno)
- **개발 도구:** Supabase CLI (로컬 환경 + 마이그레이션 관리)

### 외부 API
- **Google OAuth 2.0** — 로그인
- **장소 검색:** Mapbox Geocoding API (월 10만 요청 무료, 비용 예측 용이)
- **OG 이미지 생성:** Vercel OG / Satori (공유 카드 자동 생성)

### 관측성 / 분석
- **에러 모니터링:** Sentry (프런트 + Edge Functions)
- **웹 분석:** Vercel Analytics + Vercel Speed Insights
- **프로덕트 분석:** PostHog (이벤트 추적, 리텐션, 퍼널)

### 테스트
- **단위/통합:** Vitest + Testing Library
- **E2E:** Playwright
- **로컬 DB:** Supabase CLI (`supabase start` → 로컬 Postgres)

---

## 4. 데이터 모델

### 계층 구조
```
User
 ├── Trip (여행 단위)
 │    └── Pin (위치별 기록)
 │         ├── Photos (최대 10장)
 │         └── Tags
 ├── Follows (팔로우 관계)
 ├── Likes
 ├── Comments
 └── Notifications
```

### 공간 쿼리 전략

- `pins.location` 컬럼을 `geography(Point, 4326)` 타입으로 정의 (lat/lng와 별도)
- GiST 인덱스: `CREATE INDEX ON pins USING GIST (location)`
- 지도 뷰포트 기반 검색: `ST_DWithin`, `ST_MakeEnvelope` 활용
- 클러스터링: PostGIS `ST_ClusterKMeans` 또는 클라이언트 사이드 Supercluster 선택 (MVP는 클라이언트 사이드)

### 주요 테이블 스키마

#### users
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | Supabase Auth UID |
| username | text (unique) | 고유 닉네임 |
| display_name | text | 표시 이름 |
| avatar_url | text | 프로필 이미지 |
| bio | text | 자기소개 |
| locale | text | 사용 언어 (기본 'ko') |
| created_at | timestamptz | |

#### trips
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | |
| user_id | uuid (FK → users) | |
| title | text | 여행 제목 |
| description | text | 설명 |
| cover_pin_id | uuid (FK → pins, nullable) | 대표 핀 |
| visibility | enum (public/private/friends) | |
| started_at | date | 여행 시작일 |
| ended_at | date | 여행 종료일 |
| created_at | timestamptz | |

#### pins
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | |
| trip_id | uuid (FK → trips, nullable) | 트립 연결 (선택) |
| user_id | uuid (FK → users) | |
| title | text | 핀 제목 |
| body | text | 일기 내용 |
| lat | float8 | 위도 (표시/정렬용) |
| lng | float8 | 경도 (표시/정렬용) |
| location | geography(Point, 4326) | PostGIS 공간 쿼리용 |
| place_name | text | 장소명 (검색 or 수동 입력) |
| place_id | text | 외부 Place ID (선택) |
| country_code | char(2) | ISO 국가 코드 |
| city | text | 도시명 |
| visited_at | date | 방문 날짜 (로컬 날짜, 타임존 없음) |
| visited_tz | text | 방문 시 IANA 타임존 (선택, 예: 'Asia/Tokyo') |
| visibility | enum (public/private/friends) | |
| created_at | timestamptz | |

#### pin_photos
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | |
| pin_id | uuid (FK → pins) | |
| storage_path | text | Supabase Storage 경로 |
| order | int | 정렬 순서 |
| width | int | 원본 너비 |
| height | int | 원본 높이 |
| exif_lat | float8 | EXIF GPS 위도 (있을 경우) |
| exif_lng | float8 | EXIF GPS 경도 |
| created_at | timestamptz | |

#### tags
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | |
| name | text (unique, lowercase) | 태그명 |

#### pin_tags
| 컬럼 | 타입 |
|------|------|
| pin_id | uuid |
| tag_id | uuid |

#### follows
| 컬럼 | 타입 | 설명 |
|------|------|------|
| follower_id | uuid (FK → users) | 팔로우하는 사람 |
| following_id | uuid (FK → users) | 팔로우 받는 사람 |
| created_at | timestamptz | |

- **일방향 팔로우** (Instagram, Twitter 모델)
- 상호 팔로우 여부는 애플리케이션 레벨에서 계산

#### likes
| 컬럼 | 타입 |
|------|------|
| user_id | uuid |
| pin_id | uuid |
| created_at | timestamptz |

#### comments
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | |
| pin_id | uuid (FK → pins) | |
| user_id | uuid (FK → users) | |
| body | text | |
| created_at | timestamptz | |

#### notifications
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | |
| recipient_id | uuid (FK → users) | 알림 받는 사람 |
| actor_id | uuid (FK → users) | 알림 유발한 사람 |
| type | enum | `follow` / `like` / `comment` |
| target_pin_id | uuid (FK → pins, nullable) | 대상 핀 |
| target_comment_id | uuid (FK → comments, nullable) | 대상 댓글 |
| read_at | timestamptz (nullable) | 읽은 시각 |
| created_at | timestamptz | |

- 같은 사람이 같은 대상에 반복 알림을 보내면 최신 한 건만 유지 (unique index on `(recipient_id, actor_id, type, target_pin_id)`)
- Supabase Realtime 채널로 실시간 push
- 30일 경과 알림은 주기적 배치로 삭제

---

## 5. 핵심 기능 상세

### 5.1 3D 지구본 뷰 (CesiumJS)

- **메인 화면:** 위성 텍스처 3D 지구가 렌더링됨
- **내 핀 표시:** 방문한 위치에 커스텀 마커 렌더링
- **트립 루트:** 트립 내 핀들을 선(Polyline)으로 연결해 동선 시각화
- **클러스터링:** 줌 레벨에 따라 핀 클러스터링 (클라이언트 사이드 Supercluster)
- **카메라 이동:** 핀 클릭 시 해당 위치로 부드러운 flyTo 애니메이션
- **레이어 전환:** 위성/지형/스트리트 레이어 토글

**리스크 완화 설계 (필수 준수):**
- `components/globe/` 디렉토리에 완전 격리 (외부는 props/이벤트만 사용)
- `next/dynamic` + `{ ssr: false }`로 lazy load
- 초기 화면: 정적 위성 블러 이미지 + 스켈레톤 → Cesium 로드 완료 후 swap
- Cesium 번들은 메인 번들에서 code-split
- Cesium Ion 토큰: 환경변수로 주입, 무료 플랜으로 시작 (사용량 모니터링)
- 엔진 교체 가능성을 전제로 추상화 레이어 유지 (`GlobeEngine` 인터페이스)

### 5.2 핀 생성 / 편집

**위치 지정 방법 (3가지, 우선순위 순):**
1. **사진 EXIF 자동 추출** — 업로드한 사진에 GPS 메타데이터가 있으면 자동 적용
2. **장소 검색** — 장소명 입력 후 검색 결과 선택 (Mapbox Geocoding)
3. **지도에서 직접 클릭** — 3D 지구에서 원하는 지점 탭

**핀 콘텐츠:**
- 제목 (필수)
- 방문 날짜 (필수)
- 일기 텍스트 (마크다운, 선택)
- 사진 최대 10장 (드래그&드롭, 순서 변경 가능)
- 태그 (쉼표 구분 입력, 자동완성)
- 공개 범위: 전체공개 / 나만보기 / 친구공개

**사진 처리 파이프라인:**
1. 파일 선택 시 `exifr`로 EXIF 파싱 → GPS 추출
2. `browser-image-compression`으로 최대 2048px, WebP 변환 (클라이언트)
3. 압축본을 Supabase Storage에 업로드: `{user_id}/{pin_id}/{uuid}.webp`
4. 표시 시 Supabase Image Transformation URL로 리사이즈 요청 (`?width=800&quality=80`)
5. Next.js `<Image>` + loader 커스터마이즈로 연결
6. 업로드 실패 시 개별 재시도 UI

### 5.3 트립 관리

- 트립 생성: 제목, 기간(날짜 범위), 대표 이미지
- 핀을 트립에 연결/해제 가능
- 트립 페이지: 연결된 핀들을 지도 + 타임라인 형식으로 표시
- 트립 단위 공개 범위 설정

### 5.4 피드 & 탐색

**피드 (팔로우 기반):**
- 팔로우한 사용자의 공개/친구공개 핀이 시간순 역순으로 나열
- cursor-based pagination (`created_at`, `id` 복합 커서)
- MVP는 fan-out-on-read (쿼리 시점에 join) — MAU 1000 수준에서 충분

**탐색 (전체 공개 콘텐츠):**
- **필터:** 나라 / 도시 / 태그
- **정렬:** 최신순 / 인기순 (좋아요 7일 누적 기준)
- **지도 탐색 모드:** 3D 지구에서 공개 핀들을 클러스터로 탐색 (뷰포트 bbox 쿼리)

**콘텐츠 카드:**
- 대표 사진 썸네일
- 제목, 장소명, 방문일
- 좋아요 수, 댓글 수
- 작성자 프로필

### 5.5 소셜 기능

- **팔로우/언팔로우** (일방향, 승인 없음)
- **좋아요** (핀 단위)
- **댓글** (핀 단위, 1 depth)
- **알림:**
  - 트리거: 팔로우, 좋아요, 댓글
  - 저장: `notifications` 테이블 (영구)
  - 전달: Supabase Realtime 채널 `notifications:{user_id}`
  - UI: 헤더 벨 아이콘 + 드롭다운, 안 읽은 카운트

### 5.6 공유 기능

- **링크 복사:** `https://앱도메인/pins/{pin_id}` 클립보드 복사
- **OG 카드 미리보기:** 링크 공유 시 대표 사진 + 제목 + 장소명이 인스타그램 카드형으로 렌더링 (Vercel OG)
  - `og:title`, `og:description`, `og:image` 자동 생성
  - 카카오톡 / 트위터 / iMessage 공유 지원

---

## 6. 페이지 & 라우팅

```
/                          → 메인 (3D 지구, 로그인 전 랜딩)
/explore                   → 탐색 (공개 핀 피드 + 지도)
/feed                      → 피드 (팔로우 기반, 로그인 필수)
/map                       → 내 지도 (개인 3D 지구, 로그인 필수)
/trips                     → 트립 목록
/trips/[id]                → 트립 상세
/pins/new                  → 핀 생성
/pins/[id]                 → 핀 상세 (공유 타겟 URL, SSR)
/pins/[id]/edit            → 핀 편집
/[username]                → 사용자 프로필 + 공개 핀 지도 (SSR)
/[username]/trips          → 사용자 트립 목록
/settings                  → 계정 설정
/notifications             → 알림 목록
/auth/callback             → Google OAuth 콜백
```

- **SSR 페이지:** `/pins/[id]`, `/[username]`, `/explore` (SEO + OG 카드)
- **CSR 페이지:** `/map`, `/trips/[id]` 등 3D 지구를 주로 쓰는 페이지
- 모든 SSR 페이지에서 Cesium 섹션은 `dynamic(ssr: false)`로 격리

---

## 7. 인증 & 권한

### 인증
- **방식:** Google OAuth 2.0 (Supabase Auth 내장)
- **미인증 접근:** `/explore`, `/pins/[id]` (public인 경우), `/[username]` — 읽기 전용 허용
- **세션:** Supabase JWT (Access Token 1시간, Refresh Token 30일)

### Row Level Security (RLS) 정책

모든 테이블 RLS 활성화. 핵심 정책:

**pins**
- SELECT:
  - `visibility = 'public'` → 누구나
  - `visibility = 'friends'` → 작성자 또는 **작성자를 팔로우하는 사용자**
  - `visibility = 'private'` → 작성자 본인만
- INSERT/UPDATE/DELETE: `auth.uid() = user_id`

**trips**: pins와 동일 규칙. 트립이 private이면 하위 public 핀도 트립 페이지에서 숨김 (쿼리 레벨에서 필터링).

**follows**: 본인이 follower/following인 행만 SELECT/DELETE 가능

**notifications**: `recipient_id = auth.uid()`인 행만 SELECT/UPDATE 가능

**likes, comments**: 공개 핀에 대한 것은 누구나 SELECT. INSERT는 자신 행만. DELETE는 본인 또는 핀 작성자.

### "friends" 가시성 정의 (확정)

> `visibility = 'friends'` 핀은 **작성자가 팔로우를 받은 사람(팔로워)** 에게 보인다.
>
> 즉 "나를 팔로우하는 사람에게만 공개"라는 의미. 상호 팔로우 조건이 아님.

근거: 일방향 팔로우 모델에서 가장 직관적이고 RLS 구현이 단순함 (follows 테이블 1회 join).

---

## 8. 미디어 제한 & 스토리지 정책

| 항목 | 제한 |
|------|------|
| 핀당 사진 수 | 최대 10장 |
| 사진 최대 용량 | 장당 10MB (업로드 전 클라이언트 리사이즈) |
| 동영상 | MVP 미지원 |
| 허용 포맷 | JPEG, PNG, HEIC, WebP |
| Storage 버킷 | `pin-photos` (public read, auth write, RLS로 작성자만 write) |
| 이미지 변환 | Supabase Image Transformation — `width`, `quality` 파라미터로 on-the-fly 리사이즈 |

---

## 9. 공개 범위 정책

| 설정 | 설명 | 누가 볼 수 있나 |
|------|------|----------------|
| public | 전체 공개 | 누구나 (로그인 불필요) |
| friends | 친구 공개 | 작성자의 팔로워 (§7 참조) |
| private | 나만 보기 | 작성자 본인만 |

- 핀과 트립 각각 독립적으로 설정 가능
- 트립이 private이면 하위 핀이 public이어도 트립 페이지에서는 숨김 (핀 상세 URL로는 접근 가능)

---

## 10. 엣지 케이스 & 처리 방침

| 케이스 | 처리 방침 |
|--------|-----------|
| EXIF GPS 없는 사진 | 장소 검색 또는 지도 클릭으로 fallback |
| 동일 좌표 핀 중복 | 클러스터링으로 표시, 각 핀 개별 접근 가능 |
| 오프라인 상태 | 피드/탐색 캐시 (React Query stale-while-revalidate). 작성은 온라인 필요 |
| 사진 업로드 실패 | 업로드된 것만 저장, 실패 항목 재시도 UI 제공 |
| 계정 삭제 | 핀/사진/댓글 cascade 삭제. Storage 파일은 Edge Function 배치로 정리 |
| 핀 없는 사용자 프로필 | 빈 지구 + "첫 핀을 추가해보세요" CTA |
| 공유 링크 → 비공개 핀 | 404 페이지 반환 (403 대신 존재 은닉) |
| CesiumJS 로딩 느림 | Suspense + 스켈레톤 UI, SSR 비활성화 (CSR only) |
| 여행 중 타임존 변경 | `visited_at`은 로컬 date, `visited_tz` 별도 저장해 표시 시 해석 |

---

## 11. 비기능 요건

| 항목 | 목표 | 비고 |
|------|------|------|
| 쉘(TTFB) | < 800ms (4G) | SSR 페이지 |
| LCP (3D 제외 화면) | < 2.5초 (4G) | 피드, 프로필 등 |
| LCP (3D 포함 화면) | 정적 프록시 화면 기준 < 2.5초 / Cesium 인터랙티브 < 5초 (4G) | 첫 페인트와 3D TTI 분리 측정 |
| 3D 지구 FPS | 최소 30fps (모바일 중급 기기, Chrome) | iPhone 12 / Galaxy S21 기준 |
| CLS | < 0.1 | |
| 번들 크기 (초기) | < 250KB gzipped (Cesium 제외) | Cesium은 chunk 분리 |
| 이미지 CDN | Supabase Image Transformation, WebP 서빙 | |
| 접근성 | WCAG 2.1 AA (키보드 탐색, aria-label) | shadcn/ui 활용 |
| SEO | 공개 핀/프로필 페이지 SSR + OG 메타태그 | |

**주:** "LCP < 3초 (3G)" 초기 목표는 CesiumJS 번들 특성상 비현실적이어서 네트워크 기준을 4G로, 3D 포함 화면은 분리 측정으로 재조정함.

---

## 12. 관측성 & 분석

### 에러 모니터링
- **Sentry** 연동
  - 프런트엔드 (Next.js SDK)
  - Edge Functions
  - 소스맵 업로드 (배포 파이프라인 통합)
- 사용자 세션 리플레이는 개인정보 영향 검토 후 결정 (MVP에서는 비활성화)

### 성능 모니터링
- **Vercel Analytics** — 페이지뷰, 지역별 트래픽
- **Vercel Speed Insights** — Core Web Vitals (LCP, INP, CLS)

### 프로덕트 분석
- **PostHog** (Self-hosted 또는 Cloud)
- 주요 이벤트:
  - `signup_completed`
  - `pin_created` (properties: method=exif/search/click, has_photo)
  - `trip_created`
  - `follow_created`
  - `share_link_clicked`
  - `feed_scrolled` (pagination depth)

### KPI 측정 (§18 참조)
| 지표 | 측정 방법 |
|------|-----------|
| MAU | PostHog 고유 사용자 (30일) |
| 1인당 평균 핀 수 | `pins` 테이블 집계 |
| 30일 리텐션 | PostHog Retention Report |
| 핀 공개 비율 | `pins.visibility` 집계 |

---

## 13. 테스트 전략

### 범위
- **단위 테스트 (Vitest):** 유틸 함수, zod 스키마, 훅
- **통합 테스트 (Vitest + Testing Library):** 컴포넌트 렌더링, 폼 검증
- **E2E 테스트 (Playwright):** 핵심 플로우
  - 회원가입/로그인
  - 핀 생성 (EXIF, 검색, 클릭 각 경로)
  - 피드 로드 / 무한 스크롤
  - 공개 링크 공유
- **시각 회귀 (선택):** Playwright screenshot diff — MVP는 보류

### 로컬 환경
- `supabase start` → 로컬 Postgres + Auth + Storage 에뮬레이션
- 시드 데이터 스크립트 (`supabase/seed.sql`)
- 테스트 DB는 E2E마다 truncate

### CI
- GitHub Actions: lint → typecheck → unit test → E2E (PR당)
- Vercel Preview Deploy + Playwright 스모크 테스트

### CesiumJS 테스트 전략
- Cesium 자체는 mock (jest.mock `cesium` → 스텁)
- 3D 인터랙션은 E2E에서 제외, 수동 QA 체크리스트로 대체

---

## 14. 개발 환경 & 마이그레이션

### 로컬 개발
```bash
# 최초 1회
npm install
supabase init
supabase start

# 개발 서버
npm run dev
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

### 마이그레이션 워크플로
- 마이그레이션 파일: `supabase/migrations/*.sql`
- 생성: `supabase migration new <name>`
- 로컬 적용: `supabase db reset`
- 프로덕션 적용: `supabase db push` (또는 GitHub Action)
- 타입 생성: `supabase gen types typescript --local > src/types/database.ts`

### 브랜치 전략
- `main` — 프로덕션 자동 배포
- `develop` — 개발 통합
- `feat/*`, `fix/*` — 기능/버그 브랜치

---

## 15. 국제화 (i18n) & 타임존

### 언어
- **MVP 언어:** 한국어 (ko) 단일
- **구조만 i18n-ready:** `next-intl` 도입 + `messages/ko.json`
- 추후 영어(en), 일본어(ja) 추가 시 파일만 추가하면 됨

### 타임존
- 서버 저장: 모든 `timestamptz`는 UTC
- 사용자 표시: 브라우저 `Intl.DateTimeFormat`로 로컬 변환
- `visited_at` (date): 여행지 로컬 날짜 기준 저장, `visited_tz`에 IANA 타임존 문자열 보관
- 표시 시: "2026년 3월 15일 (도쿄 기준)" 같이 명시 가능하게 함

---

## 16. 법적 준수 사항

### 한국 법률 검토 필요 항목
- **위치정보법:** 타인의 위치정보를 수집/제공하는 경우 위치정보사업자 신고 의무. MVP는 본인이 자발적으로 입력하는 위치만 다루므로 대체로 비대상이나, 법무 검토 권장.
- **개인정보보호법:** 개인정보처리방침 필수 (`/privacy`)
- **정보통신망법:** 이용약관 필수 (`/terms`)
- **청소년 보호:** 만 14세 미만 가입 제한 또는 법정대리인 동의 절차

### MVP 출시 전 필수 문서
- [ ] 개인정보처리방침
- [ ] 이용약관
- [ ] 쿠키/추적 동의 배너 (PostHog 등)
- [ ] 계정 삭제 및 데이터 열람/삭제 요청 프로세스

### 신고 / 부적절 콘텐츠 (MVP 최소 구현)
- 핀/댓글 신고 버튼 → `reports` 테이블에 저장
- 수동 검토 (관리자 대시보드는 v1.1 이후)
- 약관 위반 시 운영자가 `visibility = 'private'` 강제 처리 가능한 관리 경로 필요

---

## 17. MVP 범위 (v1.0)

### 포함
- [x] Google 로그인
- [x] 3D CesiumJS 지구 메인 화면
- [x] 핀 생성/편집/삭제 (텍스트 + 사진 최대 10장)
- [x] 위치 지정: 사진 EXIF 자동 추출 / 장소 검색 / 지도 클릭
- [x] 트립 생성 및 핀 연결
- [x] 공개 범위 설정 (public/private/friends)
- [x] 팔로우 / 피드 / 탐색 (나라·도시·태그 필터, 인기순)
- [x] 좋아요 + 댓글
- [x] 알림 (팔로우/좋아요/댓글, Realtime)
- [x] 링크 공유 + OG 카드 미리보기 (카카오톡/트위터 대응)
- [x] 개인정보처리방침 / 이용약관
- [x] Sentry + Vercel Analytics + PostHog 통합

### 제외 (v2 이후)
- [ ] 동영상 업로드
- [ ] 오프라인 모드 (쓰기)
- [ ] 모바일 네이티브 앱 (React Native / Flutter)
- [ ] 비즈니스 모델 구현 (Freemium / 광고)
- [ ] 협업 트립 (다중 기여자)
- [ ] AI 여행 추천
- [ ] 관리자 대시보드
- [ ] 다국어(en/ja)

---

## 18. 목표 지표 (MVP KPI)

| 지표 | 목표 | 측정 (§12) |
|------|------|-----------|
| MAU | 1,000명 | PostHog |
| 1인당 평균 핀 수 | 5개 이상 | DB 집계 |
| 30일 리텐션 | 20% 이상 | PostHog |
| 핀 공개 비율 | 50% 이상 | DB 집계 |
| P90 LCP (3D 제외) | < 3초 | Vercel Speed Insights |

---

## 19. 미결 사항 (TBD)

- [ ] 앱 이름 / 도메인
- [ ] 비즈니스 모델 (Freemium 유력)
- [ ] CesiumJS Ion 토큰 플랜 (무료로 시작 후 재평가)
- [ ] 신고 처리 SLA
- [ ] Sentry/PostHog self-host vs cloud
- [ ] 위치정보법 법무 검토 결과
