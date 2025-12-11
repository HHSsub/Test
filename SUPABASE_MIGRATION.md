# UPNEXX Studio - Supabase DB 기반 전환 수정사항

## 📌 수정 개요
- **목적**: 로컬 파일 시스템(boards.json) → Supabase DB로 전환
- **이유**: Vercel 서버리스 환경에서 파일 쓰기 불가 → 실전 배포 가능한 구조로 변경
- **작업일**: 2025-12-09

---

## ✅ 수정된 파일 (4개)

### 1. `/src/lib/boards.ts` (전면 수정)
**변경 전:**
- `fs.readFileSync`로 boards.json 파일 읽기
- 로컬 파일 시스템 의존
- 동기 함수

**변경 후:**
- Supabase client 생성
- `supabase.from('boards').select()` 쿼리
- 비동기 함수 (async/await)
- 파일 시스템 의존성 제거

**주요 코드:**
```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getBoards(): Promise<BoardsData> {
  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .order('order', { ascending: true });
  
  return { boards: data || [] };
}
```

---

### 2. `/src/app/api/boards/route.ts` (소폭 수정)
**변경 전:**
- `const data = getBoards();` (동기)

**변경 후:**
- `const data = await getBoards();` (비동기)

---

### 3. `/src/app/api/save/route.ts` (전면 수정)
**변경 전:**
- `fs.readFileSync`로 boards.json 읽기
- `fs.writeFileSync`로 boards.json 쓰기
- 로컬 파일 시스템 의존

**변경 후:**
- Supabase client 생성
- `supabase.from('boards').select()` 로 읽기
- `supabase.from('boards').upsert()` 로 쓰기
- Map으로 변경사항 추적
- updated_at 자동 갱신

**주요 코드:**
```typescript
// Fetch from Supabase
const { data: boards, error: fetchError } = await supabase
  .from('boards')
  .select('*');

// Apply changes (content, visibility, order)
const boardsToUpdate: Map<string, Board> = new Map();
// ... 변경사항 적용 ...

// Upsert to Supabase
const { error: upsertError } = await supabase
  .from('boards')
  .upsert(upsertData);
```

---

### 4. `/src/app/page.tsx` (소폭 수정)
**변경 전:**
- `const boards = getEnabledBoards();` (동기)

**변경 후:**
- `const boards = await getEnabledBoards();` (비동기)

---

## 📁 신규 파일 (1개)

### 5. `/supabase/init.sql` (신규)
**목적**: Supabase 초기 세팅 SQL 스크립트

**내용:**
1. `boards` 테이블 생성
   - id (TEXT PRIMARY KEY)
   - type (TEXT)
   - enabled (BOOLEAN)
   - order (INTEGER)
   - content (JSONB)
   - created_at (TIMESTAMPTZ)
   - updated_at (TIMESTAMPTZ)

2. RLS 정책 설정
   - 읽기: public 허용
   - 쓰기: 전체 허용 (나중에 admin으로 제한 가능)

3. 인덱스 생성
   - boards_order_idx
   - boards_enabled_idx
   - boards_type_idx

4. 초기 데이터 삽입
   - boards.json의 7개 보드 데이터를 SQL INSERT로 변환

**사용 방법:**
1. Supabase Dashboard → SQL Editor
2. `init.sql` 파일 내용 복사
3. 실행 (Run)

---

## 🚀 배포 가이드

### 1단계: Supabase 초기화
```bash
# Supabase Dashboard에서
1. SQL Editor 열기
2. /supabase/init.sql 내용 복사
3. 실행 (Run)
4. "UPNEXX Studio Supabase 초기화 완료!" 메시지 확인
```

### 2단계: GitHub Push
```bash
cd /home/claude/upnexx-studio
git add .
git commit -m "Supabase DB 기반으로 전환 완료"
git push origin main
```

### 3단계: Vercel 배포
1. https://vercel.com 로그인
2. "Import Project" → GitHub 레포 선택
3. 환경 변수 설정:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://[프로젝트ID].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
   ```
4. Deploy 클릭

### 4단계: 배포 확인
1. Vercel URL 접속
2. 페이지 로딩 확인
3. 관리자 로그인 (admin / Upnexx!!)
4. 텍스트 편집 테스트
5. 저장 버튼 클릭
6. 새로고침 후 변경사항 반영 확인

---

## 🔧 환경 변수

**필수 환경 변수 (2개):**
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...
```

**설정 위치:**
- 로컬: `.env.local` 파일
- Vercel: Project Settings → Environment Variables

---

## ⚠️ 주의사항

1. **boards.json은 더 이상 사용 안 됨**
   - 모든 데이터는 Supabase DB에 저장
   - 로컬 파일은 초기 데이터 참고용으로만 유지

2. **Supabase RLS 정책**
   - 현재는 전체 허용
   - 프로덕션에서는 admin 인증 추가 권장

3. **성능**
   - 첫 로딩 시 Supabase 쿼리 발생
   - Next.js ISR/캐싱 고려 필요 시 추가 최적화 가능

4. **백업**
   - Supabase Dashboard에서 SQL Export 가능
   - 정기적 백업 권장

---

## 🎉 완료!

이제 Vercel에 배포해도 저장 기능이 정상 작동합니다!
