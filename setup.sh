#!/bin/bash

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}=========================================="
echo -e "  🚀 몽탕 프로젝트 자동 설치 (Linux/Mac)"
echo -e "==========================================${NC}"
echo

# Node.js 설치 확인
echo -e "${BLUE}📋 Node.js 설치 확인 중...${NC}"
if command -v node &> /dev/null; then
    echo -e "${GREEN}✅ Node.js 설치됨$(NC)"
    node --version
else
    echo -e "${RED}❌ Node.js가 설치되지 않았습니다${NC}"
    echo -e "${YELLOW}💡 https://nodejs.org 에서 최신 LTS 버전을 설치해주세요${NC}"
    exit 1
fi

# npm 확인
if command -v npm &> /dev/null; then
    echo -e "${GREEN}✅ npm 사용 가능${NC}"
else
    echo -e "${RED}❌ npm이 설치되지 않았습니다${NC}"
    exit 1
fi

# Git 설치 확인  
echo -e "${BLUE}📋 Git 설치 확인 중...${NC}"
if command -v git &> /dev/null; then
    echo -e "${GREEN}✅ Git 설치됨${NC}"
else
    echo -e "${RED}❌ Git이 설치되지 않았습니다${NC}"
    echo -e "${YELLOW}💡 패키지 매니저로 Git을 설치해주세요${NC}"
    echo -e "${YELLOW}   Ubuntu/Debian: sudo apt install git${NC}"
    echo -e "${YELLOW}   CentOS/RHEL: sudo yum install git${NC}"
    echo -e "${YELLOW}   macOS: brew install git${NC}"
    exit 1
fi

# PM2 글로벌 설치
echo -e "${BLUE}📦 PM2 글로벌 설치 중...${NC}"
if npm install -g pm2; then
    echo -e "${GREEN}✅ PM2 설치 완료${NC}"
else
    echo -e "${RED}❌ PM2 설치 실패${NC}"
    echo -e "${YELLOW}💡 권한 문제일 수 있습니다. sudo를 사용해보세요:${NC}"
    echo -e "${YELLOW}   sudo npm install -g pm2${NC}"
    exit 1
fi

# 백엔드 의존성 설치
echo -e "${BLUE}📦 백엔드 의존성 설치 중...${NC}"
cd local-backend
if npm install; then
    echo -e "${GREEN}✅ 백엔드 의존성 설치 완료${NC}"
else
    echo -e "${RED}❌ 백엔드 의존성 설치 실패${NC}"
    exit 1
fi
cd ..

# 프론트엔드 의존성 설치
echo -e "${BLUE}📦 프론트엔드 의존성 설치 중...${NC}"
cd local-frontend
if npm install; then
    echo -e "${GREEN}✅ 프론트엔드 의존성 설치 완료${NC}"
else
    echo -e "${RED}❌ 프론트엔드 의존성 설치 실패${NC}"
    exit 1
fi

# 환경 변수 파일 생성
echo -e "${BLUE}📝 환경 변수 파일 생성 중...${NC}"
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_FIREBASE_API_KEY=dummy-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dummy-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dummy-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dummy-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:dummy-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-DUMMY-ID
EOF
echo -e "${GREEN}✅ 프론트엔드 환경 변수 파일 생성 완료${NC}"

cd ..

# 백엔드 환경 변수 파일 생성
cat > local-backend/.env << 'EOF'
PORT=3001
DB_PATH=data/local.db
EOF
echo -e "${GREEN}✅ 백엔드 환경 변수 파일 생성 완료${NC}"

# 실행 권한 부여
chmod +x start-local.sh stop-local.sh pm2-start.sh pm2-stop.sh

echo
echo -e "${GREEN}🎉 설치 완료!${NC}"
echo
echo -e "${BLUE}📋 다음 명령어들을 사용하세요:${NC}"
echo
echo -e "${YELLOW}  ./start-local.sh     # 서버 시작 (개발 모드)${NC}"
echo -e "${YELLOW}  ./pm2-start.sh      # PM2로 백그라운드 실행${NC}"
echo -e "${YELLOW}  ./pm2-stop.sh       # PM2 서버 중지${NC}"
echo -e "${YELLOW}  pm2 status          # PM2 상태 확인${NC}"
echo
echo -e "${GREEN}💡 처음 실행시에는 ./start-local.sh를 실행해서 테스트해보세요${NC}"
echo