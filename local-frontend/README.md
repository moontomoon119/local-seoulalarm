# 서울시 자치구 공시 정보

서울시 25개 자치구의 공시/공지 정보를 한 곳에서 볼 수 있는 웹 애플리케이션입니다. 서버 사이드 렌더링을 지원하여 SEO에 최적화되어 있습니다.

## 기술 스택

- **프론트엔드**: Next.js 15 (App Router), React
- **스타일**: Styled Components
- **데이터베이스**: Firebase Firestore
- **호스팅**: Vercel (이전: Firebase Hosting)
- **푸시 알림**: Firebase Cloud Messaging (FCM)

## 시작하기

### 사전 요구사항

- Node.js 18.x 이상
- npm 또는 yarn
- Firebase 프로젝트 (Firestore, Authentication, Cloud Messaging 설정 필요)

### 설치

```bash
# 프로젝트 클론
git clone <repository-url>
cd mongtang-project/frontend

# 의존성 설치
npm install
```

### 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### Firebase 설정

1. Firebase Console에서 프로젝트 생성
2. Authentication 활성화 (이메일/비밀번호, Google 로그인)
3. Firestore 데이터베이스 생성
4. Cloud Messaging 설정:
   - 웹 푸시 인증서(VAPID key) 생성
   - 웹 앱 도메인 승인

