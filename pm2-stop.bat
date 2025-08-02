@echo off
chcp 65001 >nul
echo.
echo ==========================================
echo   🛑 PM2 서버 중지 (Windows)
echo ==========================================
echo.

:: PM2 프로세스 중지
echo 🛑 몽탕 백엔드 서버 중지 중...
pm2 stop mongtang-backend
pm2 delete mongtang-backend

echo 🛑 몽탕 프론트엔드 서버 중지 중...
pm2 stop mongtang-frontend
pm2 delete mongtang-frontend

:: PM2 상태 확인
echo.
echo 📊 PM2 상태:
pm2 status

echo.
echo ✅ 모든 서버가 중지되었습니다.
echo.
pause