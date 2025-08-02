#!/bin/bash

# 로컬 개발 환경 종료 스크립트

echo "🛑 몽탕 프로젝트 로컬 환경 종료"

# 컬러 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# PID 파일에서 프로세스 종료
stop_from_pid_file() {
    local pid_file=$1
    local service_name=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            echo -e "${YELLOW}🛑 $service_name 서버 종료 중... (PID: $pid)${NC}"
            kill "$pid"
            sleep 2
            
            # 강제 종료가 필요한 경우
            if kill -0 "$pid" 2>/dev/null; then
                echo -e "${RED}⚠️  강제 종료 중...${NC}"
                kill -9 "$pid"
            fi
            
            echo -e "${GREEN}✅ $service_name 서버가 종료되었습니다.${NC}"
        else
            echo -e "${YELLOW}⚠️  $service_name 서버가 이미 종료되었습니다.${NC}"
        fi
        rm -f "$pid_file"
    fi
}

# 포트로 프로세스 찾아서 종료
stop_by_port() {
    local port=$1
    local service_name=$2
    
    local pid=$(lsof -ti:$port 2>/dev/null)
    if [ -n "$pid" ]; then
        echo -e "${YELLOW}🛑 $service_name 서버 종료 중... (포트 $port, PID: $pid)${NC}"
        kill "$pid"
        sleep 2
        
        # 강제 종료가 필요한 경우
        local check_pid=$(lsof -ti:$port 2>/dev/null)
        if [ -n "$check_pid" ]; then
            echo -e "${RED}⚠️  강제 종료 중...${NC}"
            kill -9 "$check_pid"
        fi
        
        echo -e "${GREEN}✅ $service_name 서버가 종료되었습니다.${NC}"
    else
        echo -e "${BLUE}ℹ️  $service_name 서버가 실행 중이지 않습니다.${NC}"
    fi
}

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}  몽탕 프로젝트 로컬 환경 종료  ${NC}"
echo -e "${GREEN}================================${NC}"

# PID 파일로 종료 시도
if [ -d "logs" ]; then
    stop_from_pid_file "logs/backend.pid" "백엔드"
    stop_from_pid_file "logs/frontend.pid" "프론트엔드"
fi

# 포트로 추가 확인 및 종료
echo -e "\n${BLUE}🔍 포트 상태 확인 및 정리...${NC}"
stop_by_port 3001 "백엔드"
stop_by_port 3000 "프론트엔드"

# 프로세스명으로 추가 정리
echo -e "\n${BLUE}🧹 프로세스 정리...${NC}"

# 백엔드 프로세스 정리
backend_pids=$(pgrep -f "ts-node.*server.ts" 2>/dev/null)
if [ -n "$backend_pids" ]; then
    echo -e "${YELLOW}🛑 남은 백엔드 프로세스 종료 중...${NC}"
    echo "$backend_pids" | xargs kill 2>/dev/null
    sleep 1
    
    # 강제 종료
    backend_pids=$(pgrep -f "ts-node.*server.ts" 2>/dev/null)
    if [ -n "$backend_pids" ]; then
        echo "$backend_pids" | xargs kill -9 2>/dev/null
    fi
fi

# 프론트엔드 프로세스 정리 (Next.js)
frontend_pids=$(pgrep -f "next.*dev" 2>/dev/null)
if [ -n "$frontend_pids" ]; then
    echo -e "${YELLOW}🛑 남은 프론트엔드 프로세스 종료 중...${NC}"
    echo "$frontend_pids" | xargs kill 2>/dev/null
    sleep 1
    
    # 강제 종료
    frontend_pids=$(pgrep -f "next.*dev" 2>/dev/null)
    if [ -n "$frontend_pids" ]; then
        echo "$frontend_pids" | xargs kill -9 2>/dev/null
    fi
fi

echo -e "\n${GREEN}✅ 모든 서버가 종료되었습니다.${NC}"

# 로그 파일 정보
if [ -d "logs" ]; then
    echo -e "\n${BLUE}📄 로그 파일이 보존되었습니다:${NC}"
    ls -la logs/*.log 2>/dev/null | while read line; do
        echo -e "${BLUE}   $line${NC}"
    done
    echo -e "${YELLOW}💡 로그 확인: tail -f logs/backend.log 또는 tail -f logs/frontend.log${NC}"
fi

echo -e "\n${GREEN}🚀 다시 시작하려면: ./start-local.sh${NC}"