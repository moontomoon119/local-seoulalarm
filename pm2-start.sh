#!/bin/bash

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}=========================================="
echo -e "  🚀 PM2로 백그라운드 서버 시작"
echo -e "==========================================${NC}"
echo

# PM2 설치 확인
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}❌ PM2가 설치되지 않았습니다. setup.sh를 먼저 실행해주세요.${NC}"
    exit 1
fi

# 기존 PM2 프로세스 정리
echo -e "${BLUE}🧹 기존 PM2 프로세스 정리 중...${NC}"
pm2 delete mongtang-backend 2>/dev/null || true
pm2 delete mongtang-frontend 2>/dev/null || true

# 백엔드 PM2로 시작
echo -e "${BLUE}🔧 백엔드 서버를 PM2로 시작 중...${NC}"
cd local-backend
if pm2 start npm --name "mongtang-backend" -- run start:server; then
    echo -e "${GREEN}✅ 백엔드 서버 시작 완료${NC}"
else
    echo -e "${RED}❌ 백엔드 서버 시작 실패${NC}"
    exit 1
fi
cd ..

# 백엔드 상태 확인 대기
echo -e "${YELLOW}⏳ 백엔드 서버 안정화 대기 중...${NC}"
sleep 10

# 백엔드 상태 확인
for i in {1..10}; do
    if curl -s http://localhost:3001/api/health > /dev/null; then
        echo -e "${GREEN}✅ 백엔드 서버 정상 작동 확인${NC}"
        break
    fi
    echo -e "${YELLOW}💤 백엔드 서버 확인 중... ($i/10)${NC}"
    sleep 2
    
    if [ $i -eq 10 ]; then
        echo -e "${RED}❌ 백엔드 서버 응답 없음${NC}"
        exit 1
    fi
done

# 프론트엔드 PM2로 시작
echo -e "${BLUE}🎨 프론트엔드 서버를 PM2로 시작 중...${NC}"
cd local-frontend
if pm2 start npm --name "mongtang-frontend" -- run dev; then
    echo -e "${GREEN}✅ 프론트엔드 서버 시작 완료${NC}"
else
    echo -e "${RED}❌ 프론트엔드 서버 시작 실패${NC}"
    exit 1
fi
cd ..

# 부팅시 자동 시작 설정
echo -e "${BLUE}⚙️ 부팅시 자동 시작 설정 중...${NC}"
pm2 startup

echo -e "${BLUE}💾 현재 PM2 상태 저장 중...${NC}"
pm2 save

# PM2 상태 확인
echo
echo -e "${GREEN}📊 PM2 상태:${NC}"
pm2 status

echo
echo -e "${GREEN}🎉 PM2 백그라운드 서버 시작 완료!${NC}"
echo
echo -e "${BLUE}📋 접속 정보:${NC}"
echo -e "${YELLOW}  🌐 프론트엔드: http://localhost:3000${NC}"
echo -e "${YELLOW}  🔧 백엔드 API: http://localhost:3001${NC}"
echo -e "${YELLOW}  📊 API 상태: http://localhost:3001/api/health${NC}"
echo
echo -e "${BLUE}📋 유용한 PM2 명령어들:${NC}"
echo -e "${YELLOW}  pm2 status                    # 상태 확인${NC}"
echo -e "${YELLOW}  pm2 logs mongtang-backend     # 백엔드 로그 확인${NC}"
echo -e "${YELLOW}  pm2 logs mongtang-frontend    # 프론트엔드 로그 확인${NC}"
echo -e "${YELLOW}  pm2 restart mongtang-backend  # 백엔드 재시작${NC}"
echo -e "${YELLOW}  pm2 stop mongtang-backend     # 백엔드 중지${NC}"
echo -e "${YELLOW}  pm2 monit                     # 실시간 모니터링${NC}"
echo
echo -e "${GREEN}✅ 이제 컴퓨터를 재부팅해도 자동으로 서버가 시작됩니다!${NC}"
echo