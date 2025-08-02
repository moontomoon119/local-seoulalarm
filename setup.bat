@echo off
chcp 65001 >nul
echo.
echo ==========================================
echo   🚀 몽탕 프로젝트 자동 설치 (Windows)
echo ==========================================
echo.

:: 관리자 권한 확인
net session >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ 관리자 권한으로 실행 중
) else (
    echo ❌ 관리자 권한이 필요합니다
    echo 💡 우클릭 → "관리자 권한으로 실행"으로 다시 실행해주세요
    pause
    exit /b 1
)

:: Node.js 설치 확인
echo 📋 Node.js 설치 확인 중...
node --version >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Node.js 설치됨
    node --version
) else (
    echo ❌ Node.js가 설치되지 않았습니다
    echo 💡 https://nodejs.org 에서 최신 LTS 버전을 설치해주세요
    pause
    exit /b 1
)

:: Git 설치 확인
echo 📋 Git 설치 확인 중...
git --version >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Git 설치됨
) else (
    echo ❌ Git이 설치되지 않았습니다
    echo 💡 https://git-scm.com 에서 Git을 설치해주세요
    pause
    exit /b 1
)

:: PM2 글로벌 설치
echo 📦 PM2 글로벌 설치 중...
call npm install -g pm2
if %errorLevel% == 0 (
    echo ✅ PM2 설치 완료
) else (
    echo ❌ PM2 설치 실패
    pause
    exit /b 1
)

:: 백엔드 의존성 설치
echo 📦 백엔드 의존성 설치 중...
cd local-backend
call npm install
if %errorLevel% == 0 (
    echo ✅ 백엔드 의존성 설치 완료
) else (
    echo ❌ 백엔드 의존성 설치 실패
    pause
    exit /b 1
)
cd ..

:: 프론트엔드 의존성 설치
echo 📦 프론트엔드 의존성 설치 중...
cd local-frontend
call npm install
if %errorLevel% == 0 (
    echo ✅ 프론트엔드 의존성 설치 완료
) else (
    echo ❌ 프론트엔드 의존성 설치 실패
    pause
    exit /b 1
)

:: 환경 변수 파일 생성
echo 📝 환경 변수 파일 생성 중...
echo NEXT_PUBLIC_API_BASE_URL=http://localhost:3001> .env.local
echo NEXT_PUBLIC_FIREBASE_API_KEY=dummy-api-key>> .env.local
echo NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dummy-project.firebaseapp.com>> .env.local
echo NEXT_PUBLIC_FIREBASE_PROJECT_ID=dummy-project>> .env.local
echo NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dummy-project.appspot.com>> .env.local
echo NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789>> .env.local
echo NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:dummy-app-id>> .env.local
echo NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-DUMMY-ID>> .env.local
echo ✅ 프론트엔드 환경 변수 파일 생성 완료

cd ..

:: 백엔드 환경 변수 파일 생성
echo PORT=3001> local-backend\.env
echo DB_PATH=data/local.db>> local-backend\.env
echo ✅ 백엔드 환경 변수 파일 생성 완료

echo.
echo 🎉 설치 완료!
echo.
echo 📋 다음 명령어들을 사용하세요:
echo.
echo   start-windows.bat     # 서버 시작 (개발 모드)
echo   pm2-start.bat        # PM2로 백그라운드 실행
echo   pm2-stop.bat         # PM2 서버 중지
echo   pm2-status.bat       # PM2 상태 확인
echo.
echo 💡 처음 실행시에는 start-windows.bat을 실행해서 테스트해보세요
echo.
pause