#!/usr/bin/env bash
# SPEC-INFRA-001: 개발 DB에 시드 데이터 적용
#
# 사용법:
#   SUPABASE_DEV_DB_URL=postgresql://... npm run db:seed

set -euo pipefail

DEV_URL="${SUPABASE_DEV_DB_URL:?SUPABASE_DEV_DB_URL 환경변수가 필요합니다}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SEED_FILE="$SCRIPT_DIR/../supabase/seed.sql"

if [ ! -f "$SEED_FILE" ]; then
  echo "❌ seed.sql 파일을 찾을 수 없습니다: $SEED_FILE"
  exit 1
fi

echo "=== 시드 데이터 적용 시작 ==="
echo "대상: 개발 Supabase"
echo ""

psql "$DEV_URL" < "$SEED_FILE"

echo ""
echo "=== 시드 데이터 적용 완료 ==="
echo "확인: 테스트 사용자 3명, 친구 관계 2쌍, 일기 7개, 스킨 3개"
