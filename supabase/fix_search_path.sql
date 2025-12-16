-- Fix search_path security issue for update_media_mapping_timestamp function
-- Supabase SQL Editor에서 실행하세요

-- 기존 함수 삭제 (있는 경우)
DROP FUNCTION IF EXISTS public.update_media_mapping_timestamp() CASCADE;

-- search_path를 명시적으로 설정한 안전한 함수로 재생성
CREATE OR REPLACE FUNCTION public.update_media_mapping_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 트리거 재생성 (media_mapping 테이블이 있는 경우)
DROP TRIGGER IF EXISTS update_media_mapping_timestamp_trigger ON public.media_mapping;

CREATE TRIGGER update_media_mapping_timestamp_trigger
  BEFORE UPDATE ON public.media_mapping
  FOR EACH ROW
  EXECUTE FUNCTION public.update_media_mapping_timestamp();

-- 완료 메시지
SELECT 'update_media_mapping_timestamp 함수 보안 수정 완료!' as message;

