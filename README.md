# 🚀 몽탕 프로젝트 (로컬 버전)

서울시 25개 자치구의 공지사항을 자동으로 수집하고 검색할 수 있는 로컬 환경 프로젝트입니다.

## ✨ 주요 기능

- 🔄 **자동 스크래핑**: 매시간 자동으로 25개 자치구 공지사항 수집
- 🔍 **통합 검색**: 모든 자치구 공지사항을 한 번에 검색
- 📱 **반응형 웹**: PC, 태블릿, 모바일 모든 환경 지원
- 💾 **로컬 저장**: SQLite 데이터베이스로 오프라인 사용 가능
- 🚀 **빠른 설치**: 원클릭 자동 설치 및 실행

## 🎯 Firebase 대비 장점

| 기능 | Firebase | 로컬 버전 |
|------|----------|-----------|
| 월 비용 | $50-100+ | **무료** |
| 데이터 제한 | 읽기/쓰기 제한 | **무제한** |
| 오프라인 사용 | 불가능 | **완전 지원** |
| 커스터마이징 | 제한적 | **자유롭게** |
| 설치 | 복잡한 설정 | **원클릭** |

## 🖥️ 지원 운영체제

- ✅ **Windows 10/11** (관리자 권한 필요)
- ✅ **macOS** (Homebrew 권장)
- ✅ **Linux** (Ubuntu, CentOS, Debian 등)
- ✅ **WSL** (Windows Subsystem for Linux)

## ⚡ 빠른 시작

### 🔥 원클릭 설치 및 실행

#### **Windows 사용자**
```batch
# 1. 관리자 권한으로 실행
setup.bat

# 2. 서버 시작 (개발 모드)
start-windows.bat

# 3. 백그라운드 실행 (부팅시 자동 시작)
pm2-start.bat
```

#### **Linux/Mac 사용자**
```bash
# 1. 자동 설치
./setup.sh

# 2. 서버 시작 (개발 모드)
./start-local.sh

# 3. 백그라운드 실행 (부팅시 자동 시작)
./pm2-start.sh
```

### 📋 사전 요구사항

#### **필수 설치**
1. **Node.js** (18.0.0 이상)
   - Windows: https://nodejs.org
   - Mac: `brew install node`
   - Linux: `sudo apt install nodejs npm`

2. **Git**
   - Windows: https://git-scm.com
   - Mac: `brew install git`
   - Linux: `sudo apt install git`

#### **자동 설치됨**
- PM2 (프로세스 관리자)
- 프로젝트 의존성
- 환경 변수 설정

## 🎮 사용법

### **접속 정보**
- 🌐 **프론트엔드**: http://localhost:3000
- 🔧 **백엔드 API**: http://localhost:3001
- 📊 **API 상태**: http://localhost:3001/api/health

### **주요 명령어**

#### **Windows**
```batch
setup.bat              # 초기 설치
start-windows.bat       # 개발 모드 시작
pm2-start.bat          # 백그라운드 실행
pm2-stop.bat           # 서버 중지
pm2 status             # 서버 상태 확인
```

#### **Linux/Mac**
```bash
./setup.sh             # 초기 설치
./start-local.sh       # 개발 모드 시작
./pm2-start.sh         # 백그라운드 실행
./pm2-stop.sh          # 서버 중지
pm2 status             # 서버 상태 확인
```

### **데이터 수집**

#### **초기 데이터 수집 (빠른 모드)**
```bash
cd local-backend
npm run bootstrap:fast  # 30초 내 전체 자치구 데이터 수집
```

#### **수동 스크래핑**
```bash
# 특정 자치구
npm run scrape:gangnam

# 전체 자치구
npm run scrape:all
```

## 📊 자동 스케줄링

PM2로 실행하면 **매시간 자동으로** 크롤링이 실행됩니다:

- **매시 5분**: 중부권 (종로구, 중구, 용산구, 성동구)
- **매시 15분**: 동북권A (동대문구, 성북구, 도봉구, 강북구)
- **매시 25분**: 동북권B (노원구, 광진구, 강동구)
- **매시 35분**: 서북권 (은평구, 서대문구, 마포구, 양천구)
- **매시 45분**: 서남권 (강서구, 구로구, 금천구, 영등포구)
- **매시 55분**: 동남권 (관악구, 강남구, 송파구, 서초구)

## 🔧 고급 사용법

### **PM2 모니터링**
```bash
pm2 logs mongtang-backend     # 백엔드 로그 확인
pm2 logs mongtang-frontend    # 프론트엔드 로그 확인
pm2 monit                     # 실시간 CPU/메모리 모니터링
pm2 restart mongtang-backend  # 백엔드 재시작
```

### **데이터베이스 관리**
```bash
cd local-backend
npm run check:db              # 데이터베이스 상태 확인
```

### **개발 모드**
```bash
# 백엔드 개발
cd local-backend
npm run dev:server

# 프론트엔드 개발
cd local-frontend
npm run dev
```

## 📁 프로젝트 구조

```
mongtang-project/
├── local-frontend/          # Next.js 프론트엔드
├── local-backend/           # Express.js 백엔드
│   ├── src/
│   │   ├── scrapers/       # 자치구별 스크래퍼
│   │   ├── repositories/   # 데이터 저장소
│   │   ├── services/       # 비즈니스 로직
│   │   └── scripts/        # 유틸리티 스크립트
│   └── data/
│       └── local.db        # SQLite 데이터베이스
├── setup.bat               # Windows 자동 설치
├── setup.sh                # Linux/Mac 자동 설치
├── start-windows.bat       # Windows 서버 시작
├── pm2-start.bat           # Windows PM2 시작
└── pm2-start.sh            # Linux/Mac PM2 시작
```

## 🛠️ 문제 해결

### **포트 충돌**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /f /pid [PID번호]

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### **PM2 문제**
```bash
pm2 kill              # 모든 PM2 프로세스 종료
pm2 resurrect          # 저장된 프로세스 복원
```

### **의존성 문제**
```bash
# 의존성 재설치
rm -rf local-backend/node_modules local-frontend/node_modules
./setup.sh  # 또는 setup.bat
```

### **데이터베이스 초기화**
```bash
rm local-backend/data/local.db
# 서버 재시작하면 자동으로 테이블 재생성
```

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 💡 팁

### **성능 최적화**
- SSD 사용 권장 (데이터베이스 속도)
- 최소 4GB RAM 권장
- 안정적인 인터넷 연결 필요

### **백업**
```bash
# 데이터베이스 백업
cp local-backend/data/local.db backup/local_$(date +%Y%m%d).db
```

### **로그 관리**
```bash
# 로그 파일 위치
tail -f logs/backend.log      # 개발 모드 로그
pm2 logs --lines 100         # PM2 로그
```

## 📞 지원

문제가 발생하거나 궁금한 점이 있으시면:

1. **Issues**: GitHub Issues 탭에서 버그 신고
2. **Discussions**: 질문이나 아이디어 공유
3. **Wiki**: 상세한 사용법과 팁

---

**🎉 몽탕 프로젝트로 서울시 공지사항을 쉽고 빠르게 확인하세요!**