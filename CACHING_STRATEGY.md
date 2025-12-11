# UPNEXX Studio - 캐싱 전략 문서

## 📋 개요

이 문서는 UPNEXX Studio 웹사이트의 캐싱 전략을 설명합니다.

---

## 🎯 캐싱 목표

1. **성능 최적화**: 페이지 로딩 속도 향상
2. **대역폭 절감**: CDN을 통한 트래픽 최적화
3. **사용자 경험 개선**: 빠른 응답 시간

---

## 🔧 구현된 캐싱 전략

### 1. Static 파일 캐싱

**대상 파일:**
- 이미지: `.svg`, `.jpg`, `.jpeg`, `.png`, `.gif`, `.ico`, `.webp`, `.avif`
- 영상: `.mp4`, `.webm`, `.ogg`

**캐싱 헤더:**
```
Cache-Control: public, max-age=31536000, immutable
```

**설명:**
- `public`: 모든 캐시(브라우저, CDN)에서 저장 가능
- `max-age=31536000`: 1년 동안 캐시 유지
- `immutable`: 파일이 변경되지 않음을 명시

### 2. JSON 데이터 캐싱

**대상:** `/data/*` 경로의 모든 파일

**캐싱 헤더:**
```
Cache-Control: public, max-age=3600, s-maxage=86400, stale-while-revalidate
```

**설명:**
- `max-age=3600`: 브라우저에서 1시간 캐시
- `s-maxage=86400`: CDN에서 24시간 캐시
- `stale-while-revalidate`: 백그라운드에서 재검증하면서 오래된 캐시 제공

### 3. Supabase Storage 캐싱

**설정 위치:** `src/lib/supabase.ts`

**캐싱 헤더:**
```typescript
export const CACHE_CONTROL_HEADER = 'public, max-age=31536000, immutable';
```

**적용 함수:**
- `uploadImage()`: 이미지 업로드 시 자동 적용
- `uploadVideo()`: 영상 업로드 시 자동 적용

### 4. Next.js 이미지 최적화

**설정 위치:** `next.config.cjs`

**최적화 옵션:**
- 지원 포맷: AVIF, WebP
- Device Sizes: 640px ~ 3840px
- Image Sizes: 16px ~ 384px
- 최소 캐시 TTL: 60초

**이미지 최적화 함수:**
```typescript
getOptimizedImageUrl(bucket, path, {
  width: 1920,
  height: 1080,
  quality: 80
})
```

---

## 📊 캐싱 계층

```
┌─────────────────────────────────────────┐
│  브라우저 캐시 (Browser Cache)           │
│  - Static 파일: 1년                      │
│  - JSON 데이터: 1시간                    │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  CDN 캐시 (Cloudflare/Vercel Edge)      │
│  - Static 파일: 1년                      │
│  - JSON 데이터: 24시간                   │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Supabase Storage                       │
│  - 이미지/영상: 영구 저장                │
│  - Public URL with Cache-Control        │
└─────────────────────────────────────────┘
```

---

## 🚀 배포 시 자동 적용

### Vercel 배포
- Static 파일 자동 CDN 캐싱
- Edge Network를 통한 전 세계 배포
- 자동 이미지 최적화

### Cloudflare Pages 배포
- Edge Cache 자동 적용
- Global CDN 배포
- Worker를 통한 추가 최적화 가능

---

## 🔄 Cache Invalidation

### 수동 무효화
현재는 파일명이 변경될 때 자동으로 캐시가 갱신됩니다.
- 타임스탬프 기반 파일명: `1733712345_abc123.jpg`
- 새 파일 업로드 시 다른 URL 생성 → 자동 갱신

### 향후 자동 무효화 (Step M)
boards.json 저장 시:
1. Vercel API를 통한 전체 재배포
2. Cloudflare API를 통한 캐시 퍼지
3. Supabase Storage 파일 교체

---

## 📈 성능 지표 목표

- **First Contentful Paint (FCP)**: < 1.0s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.0s
- **Cache Hit Rate**: > 95%

---

## ⚙️ 환경별 설정

### 개발 환경 (Development)
```bash
npm run dev
```
- 캐싱 비활성화 (실시간 변경 반영)
- 이미지 최적화 활성화

### 프로덕션 환경 (Production)
```bash
npm run build
npm run start
```
- 모든 캐싱 전략 활성화
- Static Generation + ISR
- 이미지 최적화 활성화

---

## 🔍 캐싱 검증 방법

### 1. 브라우저 DevTools
1. Network 탭 열기
2. Disable cache 체크 해제
3. 페이지 새로고침
4. 응답 헤더에서 `Cache-Control` 확인

### 2. cURL 명령어
```bash
curl -I https://studio.upnexx.ai/image.jpg
```

응답 예시:
```
HTTP/2 200
cache-control: public, max-age=31536000, immutable
content-type: image/jpeg
```

### 3. Lighthouse 테스트
```bash
npm install -g lighthouse
lighthouse https://studio.upnexx.ai --view
```

---

## 📝 주의사항

1. **파일명 변경 시 캐시 갱신**
   - 타임스탬프 기반 파일명 사용 필수
   - 동일 파일명 재사용 금지

2. **큰 파일 업로드 제한**
   - 이미지: 5MB 이하
   - 영상: 50MB 이하

3. **CDN 배포 후 확인**
   - 실제 캐싱은 배포 후에만 확인 가능
   - 개발 환경에서는 시뮬레이션만 가능

---

## 🔗 관련 문서

- [Next.js Caching Documentation](https://nextjs.org/docs/app/building-your-application/caching)
- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Cloudflare Cache Documentation](https://developers.cloudflare.com/cache/)
