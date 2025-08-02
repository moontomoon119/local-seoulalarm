@echo off
chcp 65001 >nul
echo.
echo ==========================================
echo   🚀 몽탕 프로젝트 서버 시작 (Windows)
echo ==========================================
echo.

:: 포트 사용 확인 및 정리
echo 🔍 포트 사용 상태 확인 중...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do taskkill /f /pid %%a >nul 2>&1

:: 환경 변수 파일 확인
if not exist "local-frontend\.env.local" (
    echo ❌ 환경 변수 파일이 없습니다. setup.bat을 먼저 실행해주세요.
    pause
    exit /b 1
)

if not exist "local-backend\.env" (
    echo ❌ 백엔드 환경 변수 파일이 없습니다. setup.bat을 먼저 실행해주세요.
    pause
    exit /b 1
)

:: 로그 디렉토리 생성
if not exist "logs" mkdir logs

echo 🔧 백엔드 서버 시작 중...
start "몽탕 백엔드" cmd /c "cd local-backend && npm run start:server"

:: 백엔드 시작 대기
echo ⏳ 백엔드 서버 시작 대기 중...
timeout /t 5 /nobreak >nul

:: 백엔드 상태 확인
for /l %%i in (1,1,10) do (
    curl -s http://localhost:3001/api/health >nul 2>&1
    if not errorlevel 1 (
        echo ✅ 백엔드 서버가 정상적으로 시작되었습니다
        goto frontend_start
    )
    echo 💤 백엔드 서버 시작 대기 중... (%%i/10)
    timeout /t 2 /nobreak >nul
)

echo ❌ 백엔드 서버 시작에 실패했습니다
pause
exit /b 1

:frontend_start
echo 🎨 프론트엔드 서버 시작 중...
start "몽탕 프론트엔드" cmd /c "cd local-frontend && npm run dev"

echo.
echo 🎉 모든 서버가 시작되었습니다!
echo.
echo 📋 접속 정보:
echo   🌐 프론트엔드: http://localhost:3000
echo   🔧 백엔드 API: http://localhost:3001
echo   📊 API 상태: http://localhost:3001/api/health
echo.
echo 💡 서버를 종료하려면 각 창에서 Ctrl+C를 누르세요
echo.
pause