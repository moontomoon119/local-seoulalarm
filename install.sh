#!/bin/bash

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 아스키 아트
cat << 'EOF'

 ██████   ██████  ██████  ████████  █████  ██████   ██████  
██        ██    ██ ██   ██    ██    ██   ██ ██   ██ ██       
██   ███  ██    ██ ██████     ██    ███████ ██   ██ ██   ███ 
██    ██  ██    ██ ██   ██    ██    ██   ██ ██   ██ ██    ██ 
 ██████    ██████  ██   ██    ██    ██   ██ ██████   ██████  

EOF

echo -e "${GREEN}=========================================="
echo -e "  🚀 몽탕 프로젝트 자동 설치 마법사"
echo -e "==========================================${NC}"
echo
echo -e "${BLUE}💡 이 스크립트는 다음을 자동으로 설치합니다:${NC}"
echo -e "${YELLOW}   ✓ PM2 프로세스 매니저${NC}"
echo -e "${YELLOW}   ✓ 프로젝트 의존성${NC}"
echo -e "${YELLOW}   ✓ 환경 변수 설정${NC}"
echo -e "${YELLOW}   ✓ 부팅시 자동 시작 설정${NC}"
echo

read -p "계속하시겠습니까? [y/N]: " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}설치가 취소되었습니다.${NC}"
    exit 0
fi

# setup.sh 파일 확인
if [ -f "setup.sh" ]; then
    echo -e "${GREEN}✅ setup.sh 파일을 찾았습니다.${NC}"
    echo -e "${BLUE}🚀 자동 설치를 시작합니다...${NC}"
    echo
    
    # 실행 권한 부여
    chmod +x setup.sh
    
    # 설치 실행
    ./setup.sh
    
    if [ $? -eq 0 ]; then
        echo
        echo -e "${GREEN}🎉 설치가 완료되었습니다!${NC}"
        echo
        echo -e "${BLUE}📋 다음 단계:${NC}"
        echo -e "${YELLOW}   1. ./start-local.sh   # 개발 모드로 테스트${NC}"
        echo -e "${YELLOW}   2. ./pm2-start.sh     # 백그라운드 실행${NC}"
        echo
        echo -e "${CYAN}💡 문제가 발생하면 README.md를 참조하세요.${NC}"
    else
        echo -e "${RED}❌ 설치 중 오류가 발생했습니다.${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ setup.sh 파일을 찾을 수 없습니다.${NC}"
    echo -e "${YELLOW}💡 이 파일을 프로젝트 루트 디렉토리에서 실행해주세요.${NC}"
    exit 1
fi