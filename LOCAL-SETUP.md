# 몽탕 프로젝트 로컬 환경 설정 가이드

이 가이드는 Firebase Cloud Functions 대신 로컬에서 프로젝트를 실행하는 방법을 설명합니다.

## 📁 프로젝트 구조

```
mongtang-project/
├── frontend/           # 원본 프론트엔드 (Firebase 연동)
├── backend/            # 원본 백엔드 (CLI 스크래핑)
├── functions/          # Firebase Cloud Functions
├── local-frontend/     # 로컬용 프론트엔드 (로컬 API 연동)
├── local-backend/      # 로컬용 백엔드 (Express API + 스케줄러)
├── start-local.sh      # 로컬 환경 시작 스크립트
└── stop-local.sh       # 로컬 환경 종료 스크립트
```

## 🚀 빠른 시작

### 1. 환경 변수 설정

```bash
# 백엔드 환경 변수 복사
cp local-backend/.env.example local-backend/.env

# 프론트엔드 환경 변수 복사
cp local-frontend/.env.example local-frontend/.env.local
```

### 2. 의존성 설치

```bash
# 백엔드 의존성 설치
cd local-backend && npm install && cd ..

# 프론트엔드 의존성 설치
cd local-frontend && npm install && cd ..
```

### 3. 서버 시작

```bash
# 자동 스크립트로 시작 (권장)
./start-local.sh

# 또는 수동으로 시작
# 터미널 1: 백엔드
cd local-backend && npm run start:server

# 터미널 2: 프론트엔드
cd local-frontend && npm run dev
```

### 4. 접속

- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:3001
- **API 상태 확인**: http://localhost:3001/api/health

### 5. 서버 종료

```bash
./stop-local.sh
```

## 🔧 상세 설정

### 백엔드 환경 변수 (`local-backend/.env`)

```env
PORT=3001                    # API 서버 포트
DB_PATH=data/local.db        # SQLite 데이터베이스 경로
SCRAPE_TIMEOUT=30000         # 스크래핑 타임아웃 (밀리초)
MAX_CONCURRENT_SCRAPERS=2    # 동시 스크래핑 수
LOG_LEVEL=info               # 로그 레벨
```

### 프론트엔드 환경 변수 (`local-frontend/.env.local`)

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001    # 백엔드 API URL
```

## 📊 API 엔드포인트

### 데이터 조회
- `GET /api/notices/recent?limit=20` - 최근 공지사항
- `GET /api/notices/search?q=keyword&limit=20` - 공지사항 검색
- `GET /api/notices/date-range?start=YYYY-MM-DD&end=YYYY-MM-DD` - 날짜 범위 조회
- `GET /api/statistics/districts` - 지역별 통계

### 스크래핑 제어
- `POST /api/scrape/:district` - 특정 지역 수동 스크래핑
- `POST /api/scrape/:district?full=true` - 특정 지역 전체 스크래핑
- `POST /api/scrape/all` - 전체 지역 수동 스크래핑

### 시스템
- `GET /api/health` - 서버 상태 확인

## ⏰ 자동 스크래핑 스케줄

로컬 백엔드는 Firebase Functions와 동일한 스케줄로 자동 스크래핑을 실행합니다:

- **매시 정각 (0분)**: 스케줄 시작 알림
- **매시 5분**: 중부권 (종로구, 중구, 용산구, 성동구)
- **매시 15분**: 동북권A (동대문구, 성북구, 도봉구, 강북구)
- **매시 25분**: 동북권B (노원구, 광진구, 강동구)
- **매시 35분**: 서북권 (은평구, 서대문구, 마포구, 양천구)
- **매시 45분**: 서남권 (강서구, 구로구, 금천구, 영등포구)
- **매시 55분**: 동남권 (관악구, 강남구, 송파구, 서초구)

## 🛠️ 개발 모드

### 백엔드 개발
```bash
cd local-backend
npm run dev:server    # nodemon으로 자동 재시작
```

### 프론트엔드 개발
```bash
cd local-frontend
npm run dev          # Next.js 개발 서버
```

### 수동 스크래핑 테스트
```bash
cd local-backend

# 특정 지역 스크래핑
npm run scrape:gangnam

# 전체 스크래핑
npm run scrape:all

# 데이터베이스 확인
npm run check:db
```

## 📄 로그 확인

```bash
# 실시간 로그 확인
tail -f logs/backend.log      # 백엔드 로그
tail -f logs/frontend.log     # 프론트엔드 로그

# 모든 로그 확인
ls -la logs/
```

## 🔄 데이터 동기화

### Firebase에서 로컬로 마이그레이션 (선택사항)

만약 기존 Firebase 데이터를 로컬로 가져오고 싶다면:

1. Firebase Admin SDK를 사용해서 Firestore 데이터 내보내기
2. 내보낸 데이터를 SQLite 형식으로 변환
3. 로컬 데이터베이스에 임포트

### 로컬에서 Firebase로 백업 (선택사항)

```bash
# 추후 백업 스크립트 추가 예정
# local-backend/scripts/backup-to-firebase.js
```

## 🐛 문제 해결

### 포트 충돌
```bash
# 포트 사용 프로세스 확인
lsof -ti:3000  # 프론트엔드 포트
lsof -ti:3001  # 백엔드 포트

# 프로세스 강제 종료
kill -9 $(lsof -ti:3000)
kill -9 $(lsof -ti:3001)
```

### 데이터베이스 문제
```bash
# 데이터베이스 초기화
rm local-backend/data/local.db
cd local-backend && npm run start:server  # 자동으로 테이블 재생성
```

### 의존성 문제
```bash
# node_modules 재설치
rm -rf local-backend/node_modules local-frontend/node_modules
cd local-backend && npm install && cd ..
cd local-frontend && npm install && cd ..
```

## 🆚 Firebase vs 로컬 비교

| 기능 | Firebase | 로컬 |
|------|----------|------|
| 호스팅 | Firebase Hosting | localhost:3000 |
| 데이터베이스 | Firestore | SQLite |
| 스케줄링 | Cloud Functions | node-cron |
| 실시간 업데이트 | onSnapshot | 폴링 (5분) |
| 비용 | 유료 | 무료 |
| 확장성 | 자동 | 수동 |
| 오프라인 | 불가능 | 가능 |

## 💡 팁

1. **개발 중 자동 재시작**: `nodemon`과 Next.js dev 서버가 파일 변경을 감지해서 자동으로 재시작합니다.

2. **API 테스트**: `curl` 또는 Postman으로 API를 테스트할 수 있습니다:
   ```bash
   curl http://localhost:3001/api/health
   curl http://localhost:3001/api/notices/recent?limit=5
   ```

3. **로그 레벨 조정**: 백엔드 `.env` 파일에서 `LOG_LEVEL`을 `debug`로 설정하면 더 자세한 로그를 볼 수 있습니다.

4. **스크래핑 일시정지**: 서버를 재시작하지 않고 스크래핑을 일시정지하려면 별도의 환경 변수나 API 엔드포인트를 추가할 수 있습니다.

## 🔄 Firebase로 되돌리기

로컬 환경에서 다시 Firebase로 돌아가려면:

1. 원본 `frontend/`, `backend/`, `functions/` 폴더 사용
2. Firebase 프로젝트 재설정
3. `firebase deploy` 실행

---

문제가 발생하면 로그를 확인하고, 필요시 `./stop-local.sh`로 모든 서버를 종료한 후 `./start-local.sh`로 재시작하세요.