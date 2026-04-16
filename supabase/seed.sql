-- 개발용 시드 데이터
-- supabase db reset 실행 시 자동으로 적용됨

-- 테스트 태그
INSERT INTO tags (name) VALUES
  ('일본'), ('유럽'), ('맛집'), ('카페'), ('자연'), ('도시'), ('해변'), ('산'), ('역사'), ('야경')
ON CONFLICT (name) DO NOTHING;
