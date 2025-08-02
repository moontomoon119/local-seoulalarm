#!/bin/bash

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}=========================================="
echo -e "  🛑 PM2 서버 중지"
echo -e "==========================================${NC}"
echo

# PM2 프로세스 중지
echo -e "${BLUE}🛑 몽탕 백엔드 서버 중지 중...${NC}"
pm2 stop mongtang-backend 2>/dev/null || true
pm2 delete mongtang-backend 2>/dev/null || true

echo -e "${BLUE}🛑 몽탕 프론트엔드 서버 중지 중...${NC}"
pm2 stop mongtang-frontend 2>/dev/null || true
pm2 delete mongtang-frontend 2>/dev/null || true

# PM2 상태 확인
echo
echo -e "${GREEN}📊 PM2 상태:${NC}"
pm2 status

echo
echo -e "${GREEN}✅ 모든 서버가 중지되었습니다.${NC}"
echo