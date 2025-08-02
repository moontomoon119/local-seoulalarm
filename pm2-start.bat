@echo off
chcp 65001 >nul
echo.
echo ==========================================
echo   🚀 PM2로 백그라운드 서버 시작 (Windows)
echo ==========================================
echo.

:: PM2 설치 확인
pm2 --version >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ PM2 사용 가능
) else (
    echo ❌ PM2가 설치되지 않았습니다. setup.bat을 먼저 실행해주세요.
    pause
    exit /b 1
)

:: 기존 PM2 프로세스 정리
echo 🧹 기존 PM2 프로세스 정리 중...
pm2 delete mongtang-backend >nul 2>&1
pm2 delete mongtang-frontend >nul 2>&1

:: 백엔드 PM2로 시작
echo 🔧 백엔드 서버를 PM2로 시작 중...
cd local-backend
pm2 start npm --name "mongtang-backend" -- run start:server
if %errorLevel% == 0 (
    echo ✅ 백엔드 서버 시작 완료
) else (
    echo ❌ 백엔드 서버 시작 실패
    pause
    exit /b 1
)
cd ..

:: 백엔드 상태 확인 대기
echo ⏳ 백엔드 서버 안정화 대기 중...
timeout /t 10 /nobreak >nul

:: 프론트엔드 PM2로 시작
echo 🎨 프론트엔드 서버를 PM2로 시작 중...
cd local-frontend
pm2 start npm --name "mongtang-frontend" -- run dev
if %errorLevel% == 0 (
    echo ✅ 프론트엔드 서버 시작 완료
) else (
    echo ❌ 프론트엔드 서버 시작 실패
    pause
    exit /b 1
)
cd ..

:: 부팅시 자동 시작 설정
echo ⚙️ 부팅시 자동 시작 설정 중...
pm2 startup
echo.
echo 💾 현재 PM2 상태 저장 중...
pm2 save

:: PM2 상태 확인
echo.
echo 📊 PM2 상태:
pm2 status

echo.
echo 🎉 PM2 백그라운드 서버 시작 완료!
echo.
echo 📋 접속 정보:
echo   🌐 프론트엔드: http://localhost:3000
echo   🔧 백엔드 API: http://localhost:3001
echo   📊 API 상태: http://localhost:3001/api/health
echo.
echo 📋 유용한 PM2 명령어들:
echo   pm2 status                    # 상태 확인
echo   pm2 logs mongtang-backend     # 백엔드 로그 확인
echo   pm2 logs mongtang-frontend    # 프론트엔드 로그 확인
echo   pm2 restart mongtang-backend  # 백엔드 재시작
echo   pm2 stop mongtang-backend     # 백엔드 중지
echo   pm2 monit                     # 실시간 모니터링
echo.
echo ✅ 이제 컴퓨터를 재부팅해도 자동으로 서버가 시작됩니다!
echo.
pause