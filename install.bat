@echo off
chcp 65001 >nul
title 몽탕 프로젝트 설치 마법사

echo.
echo  ██████   ██████  ██████  ████████  █████  ██████   ██████  
echo ██        ██    ██ ██   ██    ██    ██   ██ ██   ██ ██       
echo ██   ███  ██    ██ ██████     ██    ███████ ██   ██ ██   ███ 
echo ██    ██  ██    ██ ██   ██    ██    ██   ██ ██   ██ ██    ██ 
echo  ██████    ██████  ██   ██    ██    ██   ██ ██████   ██████  
echo.
echo ==========================================
echo   🚀 몽탕 프로젝트 자동 설치 마법사
echo ==========================================
echo.
echo 💡 이 스크립트는 다음을 자동으로 설치합니다:
echo    ✓ PM2 프로세스 매니저
echo    ✓ 프로젝트 의존성
echo    ✓ 환경 변수 설정
echo    ✓ 부팅시 자동 시작 설정
echo.

pause

:: 현재 디렉토리에 setup.bat이 있는지 확인
if exist "setup.bat" (
    echo ✅ setup.bat 파일을 찾았습니다.
    echo 🚀 자동 설치를 시작합니다...
    echo.
    call setup.bat
) else (
    echo ❌ setup.bat 파일을 찾을 수 없습니다.
    echo 💡 이 파일을 프로젝트 루트 디렉토리에서 실행해주세요.
    pause
    exit /b 1
)

echo.
echo 🎉 설치가 완료되었습니다!
echo.
echo 📋 다음 단계:
echo    1. start-windows.bat  # 개발 모드로 테스트
echo    2. pm2-start.bat      # 백그라운드 실행
echo.
echo 💡 문제가 발생하면 README.md를 참조하세요.
echo.
pause