### Firestore 보안 규칙 설정

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자 문서에 대한 규칙
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // FCM 토큰 컬렉션에 대한 규칙
      match /fcm_tokens/{tokenId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 으로 접속하여 개발 서버를 확인할 수 있습니다.

## 구현된 기능

### 1. 사용자 인증
- 이메일/비밀번호 로그인
- Google 소셜 로그인
- 인증 상태 관리 (AuthContext)
- 보호된 라우트 구현

### 2. 푸시 알림 시스템
- FCM 토큰 관리
- 알림 권한 요청 및 처리
- 토큰 저장 및 갱신
- 백그라운드/포그라운드 메시지 처리

### 3. 데이터 구조

#### 사용자 정보
```javascript
users/{userId} {
  uid: string,
  email: string,
  displayName: string,
  photoURL: string,
  createdAt: timestamp,
  role: string,
  subscription: {
    plan: string,
    startDate: timestamp,
    endDate: timestamp,
    status: string
  }
}
```

#### FCM 토큰
```javascript
users/{userId}/fcm_tokens/{token} {
  token: string,
  createdAt: string,
  platform: string
}
```

## 백엔드 구현 필요사항

### 1. FCM 관리자 서버
- Node.js/Express 서버 구축
- FCM 서버 키를 사용한 알림 발송 API
- 토큰 관리 및 정리 시스템

### 2. 알림 발송 API 엔드포인트
```javascript
POST /api/notifications/send
{
  "title": "알림 제목",
  "body": "알림 내용",
  "data": {
    "type": "notice",
    "id": "notice_id"
  },
  "tokens": ["fcm_token1", "fcm_token2"]
}
```

### 3. 토큰 관리 시스템
- 만료된 토큰 자동 정리
- 사용자별 토큰 관리
- 토큰 상태 모니터링

### 4. 알림 템플릿 관리
- 알림 유형별 템플릿 관리
- 다국어 지원
- 알림 우선순위 설정

### 5. 배치 작업
- 주기적인 토큰 유효성 검사
- 오래된 토큰 정리
- 알림 발송 상태 모니터링

### 6. 모니터링 및 로깅
- 알림 발송 성공/실패 로그
- 토큰 상태 변경 로그
- 시스템 성능 모니터링

## 프로젝트 구조

```
frontend/
├── .env.local           # Firebase 환경변수 (생성 필요)
├── public/              # 정적 파일
├── src/
│   ├── app/             # Next.js 앱 라우터
│   │   ├── auth/        # 인증 관련 페이지
│   │   │   ├── login/   # 로그인 페이지
│   │   │   └── signup/  # 회원가입 페이지
│   │   ├── mypage/      # 마이페이지
│   │   │   └── page.jsx # 마이페이지 (보호된 라우트)
│   │   ├── subscription/# 구독 관리 페이지
│   │   ├── admin/       # 관리자 페이지
│   │   │   ├── users/   # 사용자 관리 페이지
│   │   │   ├── stats/   # 통계 대시보드 (미구현)
│   │   │   └── settings/# 시스템 설정 (미구현)
│   │   ├── layout.jsx   # 루트 레이아웃 (서버 컴포넌트)
│   │   └── page.jsx     # 메인 페이지 (서버 컴포넌트)
│   ├── components/      # UI 컴포넌트
│   │   ├── notice/      # 공지사항 관련 컴포넌트 및 훅
│   │   │   ├── StatusDisplay.jsx       # 공지사항 실시간 연결 상태 표시 UI 컴포넌트
│   │   │   └── useRealtimeNotices.js # 공지사항 Firebase 실시간 데이터 처리 커스텀 훅
│   │   ├── ui/          # 공통 UI 컴포넌트
│   │   │   ├── Button.jsx      # 버튼 컴포넌트
│   │   │   ├── Card.jsx        # 카드 컴포넌트
│   │   │   ├── Input.jsx       # 입력 필드 컴포넌트
│   │   │   ├── Modal.jsx       # 모달 컴포넌트
│   │   │   └── index.js        # UI 컴포넌트 내보내기
│   │   ├── ClientLayout.jsx    # 클라이언트 레이아웃 ('use client')
│   │   ├── MainLayout.jsx      # 메인 레이아웃 (사이드바 포함)
│   │   ├── ProtectedRoute.jsx  # 보호된 라우트 컴포넌트
│   │   ├── Sidebar.jsx         # 사이드바 컴포넌트
│   │   ├── ClientNoticeSection.jsx  # 클라이언트 노티스 섹션 (notice 폴더의 컴포넌트 사용하도록 리팩토링됨, 'use client')
│   │   ├── Header.jsx          # 헤더 컴포넌트
│   │   ├── LoadingIndicator.jsx # 로딩 인디케이터
│   │   ├── NoResults.jsx       # 검색 결과 없음
│   │   ├── NoticeCard.jsx      # 공지사항 카드
│   │   ├── NoticeList.jsx      # 공지사항 목록
│   │   ├── PageLayout.jsx      # 페이지 레이아웃 (레거시)
│   │   ├── SearchAndFilters.jsx # 검색 및 필터
│   │   └── style/              # 스타일 컴포넌트
│   └── lib/             # 유틸리티 및 설정
│       ├── firebase.js         # Firebase 설정 및 인증 함수
│       ├── AuthContext.js      # 인증 상태 관리 컨텍스트
│       ├── dateUtils.js        # 날짜 포맷 유틸리티
│       ├── globalStyles.js     # 전역 스타일 ('use client')
│       ├── theme.js            # 테마 설정
│       ├── registry.js         # Styled-components 서버 사이드 처리
│       └── fcm.js              # FCM 관련 유틸리티
```

## 주요 구현 사항

### 서버 컴포넌트 및 클라이언트 컴포넌트 분리

Next.js 15의 App Router를 활용하여 서버 컴포넌트와 클라이언트 컴포넌트를 명확히 분리했습니다:

- **서버 컴포넌트**: 데이터 페칭, SEO 최적화 담당
- **클라이언트 컴포넌트**: 상태 관리, 이벤트 핸들링 담당

각 클라이언트 컴포넌트 파일 최상단에 `'use client'` 지시문이 포함되어 있습니다.

### Firebase에서 Vercel로 마이그레이션

기존 Firebase Hosting에서 Vercel로 마이그레이션하여 Next.js의 모든 기능을 활용할 수 있도록 변경했습니다. 배포 방법은 다음과 같습니다:

#### Vercel 배포

1. Vercel CLI 설치 및 로그인:
   ```bash
   npm i -g vercel
   vercel login
   ```

2. 배포 실행:
   ```bash
   vercel
   ```

또는 GitHub 저장소를 Vercel에 연결하여 CI/CD 파이프라인을 구성할 수 있습니다.

### 환경 변수 설정 (Vercel)

1. Vercel 대시보드 접속
2. 프로젝트 선택
3. Settings > Environment Variables 메뉴에서 Firebase 관련 변수 추가
4. 모든 `NEXT_PUBLIC_FIREBASE_*` 변수를 Firebase 콘솔에서 가져와 설정

### SEO 최적화

다음과 같은 SEO 최적화 작업이 적용되어 있습니다:

1. 메타데이터 추가 (title, description, keywords)
2. OpenGraph 태그 설정 (소셜 미디어 공유용)
3. 서버 사이드 렌더링으로 초기 HTML 로딩 최적화

### Firebase 타임스탬프 처리

서버 컴포넌트에서 클라이언트 컴포넌트로 데이터를 전달할 때, Firebase Timestamp 객체를 직렬화하는 로직이 `page.jsx`에 구현되어 있습니다:

```javascript
// Firestore 타임스탬프를 문자열로 변환하는 함수
const serializeData = (data) => {
  // 구현 내용 참조
};
```

## 기존 기획서

서울시 자치구 공시 정보 앱 기획서
프로젝트 개요
서울시 자치구 공시 정보 앱은 서울시 25개 자치구에서 발행하는 다양한 공시 정보를 하나의 플랫폼에서 쉽게 검색하고 조회할 수 있는 모바일 최적화 웹 애플리케이션입니다. 이 앱은 시민들이 각 자치구의 공지사항, 행사 정보, 정책 발표 등을 한 눈에 볼 수 있도록 설계되었으며, 특히 모바일 환경에서의 사용성을 고려하여 개발되었습니다.

## 프로젝트 개선 계획

### 1. 컴포넌트 구조화 개선
- 공통 UI 컴포넌트 라이브러리 구축
  - Button, Input, Card, Modal, Form 등 재사용 가능한 컴포넌트 개발
  - 일관된 스타일 적용을 위한 디자인 시스템 구축
- 스타일 구조 리팩토링
  - 현재 style/index.js에 집중된 스타일을 개별 컴포넌트로 분리
  - styled-components와 테마 시스템 강화

### 2. 라우팅 구조 개선
- 새로운 페이지 추가
  - 로그인/회원가입 페이지 (`/auth/login`, `/auth/signup`)
  - 마이페이지 (`/mypage`)
  - 구독 관리 페이지 (`/subscription`)
  - 공지사항 상세 페이지 (`/notice/[id]`)
- Next.js App Router 구조에 맞춘 페이지 구성

### 3. 레이아웃 시스템 구축
- 사이드바 구현
  - 네비게이션 메뉴 구성
  - 반응형 디자인 (모바일에서는 드로어 메뉴로 전환)
- 광고 배너 영역 추가
  - 상단/하단 배너 공간 구성
  - 사이드바 배너 공간 (데스크톱 전용)

### 4. 인증 기능 구현
- Firebase Authentication 통합
  - 이메일/비밀번호 로그인
  - 소셜 로그인 (Google, Kakao 등)
- 인증 상태 관리
  - 사용자 상태 컨텍스트 구현
  - 보호된 라우트 설정 (비로그인 접근 제한)

### 5. 구독 결제 시스템
- 구독 상품 UI 구현
  - 요금제 비교 테이블
  - 결제 프로세스 플로우
- 결제 게이트웨이 연동 준비
  - PG사 연동을 위한 UI/UX 설계
  
### 6. 성능 최적화
- 이미지 최적화
  - Next.js Image 컴포넌트 사용
  - 이미지 포맷 및 크기 최적화
- 코드 스플리팅 강화
  - 동적 임포트를 통한 번들 사이즈 축소
  - 초기 로딩 속도 개선

### 구현 우선순위
1. 공통 UI 컴포넌트 및 스타일 시스템 구축
2. 사이드바 및 레이아웃 개선
3. 인증 기능 구현
4. 추가 페이지(마이페이지, 구독 페이지) 개발
5. 구독 결제 시스템 구현
6. 광고 배너 영역 추가
7. 성능 최적화

## 프로젝트 진행 요약

### 현재까지의 성과

프로젝트의 기반 구조와 UI 시스템을 성공적으로 구축했습니다. 특히 다음과 같은 성과를 이루었습니다:

1. **재사용 가능한 UI 컴포넌트 라이브러리** 구현
   - 모든 UI 요소에 통일된 디자인 시스템 적용
   - styled-components의 transient props를 활용한 최적화

2. **효율적인 레이아웃 구조** 개선
   - 사이드바와 메인 콘텐츠 영역을 포함한 유연한 레이아웃
   - 모바일 환경에서의 드로어 메뉴 구현
   - 반응형 디자인 적용

3. **인증 시스템 기초** 구축
   - 로그인 및 회원가입 UI 구현
   - 사용자 경험을 고려한 검증 로직 적용

### 다음 중점 개발 영역

프로젝트의 향후 개발은 다음 세 가지 영역에 중점을 두어야 합니다:

1. **인증 시스템 완성**
   - Firebase Authentication과의 연동
   - 사용자 상태 관리 컨텍스트 구현
   - 보호된 라우트 설정

2. **핵심 기능 페이지 개발**
   - 마이페이지: 사용자 정보 관리
   - 구독 관리 페이지: 구독 상품 정보 및 결제 관리
   - 공지사항 상세 페이지: 자치구별 상세 정보 확인

3. **수익 모델 구현**
   - 구독 결제 시스템 연동
   - 광고 배너 시스템 구현

### 개발 우선순위 제안

1. Firebase Authentication 연동 (1주)
2. 사용자 상태 관리 및 보호된 라우트 구현 (3일)
3. 마이페이지 개발 (3일)
4. 구독 관리 페이지 개발 (1주)
5. 결제 시스템 연동 (1주)
6. 광고 배너 시스템 구현 (3일)
7. 테스트 및 최적화 (1주)

## 프로젝트 진행 상황

### 완료된 작업

#### 1. 공통 UI 컴포넌트 구현 (2024-XX-XX)
- ✅ Button 컴포넌트: 다양한 스타일(primary, secondary, outline, text)과 크기 구현
- ✅ Input 컴포넌트: 라벨, 에러 메시지, 도움말 기능 추가
- ✅ Card 컴포넌트: 헤더, 콘텐츠, 푸터 구조를 갖춘 유연한 카드 디자인
- ✅ Modal 컴포넌트: 다양한 크기의 모달 창 지원

#### 2. 레이아웃 개선 (2024-XX-XX)
- ✅ 사이드바 구현: 네비게이션 메뉴와 광고 영역 포함
- ✅ 반응형 사이드바: 모바일에서는 드로어 메뉴로 전환
- ✅ 메인 레이아웃 구조 개선: 사이드바, 메인 콘텐츠, 푸터 통합
- ✅ 레이아웃 중첩 문제 해결: App Router 구조에 맞게 레이아웃 정리

#### 3. 인증 관련 페이지 추가 (2024-XX-XX)
- ✅ 로그인 페이지 구현 (`/auth/login`)
- ✅ 회원가입 페이지 구현 (`/auth/signup`)
- ✅ 헤더에 로그인/비로그인 상태 UI 추가

#### 4. Firebase Authentication 연동 (2024-XX-XX)
- ✅ Firebase 인증 기능 설정 (`firebase.js`)
- ✅ 인증 상태 관리 컨텍스트 구현 (`AuthContext.js`)
- ✅ 이메일/비밀번호 로그인 및 회원가입 기능
- ✅ Google 소셜 로그인 연동
- ✅ 보호된 라우트 컴포넌트 구현 (`ProtectedRoute.jsx`)

#### 5. 마이페이지 구현 (2024-XX-XX)
- ✅ 사용자 프로필 정보 표시 (`/mypage`)
- ✅ 로그아웃 기능 구현
- ✅ 보호된 라우트로 설정 (미로그인 시 로그인 페이지로 리다이렉트)

#### 6. 구독 시스템 구현 (2024-XX-XX)
- ✅ 사용자 구독 등급 모델 설계 (무료, 베이직, 스탠다드, 프리미엄, 관리자, 개발자)
- ✅ Firestore에 사용자별 구독 정보 저장
- ✅ 구독 관리 페이지 UI 및 기능 구현
- ✅ 사용자 역할에 따른 권한 제어 시스템
- ✅ 구독 상품 비교 테이블 구현

#### 7. 관리자 기능 구현 (2024-XX-XX)
- ✅ 사용자 관리 페이지 구현 (`/admin/users`)
- ✅ 사용자 역할 변경 기능 (일반 → 개발자/관리자 및 등급 조정)
- ✅ 특별 권한 사용자(개발자, 관리자)를 위한 UI 추가
- ✅ 관리자 전용 메뉴 구현 (마이페이지 내 개발자 도구)

#### 8. 버그 수정 및 최적화 (2024-XX-XX)
- ✅ Styled Components Transient Props 적용: DOM 속성 경고 해결
- ✅ 코드 스타일 통일: 일관된 스타일로 컴포넌트 재구성

### 진행 중인 작업
- 🔄 마이페이지 추가 기능 구현 (2024-XX-XX ~ 2024-XX-XX)
  - 사용자 정보 수정 페이지 개발
  - 프로필 이미지 업로드 기능 계획
- 🔄 구독 결제 시스템 연동 (2024-XX-XX ~ 2024-XX-XX)
  - 결제 게이트웨이 연동 준비
  - 결제 프로세스 UI 흐름 구현
- 🔄 관리자 대시보드 확장 (2024-XX-XX ~ 2024-XX-XX)
  - 통계 대시보드 디자인 및 구현
  - 시스템 설정 페이지 개발

### TODO 리스트

#### 인증 시스템
- ✅ Firebase Authentication 연동 완료
- ✅ 소셜 로그인 구현 (Google)
- ✅ 인증 상태 관리 시스템 구축
- ✅ 보호된 라우트 설정했음
- ⬜ 카카오 소셜 로그인 추가

#### 페이지 개발
- ✅ 마이페이지 기본 구현 (`/mypage`)
- ✅ 구독 관리 페이지 구현 (`/subscription`)
- ✅ 관리자용 사용자 관리 페이지 구현 (`/admin/users`)
- ⬜ 마이페이지 프로필 편집 구현 (`/mypage/edit`)
- ⬜ 공지사항 상세 페이지 구현 (`/notice/[id]`)
- ⬜ 통계 대시보드 구현 (`/admin/stats`)
- ⬜ 시스템 설정 페이지 구현 (`/admin/settings`)

#### 구독 및 결제 시스템
- ✅ 구독 등급 정의 및 모델 설계
- ✅ 구독 상품 목록 페이지 구현
- ✅ 사용자별 구독 정보 관리 기능
- ⬜ 결제 프로세스 UI 구현
- ⬜ 결제 게이트웨이 연동
- ⬜ 구독 해지 및 변경 기능
- ⬜ 결제 내역 조회 기능

#### 광고 시스템
- ⬜ 광고 배너 컴포넌트 구현
- ⬜ 광고 관리 인터페이스 구축

#### 성능 및 UX 개선
- ⬜ 이미지 최적화 적용
- ⬜ 다크/라이트 모드 지원
- ⬜ 페이지 전환 애니메이션 추가
- ⬜ 모바일 최적화 완성
- ⬜ 접근성(a11y) 개선

## 알림 시스템 구조

### 데이터베이스 구조

```javascript
// 1. 키워드 구독 정보
keyword_subscriptions/{keyword} {
  keyword: string,            // 키워드 값
  subscribers: string,        // JSON 문자열로 저장된 사용자 ID 배열
  subscriberCount: number,    // 구독자 수
  createdAt: timestamp,
  updatedAt: timestamp
}

// 2. 사용자 FCM 토큰
users/{userId}/fcm_tokens/{tokenId} {
  token: string,             // FCM 토큰
  createdAt: timestamp,
  platform: string,          // 디바이스 플랫폼 정보
  lastUsed: timestamp
}

// 3. 알림 내역 (TODO: 구현 예정)
users/{userId}/notifications/{notificationId} {
  title: string,             // 알림 제목
  body: string,              // 알림 내용
  type: string,              // 알림 유형 (keyword, system 등)
  data: {                    // 알림 관련 데이터
    keyword?: string,        // 키워드 알림인 경우
    noticeId?: string,       // 관련 공지사항 ID
    district?: string        // 자치구 정보
  },
  read: boolean,             // 읽음 여부
  createdAt: timestamp,
  readAt: timestamp         // 읽은 시간
}
```

### 알림 처리 흐름

1. **키워드 구독 설정**
   - 사용자가 키워드 설정
   - `keyword_subscriptions` 컬렉션에 구독 정보 저장
   - 사용자별 FCM 토큰 관리

2. **새 공지사항 등록 시**
   - Firebase Functions에서 키워드 매칭 확인
   - 매칭된 키워드의 구독자 FCM 토큰 조회
   - FCM을 통해 알림 전송
   - 알림 내역을 사용자별 notifications 컬렉션에 저장

3. **프론트엔드 알림 처리**
   - FCM 서비스 워커를 통한 백그라운드 알림 처리
   - 포그라운드 상태에서의 알림 표시
   - 알림 클릭 시 해당 공지사항으로 이동

### TODO 리스트: 알림 내역 관리 시스템

#### 1. 알림 내역 저장 구현
- ⬜ 사용자별 notifications 컬렉션 설계
- ⬜ 알림 발생 시 자동 저장 로직 구현
- ⬜ 읽음 상태 관리 기능 추가

#### 2. 알림 센터 UI 개발
- ⬜ 헤더에 알림 아이콘 및 카운터 추가
- ⬜ 알림 목록 드롭다운 메뉴 구현
- ⬜ 알림 상세 페이지 개발 (`/notifications`)
- ⬜ 읽지 않은 알림 강조 표시

#### 3. 실시간 알림 처리
- ⬜ Firestore 실시간 리스너 설정
- ⬜ 새 알림 발생 시 실시간 UI 업데이트
- ⬜ 알림음 및 진동 설정 기능

#### 4. 알림 설정 기능
- ⬜ 알림 켜기/끄기 설정
- ⬜ 알림 유형별 설정 관리
- ⬜ 방해 금지 시간 설정
- ⬜ 알림음 선택 기능

#### 5. 알림 관리 기능
- ⬜ 전체 읽음 처리
- ⬜ 선택 삭제 기능
- ⬜ 알림 보관 기간 설정
- ⬜ 오래된 알림 자동 삭제

## 구독 시스템 상세 설명

### 구독 등급
프로젝트에서는 다음과 같은 구독 등급을 제공합니다:

| 등급 | 역할 코드 | 혜택 |
|------|------------|------|
| 무료 | free_user | 기본 자치구 공시 정보 열람 (제한적) |
| 베이직 | subscriber_c | 모든 자치구 공시 정보 열람 |
| 스탠다드 | subscriber_b | 모든 자치구 공시 정보 열람, 맞춤 알림 |
| 프리미엄 | subscriber_a | 모든 자치구 공시 정보 열람, 맞춤 알림, 광고 제거 |
| 관리자 | manager | 관리자 기능 및 콘텐츠 관리 권한 |
| 개발자 | developer | 모든 기능 접근 및 개발 권한 |

### 구독 정보 저장 구조
Firebase Firestore의 사용자 문서에는 다음과 같은 구독 정보가 저장됩니다:

```javascript
{
  uid: "사용자ID",
  email: "이메일",
  displayName: "이름",
  // 다른 사용자 정보들...
  role: "user_role_code",  // 사용자 역할 코드
  subscription: {
    plan: "구독 플랜 이름",  // 표시용 이름
    startDate: timestamp,  // 구독 시작일
    endDate: timestamp,    // 구독 만료일 (null은 무기한)
    status: "active"       // 구독 상태
  }
}
```

### 관리자 기능
관리자와 개발자 계정은 사용자 관리 페이지를 통해 다른 사용자의 역할을 변경할 수 있습니다. Firestore의 사용자 데이터를 조회하고 업데이트하는 권한이 필요합니다.

## 상세 개발 일정 및 우선순위

### Phase 1: 인증 시스템 완성 (2주)
| 작업 | 기간 | 우선순위 | 담당자 |
|------|------|----------|--------|
| Firebase Auth 초기 설정 | 2일 | 높음 | TBD |
| 이메일/비밀번호 로그인 구현 | 3일 | 높음 | TBD |
| 소셜 로그인 연동 | 3일 | 중간 | TBD |
| 인증 상태 관리 시스템 | 3일 | 높음 | TBD |
| 보호된 라우트 설정 | 2일 | 중간 | TBD |

### Phase 2: 핵심 페이지 개발 (2주)
| 작업 | 기간 | 우선순위 | 담당자 |
|------|------|----------|--------|
| 마이페이지 UI 구현 | 3일 | 높음 | TBD |
| 마이페이지 기능 구현 | 4일 | 높음 | TBD |
| 구독 관리 페이지 UI | 3일 | 중간 | TBD |
| 구독 관리 기능 구현 | 4일 | 중간 | TBD |

### Phase 3: 결제 시스템 (1주)
| 작업 | 기간 | 우선순위 | 담당자 |
|------|------|----------|--------|
| 결제 프로세스 UI | 2일 | 중간 | TBD |
| 결제 게이트웨이 연동 | 3일 | 중간 | TBD |

### Phase 4: 최적화 및 추가 기능 (1주)
| 작업 | 기간 | 우선순위 | 담당자 |
|------|------|----------|--------|
| 광고 배너 시스템 | 2일 | 낮음 | TBD |
| 성능 최적화 | 3일 | 중간 | TBD |
| 테스트 및 버그 수정 | 2일 | 높음 | TBD |