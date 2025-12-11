-- UPNEXX Studio Supabase 초기화 스크립트
-- Supabase SQL Editor에서 실행하세요

-- 1. boards 테이블 생성
CREATE TABLE IF NOT EXISTS boards (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  "order" INTEGER NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RLS 정책 설정
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;

-- 읽기는 public 허용
CREATE POLICY "Allow public read access to boards" ON boards
  FOR SELECT USING (true);

-- 쓰기는 전체 허용 (나중에 admin 인증으로 제한 가능)
CREATE POLICY "Allow all write access to boards" ON boards
  FOR ALL USING (true);

-- 3. 인덱스 생성
CREATE INDEX IF NOT EXISTS boards_order_idx ON boards("order");
CREATE INDEX IF NOT EXISTS boards_enabled_idx ON boards(enabled);
CREATE INDEX IF NOT EXISTS boards_type_idx ON boards(type);

-- 4. 초기 데이터 삽입
INSERT INTO boards (id, type, enabled, "order", content) VALUES
('hero-1', 'hero', true, 1, '{
  "headline": "영상 전문가가 AI를 활용하여 창조하는 고퀄리티 영상",
  "subheadline": "복잡한 없이, 원하는 완벽한 영상을 빠르게",
  "description": "스냅커머스팀부터 시네마틱 광고까지, 영상 전문가의 고퀄리티 결과물을 만났습니다.",
  "primaryCta": "샘플 영상 보기",
  "secondaryCta": "무료 상담 신청",
  "mediaType": "video",
  "mediaSrc": "/assets/hero-demo.mp4"
}'::jsonb),

('workflow-1', 'workflow', true, 2, '{
  "title": "영상 전문가가 AI를 활용하여 창조하는 고퀄리티 영상",
  "description": "복잡한 없이, 원하는 완벽한 영상을 빠르게",
  "steps": [
    {
      "icon": "💡",
      "title": "아이디어 공유",
      "description": "당신의 영상 목표를 입력하세요"
    },
    {
      "icon": "🎬",
      "title": "기획 및 제작",
      "description": "저희가 시나리오 많은 영상을 기획하고 완성해요"
    },
    {
      "icon": "📤",
      "title": "완성된 수령",
      "description": "최고 퀄리티의 영상을 바라보세요"
    }
  ]
}'::jsonb),

('problem-solution-1', 'problem_solution', true, 3, '{
  "title": "왜 AI를 활용한 광고를 선택해야 할까요?",
  "subtitle": "복잡한 광고 제작, 간단히 해결할 수 있습니다.",
  "cards": [
    {
      "image": "/assets/problem-1.jpg",
      "title": "영상 전문가 퀄리티",
      "description": "전문 촬영 강의와 완성도 높은 결과 영상까지 얻을 수 있습니다"
    },
    {
      "image": "/assets/problem-2.jpg",
      "title": "상상의 창작물 현실로",
      "description": "모델, 장소, 환경 없이도 AI로 상상을 현실로 자유롭게 구현합니다"
    },
    {
      "image": "/assets/problem-3.jpg",
      "title": "빠른 제작 시간",
      "description": "빠르게 대량의 캠페인과 시안을 생성, 시장 변화에 맞춰 활용 가능합니다"
    },
    {
      "image": "/assets/problem-4.jpg",
      "title": "90% 이상 비용 절감",
      "description": "기존 광고 제작 대비 훨씬 저렴한 비용으로 제작할 수 있습니다"
    }
  ]
}'::jsonb),

('benefits-1', 'benefits', true, 4, '{
  "title": "UPNEXX STUDIO 이용권이란?",
  "cards": [
    {
      "icon": "🎥",
      "title": "배경 생성",
      "description": "글로벌 TOP10 + 생성 AI를 하나의 플랫폼에서 비교 체험"
    },
    {
      "icon": "🖼️",
      "title": "이미지 영상 전환",
      "description": "이미지 업로드 후 스토리텔링으로 브랜드의 커뮤니케이션을 할 수 있습니다"
    },
    {
      "icon": "✨",
      "title": "텍스트로 이미지 생성",
      "description": "스낵커머스팀부터 시네마틱 광고까지, 영상 전문가의 고퀄리티 결과물을 만났습니다"
    },
    {
      "icon": "🎨",
      "title": "텍스트로 영상 생성",
      "description": "스낵커머스팀부터 시네마틱 광고까지, 영상 전문가의 고퀄리티 결과물을 만났습니다"
    }
  ]
}'::jsonb),

('pricing-1', 'pricing', true, 5, '{
  "title": "당신의 브랜드에 딱 맞는 캠페인 선택",
  "subtitle": "스낵커머스팀부터 시네마틱 광고까지, 지금 바로 시작하세요.",
  "plans": [
    {
      "name": "Sample Lite",
      "price": "50만원",
      "features": [
        "무료 아이디어 기획 상담(30분)",
        "대표 샘플 + 멀티텍 촬영을 공정",
        "AI 뮤직 및 모델 생성",
        "종료 및 수익 예상 [2주 내 수평]",
        "1스팟 총 2개 광고 제작 [2스팟 영상 공유]"
      ],
      "cta": "무료 체험",
      "highlighted": false
    },
    {
      "name": "Sample Premium",
      "price": "600만원",
      "features": [
        "AI 로그인 퀘리를 현재 성사사업",
        "[1스팟 현재 30초 내외 영상 세밀]",
        "프론트엔드 프레임밸 현대한 여러집",
        "15초 / 72초 기준 가를 [평균]",
        "시뮬레이션 모델, OCR 프레밸, 구축 등",
        "[48공가 가를 구현 보완]"
      ],
      "cta": "상담 문의",
      "highlighted": true
    },
    {
      "name": "Onboarding 10 Pack",
      "price": "6,000만원 / 5,000만원",
      "features": [
        "Premium 영상 10개 제작(30초 / 12초 2종)",
        "크리넬 SaaS 5,000건 넷대 고급뷰 외관 (모바일 및 외형) 제공",
        "Fast Track : 3~4 PM 실시간 및 빠른 수정에 따른 빠른",
        "AI 뮤직 외적의 크고과 버전",
        "샘플의 SaaS의 차원 과완, 하AI 가능성 이아니 모터 구축을 속도 대출 → 크고프턴 Scit 제공",
        "AI 콘포트 위한 모리나 1관 액세스",
        "드머닝 티시, AI 카멧튼 퀘리 크로킨포츠, 구축 긴딘과 외관"
      ],
      "cta": "문의하기",
      "highlighted": false
    }
  ]
}'::jsonb),

('faq-1', 'faq', true, 6, '{
  "title": "궁금한 모든 것, 바로 답해드립니다",
  "subtitle": "제작 대행에 대한 궁금증을 간단히 해결하세요.",
  "items": [
    {
      "question": "UPNEXX STUDIO의 영상 퀄리티는 어떤가요?",
      "answer": "저희는 전문 영상 제작팀의 노하우와 최신 AI 기술을 결합하여 완성도 높은 결과물을 제공합니다. 궁금한 점이 있다면 언제든 문의해주세요!"
    },
    {
      "question": "비용은 어떻게 책정 되나요?",
      "answer": "영상 길이와 횟수, 구성 등 의뢰하시는 내용에 따라 유동적으로 책정됩니다."
    },
    {
      "question": "업무 경험없이 나기 쯜은 보괄로 할까요?",
      "answer": "업도 레드생은 업무 사지 밋까지도 다양한 생세 커뮤니케이션 체로케이 방전합니다."
    },
    {
      "question": "수정 요청은 어떻게 내용 치나요?",
      "answer": "프레턴 외부 사프 밋크 구매할는 제작 플기 미스로 있습니다. 수정드는 피스하고 피드백을 주시면 좌밀하게 응드로앗습니다."
    },
    {
      "question": "환불이나 근데약 없이도 업무 제척의되기까?",
      "answer": "샘플틀 시정맨드 미끄로드 업드는 온대도는 원가톤 광저성있습니다."
    }
  ]
}'::jsonb),

('final-cta-1', 'final_cta', true, 7, '{
  "title": "상상만 하세요. 제작은 우리가 합니다",
  "subtitle": "고퀄리티 + 빠르게 + 비용 절감",
  "description": "스낵커머스팀부터 시네마틱 광고까지, 영상 전문가의 고퀄리티 결과물을 받아보세요",
  "primaryCta": "샘플 영상 보기",
  "secondaryCta": "무료 상담 신청",
  "mediaType": "image",
  "mediaSrc": "/assets/final-cta-visual.jpg"
}'::jsonb)

ON CONFLICT (id) DO NOTHING;

-- 완료 메시지
SELECT 'UPNEXX Studio Supabase 초기화 완료!' as message;
