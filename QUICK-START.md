# 🚀 몽탕 프로젝트 - 5분 퀵 스타트

GitHub에서 다운받아서 바로 실행하는 방법입니다.

## 🎯 사전 준비 (1분)

### **Windows 사용자**
1. **Node.js 설치**: https://nodejs.org (LTS 버전)
2. **Git 설치**: https://git-scm.com
3. **관리자 권한 준비**: PowerShell을 관리자 권한으로 실행

### **Linux/Mac 사용자**
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install nodejs npm git

# macOS (Homebrew)
brew install node git
```

## ⚡ 3단계 설치 및 실행

### **1단계: 프로젝트 다운로드**
```bash
git clone https://github.com/your-username/mongtang-project.git
cd mongtang-project
```

### **2단계: 자동 설치**

#### **Windows**
```batch
setup.bat
```

#### **Linux/Mac**
```bash
chmod +x setup.sh
./setup.sh
```

### **3단계: 서버 시작**

#### **개발 모드 (테스트용)**
```batch
# Windows
start-windows.bat

# Linux/Mac
./start-local.sh
```

#### **백그라운드 모드 (실제 사용)**
```batch
# Windows
pm2-start.bat

# Linux/Mac
./pm2-start.sh
```

## 🌐 접속 및 확인

1. **프론트엔드**: http://localhost:3000
2. **백엔드 API**: http://localhost:3001/api/health

## 🔄 첫 데이터 수집 (선택사항)

서버 시작 후 바로 모든 자치구 데이터를 수집하려면:

```bash
cd local-backend
npm run bootstrap:fast
```

**⏱️ 30초 내에 전체 자치구 공지사항이 수집됩니다!**

## 🛑 서버 중지

#### **개발 모드**
각 터미널 창에서 `Ctrl+C`

#### **백그라운드 모드**
```batch
# Windows
pm2-stop.bat

# Linux/Mac
./pm2-stop.sh
```

## 🎉 완료!

- ✅ **자동 크롤링**: 매시간 자동으로 새 공지사항 수집
- ✅ **부팅 시 자동 시작**: 컴퓨터 켜면 자동으로 서버 실행
- ✅ **오프라인 사용**: 인터넷 없어도 저장된 데이터 검색 가능

---

**문제 발생시**: README.md의 "🛠️ 문제 해결" 섹션 참조