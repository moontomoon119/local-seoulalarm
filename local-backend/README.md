# 몽땅 스크래퍼 (Mongtang Scraper)

서울시 자치구 공고문 스크래핑 시스템

## 설치 방법

```bash
# 의존성 설치
npm install
```

## 실행 방법

```bash
# 개발 모드 실행
npm run dev

# 강남구 스크래핑 실행 (자동 감지 모드)
npm run scrape:gangnam

# 스크래핑 테스트 (저장 없이)
npm run test:scraping

# 데이터베이스 조회
npm run check:db
```

## 프로젝트 구조

```
backend/
├── src/
│   ├── scrapers/           # 스크래퍼 클래스들
│   │   ├── base-scraper.ts # 기본 스크래퍼 추상 클래스
│   │   └── gangnam-scraper.ts # 강남구 스크래퍼
│   ├── repositories/       # 데이터 저장소 클래스들
│   │   ├── notice-repository.ts # 저장소 인터페이스
│   │   └── local-repository.ts  # 로컬 SQLite 저장소
│   ├── services/           # 서비스 클래스들
│   │   └── scraper-service.ts   # 스크래핑 서비스
│   ├── types/              # 타입 정의
│   │   └── notice.ts       # 공고 관련 타입 정의
│   ├── scripts/            # 실행 스크립트
│   │   ├── scrape-gangnam.ts # 강남구 스크래핑 실행
│   │   ├── test-scraping.ts  # 스크래핑 테스트
│   │   └── check-db.ts       # DB 조회 스크립트
│   └── index.ts            # 메인 진입점
├── data/                   # 데이터 디렉토리 (자동 생성)
│   └── local.db            # SQLite 데이터베이스
├── package.json            # 의존성 및 스크립트
└── tsconfig.json           # TypeScript 설정
```

## 주요 기능

- 자치구 공고문 목록 및 상세 내용 스크래핑
- SQLite 로컬 데이터베이스에 저장
- 중복 방지 및 동기화 관리
- 다양한 자치구 스크래퍼 확장 가능
- 자동 감지 증분 스크래핑 지원

## 스크래핑 전략

### 자동 감지 스크래핑

- **처음 실행 시**: 전체 페이지 스크래핑을 수행하여 모든 공고문을 가져옵니다.
- **이후 실행 시**: 증분 스크래핑을 수행하여 새로운 공고문만 가져옵니다.

### 증분 스크래핑 알고리즘

1. 첫 페이지만 스크래핑하여 신규 데이터 여부 확인
2. 이미 존재하는 데이터가 3개 이상 발견되면 스크래핑 중단
3. 새로운 데이터가 발견된 경우 추가 페이지 스크래핑
4. 모든 과정에서 중복 데이터는 자동으로 필터링

## 참고사항

- 스크래핑 간격을 충분히 두어 서버에 부담을 주지 않도록 합니다.
- 실제 운영 환경에서는 cron을 사용한 주기적 실행을 권장합니다. 