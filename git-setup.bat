@echo off
chcp 65001 >nul
title GitHub 리포지토리 설정

echo.
echo ==========================================
echo   🚀 GitHub 리포지토리 설정
echo ==========================================
echo.

:: 기존 Git 정보 확인
if exist ".git" (
    echo ⚠️  기존 Git 리포지토리가 감지되었습니다.
    echo 현재 원격 저장소:
    git remote -v 2>nul || echo 원격 저장소 없음
    echo.
    
    set /p "choice=새로운 리포지토리로 변경하시겠습니까? [y/N]: "
    if /i "%choice%"=="y" (
        echo 🧹 기존 Git 설정을 제거합니다...
        rmdir /s /q .git 2>nul
        echo ✅ 기존 Git 설정 제거 완료
    ) else (
        echo 기존 설정을 유지합니다.
        pause
        exit /b 0
    )
)

:: 새 Git 리포지토리 초기화
echo 📦 새 Git 리포지토리 초기화 중...
git init

:: 사용자 정보 설정 확인
echo 👤 Git 사용자 정보 확인 중...
git config --global user.name >nul 2>&1
if %errorLevel% neq 0 (
    echo ⚠️  Git 사용자 정보가 설정되지 않았습니다.
    echo.
    set /p "user_name=이름을 입력하세요: "
    set /p "user_email=이메일을 입력하세요: "
    
    git config --global user.name "%user_name%"
    git config --global user.email "%user_email%"
    
    echo ✅ Git 사용자 정보 설정 완료
)

:: .gitignore 확인
if not exist ".gitignore" (
    echo ❌ .gitignore 파일이 없습니다.
    pause
    exit /b 1
)

echo ✅ .gitignore 파일 확인 완료

:: 파일 추가 (Firebase 관련 폴더는 .gitignore에서 제외됨)
echo 📁 파일 추가 중...
git add .

:: 커밋
echo 📝 초기 커밋 생성 중...
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

echo ✅ 초기 커밋 완료

:: GitHub 원격 저장소 설정 안내
echo.
echo 📋 다음 단계: GitHub 원격 저장소 연결
echo.
echo 1. GitHub에서 새 리포지토리 생성:
echo    - https://github.com/new
echo    - Repository name: mongtang-project-local
echo    - Description: 서울시 자치구 공지사항 통합 검색 서비스 (로컬 버전)
echo    - Public 또는 Private 선택
echo    - README, .gitignore, license 추가하지 않음 (이미 있음)
echo.
echo 2. 원격 저장소 연결 (리포지토리 생성 후 실행):
echo    git remote add origin https://github.com/[USERNAME]/mongtang-project-local.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 🎉 설정 완료! 이제 GitHub에 푸시할 준비가 되었습니다.
echo.
echo 💡 참고: Firebase 관련 폴더들은 자동으로 제외됩니다:
echo    - frontend/ (원본)
echo    - backend/ (원본)
echo    - functions/
echo    - firebase.json
echo    - .firebaserc
echo.
pause