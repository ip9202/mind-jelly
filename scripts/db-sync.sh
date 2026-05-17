#!/usr/bin/env bash
# SPEC-INFRA-001: 프로덕션 → 개발 스키마 동기화
# pg_dump로 프로덕션 스키마를 추출하여 개발 DB에 적용
#
# 사용법:
#   SUPABASE_PROD_DB_URL=postgresql://... SUPABASE_DEV_DB_URL=postgresql://... npm run db:sync
#
# Connection string은 Supabase Dashboard > Settings > Database > Connection string에서 확인
# (Transaction pooler URL 사용 권장: port 6543)

set -euo pipefail

PROD_URL="${SUPABASE_PROD_DB_URL:?SUPABASE_PROD_DB_URL 환경변수가 필요합니다}"
DEV_URL="${SUPABASE_DEV_DB_URL:?SUPABASE_DEV_DB_URL 환경변수가 필요합니다}"

echo "=== 스키마 동기화 시작 ==="
echo "프로덕션 → 개발 Supabase"
echo ""

# 개발 DB에 기존 데이터가 있는지 확인
TABLE_COUNT=$(psql "$DEV_URL" -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'" 2>/dev/null | tr -d ' ' || echo "0")

if [ "$TABLE_COUNT" -gt 0 ]; then
  echo "⚠️  개발 DB에 ${TABLE_COUNT}개 테이블이 존재합니다."
  read -p "기존 스키마를 삭제하고 덮어쓰시겠습니까? (y/N): " confirm
  if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "취소됨."
    exit 0
  fi
fi

echo "프로덕션 스키마 덤프 중..."
pg_dump "$PROD_URL" --schema-only --no-owner --no-privileges --clean --if-exists > /tmp/mind-jelly-schema.sql

echo "개발 DB에 스키마 적용 중..."
psql "$DEV_URL" < /tmp/mind-jelly-schema.sql

# 임시 파일 정리
rm -f /tmp/mind-jelly-schema.sql

echo ""
echo "=== 스키마 동기화 완료 ==="
echo "다음: npm run db:seed 로 시드 데이터 생성"
