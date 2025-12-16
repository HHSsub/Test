-- RLS 정책 정리 스크립트
-- Multiple Permissive Policies 경고 해결
-- Supabase SQL Editor에서 실행하세요

-- ============================================
-- 1. boards 테이블 정책 정리
-- ============================================
-- 기존 정책 삭제
DROP POLICY IF EXISTS "Allow public read access to boards" ON boards;
DROP POLICY IF EXISTS "Allow all write access to boards" ON boards;

-- 단일 통합 정책으로 재생성 (SELECT와 ALL을 하나로 통합)
CREATE POLICY "Allow all operations on boards"
ON boards
FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================
-- 2. media_mapping 테이블 정책 정리
-- ============================================
-- media_mapping 테이블이 있는지 확인 후 정책 정리
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'media_mapping') THEN
    -- 기존 모든 정책 삭제
    DROP POLICY IF EXISTS "Allow all operations on media_mapping" ON media_mapping;
    DROP POLICY IF EXISTS "Allow authenticated insert/update" ON media_mapping;
    DROP POLICY IF EXISTS "Allow public read access" ON media_mapping;
    
    -- 단일 통합 정책으로 재생성
    CREATE POLICY "Allow all operations on media_mapping"
    ON media_mapping
    FOR ALL
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;

-- ============================================
-- 3. Storage 버킷 정책 확인 및 정리
-- ============================================
-- Storage 버킷이 public인지 확인
UPDATE storage.buckets
SET public = true
WHERE id = 'studio_upnexx';

-- Storage objects 정책 정리 (기존 정책 삭제)
DROP POLICY IF EXISTS "Allow public upload to studio_upnexx" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read from studio_upnexx" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete from studio_upnexx" ON storage.objects;

-- Storage objects에 대한 통합 정책 생성
-- INSERT (업로드)
CREATE POLICY "Allow public upload to studio_upnexx"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'studio_upnexx');

-- SELECT (읽기)
CREATE POLICY "Allow public read from studio_upnexx"
ON storage.objects
FOR SELECT
USING (bucket_id = 'studio_upnexx');

-- UPDATE (덮어쓰기)
CREATE POLICY "Allow public update in studio_upnexx"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'studio_upnexx')
WITH CHECK (bucket_id = 'studio_upnexx');

-- DELETE (삭제)
CREATE POLICY "Allow public delete from studio_upnexx"
ON storage.objects
FOR DELETE
USING (bucket_id = 'studio_upnexx');

-- 완료 메시지
SELECT 'RLS 정책 정리 완료! Multiple Permissive Policies 경고가 해결되었습니다.' as message;

