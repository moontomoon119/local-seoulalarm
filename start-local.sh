#!/bin/bash

# 로컬 개발 환경 시작 스크립트

echo "🚀 몽탕 프로젝트 로컬 환경 시작"

# 컬러 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 함수: 프로세스 존재 여부 확인
check_process() {
    if pgrep -f "$1" > /dev/null; then
        return 0
    else
        return 1
    fi
}

# 함수: 포트 사용 여부 확인
check_port() {
    if netstat -tuln | grep ":$1 " > /dev/null; then
        return 0
    else
        return 1
    fi
}

# 환경 변수 파일 확인 및 생성
setup_env_files() {
    echo -e "${BLUE}📋 환경 변수 파일 설정 중...${NC}"
    
    # 백엔드 환경 변수
    if [ ! -f "local-backend/.env" ]; then
        echo -e "${YELLOW}⚠️  local-backend/.env 파일이 없습니다. .env.example에서 복사합니다.${NC}"
        cp local-backend/.env.example local-backend/.env
        echo -e "${GREEN}✅ local-backend/.env 파일이 생성되었습니다.${NC}"
    fi
    
    # 프론트엔드 환경 변수
    if [ ! -f "local-frontend/.env.local" ]; then
        echo -e "${YELLOW}⚠️  local-frontend/.env.local 파일이 없습니다. .env.example에서 복사합니다.${NC}"
        cp local-frontend/.env.example local-frontend/.env.local
        echo -e "${GREEN}✅ local-frontend/.env.local 파일이 생성되었습니다.${NC}"
    fi
}

# 의존성 설치 확인
check_dependencies() {
    echo -e "${BLUE}📦 의존성 설치 확인 중...${NC}"
    
    # 백엔드 의존성
    if [ ! -d "local-backend/node_modules" ]; then
        echo -e "${YELLOW}📦 백엔드 의존성을 설치합니다...${NC}"
        cd local-backend && npm install && cd ..
        echo -e "${GREEN}✅ 백엔드 의존성 설치 완료${NC}"
    fi
    
    # 프론트엔드 의존성
    if [ ! -d "local-frontend/node_modules" ]; then
        echo -e "${YELLOW}📦 프론트엔드 의존성을 설치합니다...${NC}"
        cd local-frontend && npm install && cd ..
        echo -e "${GREEN}✅ 프론트엔드 의존성 설치 완료${NC}"
    fi
}

# 백엔드 서버 시작
start_backend() {
    echo -e "${BLUE}🔧 백엔드 서버 시작 중...${NC}"
    
    if check_port 3001; then
        echo -e "${YELLOW}⚠️  포트 3001이 이미 사용 중입니다.${NC}"
        return 1
    fi
    
    cd local-backend
    npm run dev:server > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    cd ..
    
    echo -e "${GREEN}✅ 백엔드 서버가 시작되었습니다. (PID: $BACKEND_PID)${NC}"
    echo -e "${BLUE}📍 백엔드 URL: http://localhost:3001${NC}"
    echo -e "${BLUE}📊 API 상태: http://localhost:3001/api/health${NC}"
    
    return 0
}

# 프론트엔드 서버 시작
start_frontend() {
    echo -e "${BLUE}🎨 프론트엔드 서버 시작 중...${NC}"
    
    if check_port 3000; then
        echo -e "${YELLOW}⚠️  포트 3000이 이미 사용 중입니다.${NC}"
        return 1
    fi
    
    cd local-frontend
    npm run dev > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ..
    
    echo -e "${GREEN}✅ 프론트엔드 서버가 시작되었습니다. (PID: $FRONTEND_PID)${NC}"
    echo -e "${BLUE}🌐 프론트엔드 URL: http://localhost:3000${NC}"
    
    return 0
}

# 로그 디렉토리 생성
mkdir -p logs

# 메인 실행
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}  몽탕 프로젝트 로컬 환경 설정  ${NC}"
echo -e "${GREEN}================================${NC}"

setup_env_files
check_dependencies

echo -e "\n${BLUE}🚀 서버 시작 중...${NC}"

# 백엔드 시작
if start_backend; then
    sleep 3  # 백엔드가 완전히 시작될 때까지 대기
    
    # 백엔드 상태 확인
    for i in {1..10}; do
        if curl -s http://localhost:3001/api/health > /dev/null; then
            echo -e "${GREEN}✅ 백엔드 서버가 정상적으로 시작되었습니다.${NC}"
            break
        else
            echo -e "${YELLOW}⏳ 백엔드 서버 시작 대기 중... ($i/10)${NC}"
            sleep 2
        fi
        
        if [ $i -eq 10 ]; then
            echo -e "${RED}❌ 백엔드 서버 시작에 실패했습니다.${NC}"
            echo -e "${BLUE}📄 로그를 확인하세요: tail -f logs/backend.log${NC}"
            exit 1
        fi
    done
    
    # 프론트엔드 시작
    if start_frontend; then
        echo -e "\n${GREEN}🎉 모든 서버가 성공적으로 시작되었습니다!${NC}"
        echo -e "${GREEN}================================${NC}"
        echo -e "${BLUE}🌐 프론트엔드: http://localhost:3000${NC}"
        echo -e "${BLUE}🔧 백엔드: http://localhost:3001${NC}"
        echo -e "${BLUE}📊 API 상태: http://localhost:3001/api/health${NC}"
        echo -e "${GREEN}================================${NC}"
        echo -e "\n${YELLOW}💡 로그 확인:${NC}"
        echo -e "${BLUE}   백엔드: tail -f logs/backend.log${NC}"
        echo -e "${BLUE}   프론트엔드: tail -f logs/frontend.log${NC}"
        echo -e "\n${YELLOW}🛑 서버 종료: ./stop-local.sh${NC}"
        echo -e "\n${GREEN}⏰ 백엔드에서 매시간 자동 스크래핑이 실행됩니다.${NC}"
        echo -e "${BLUE}   스케줄: 중부권(5분) → 동북권A(15분) → 동북권B(25분) → 서북권(35분) → 서남권(45분) → 동남권(55분)${NC}"
        
        # PID 파일 저장
        echo $BACKEND_PID > logs/backend.pid
        echo $FRONTEND_PID > logs/frontend.pid
    else
        echo -e "${RED}❌ 프론트엔드 서버 시작에 실패했습니다.${NC}"
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
else
    echo -e "${RED}❌ 백엔드 서버 시작에 실패했습니다.${NC}"
    exit 1
fi