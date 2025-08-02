#!/bin/bash

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${GREEN}=========================================="
echo -e "  🚀 GitHub 리포지토리 설정"
echo -e "==========================================${NC}"
echo

# 기존 Git 정보 확인
if [ -d ".git" ]; then
    echo -e "${YELLOW}⚠️  기존 Git 리포지토리가 감지되었습니다.${NC}"
    echo -e "${BLUE}현재 원격 저장소:${NC}"
    git remote -v 2>/dev/null || echo "원격 저장소 없음"
    echo
    
    read -p "새로운 리포지토리로 변경하시겠습니까? [y/N]: " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}🧹 기존 Git 설정을 제거합니다...${NC}"
        rm -rf .git
        echo -e "${GREEN}✅ 기존 Git 설정 제거 완료${NC}"
    else
        echo -e "${YELLOW}기존 설정을 유지합니다.${NC}"
        exit 0
    fi
fi

# 새 Git 리포지토리 초기화
echo -e "${BLUE}📦 새 Git 리포지토리 초기화 중...${NC}"
git init

# 사용자 정보 설정 확인
echo -e "${BLUE}👤 Git 사용자 정보 확인 중...${NC}"
git_name=$(git config --global user.name 2>/dev/null)
git_email=$(git config --global user.email 2>/dev/null)

if [ -z "$git_name" ] || [ -z "$git_email" ]; then
    echo -e "${YELLOW}⚠️  Git 사용자 정보가 설정되지 않았습니다.${NC}"
    echo
    
    if [ -z "$git_name" ]; then
        read -p "이름을 입력하세요: " user_name
        git config --global user.name "$user_name"
    fi
    
    if [ -z "$git_email" ]; then
        read -p "이메일을 입력하세요: " user_email
        git config --global user.email "$user_email"
    fi
    
    echo -e "${GREEN}✅ Git 사용자 정보 설정 완료${NC}"
fi

# .gitignore 확인
if [ ! -f ".gitignore" ]; then
    echo -e "${RED}❌ .gitignore 파일이 없습니다.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ .gitignore 파일 확인 완료${NC}"

# 파일 추가 (Firebase 관련 폴더는 .gitignore에서 제외됨)
echo -e "${BLUE}📁 파일 추가 중...${NC}"
git add .

# 커밋
echo -e "${BLUE}📝 초기 커밋 생성 중...${NC}"
git commit -m "🚀 Initial commit: 몽탕 프로젝트 로컬 버전

✨ Features:
- 25개 서울시 자치구 공지사항 자동 수집
- 로컬 SQLite 데이터베이스 저장
- Express.js API 서버
- Next.js 프론트엔드
- PM2 백그라운드 실행 지원
- 크로스 플랫폼 지원 (Windows/Linux/Mac)
- 원클릭 설치 및 실행

🔧 Setup:
- Windows: install.bat 또는 setup.bat
- Linux/Mac: ./install.sh 또는 ./setup.sh

🚀 Quick Start:
- Windows: start-windows.bat
- Linux/Mac: ./start-local.sh

💡 Background Mode:
- Windows: pm2-start.bat
- Linux/Mac: ./pm2-start.sh

📋 Firebase 대비 장점:
- ✅ 완전 무료
- ✅ 원클릭 설치
- ✅ 오프라인 지원
- ✅ 무제한 사용"

echo -e "${GREEN}✅ 초기 커밋 완료${NC}"

# GitHub 원격 저장소 설정 안내
echo
echo -e "${CYAN}📋 다음 단계: GitHub 원격 저장소 연결${NC}"
echo
echo -e "${YELLOW}1. GitHub에서 새 리포지토리 생성:${NC}"
echo -e "   - https://github.com/new"
echo -e "   - Repository name: mongtang-project-local"
echo -e "   - Description: 서울시 자치구 공지사항 통합 검색 서비스 (로컬 버전)"
echo -e "   - Public 또는 Private 선택"
echo -e "   - README, .gitignore, license 추가하지 않음 (이미 있음)"
echo
echo -e "${YELLOW}2. 원격 저장소 연결 (리포지토리 생성 후 실행):${NC}"
echo -e "${BLUE}   git remote add origin https://github.com/[USERNAME]/mongtang-project-local.git${NC}"
echo -e "${BLUE}   git branch -M main${NC}"
echo -e "${BLUE}   git push -u origin main${NC}"
echo
echo -e "${GREEN}🎉 설정 완료! 이제 GitHub에 푸시할 준비가 되었습니다.${NC}"
echo
echo -e "${CYAN}💡 참고: Firebase 관련 폴더들은 자동으로 제외됩니다:${NC}"
echo -e "   - frontend/ (원본)"
echo -e "   - backend/ (원본)" 
echo -e "   - functions/"
echo -e "   - firebase.json"
echo -e "   - .firebaserc"
echo