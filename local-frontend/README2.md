# 서울시 자치구 공시 정보

서울시 25개 자치구의 공시/공지 정보를 한 곳에서 볼 수 있는 웹 애플리케이션입니다. 사용자 권한별 차별화된 서비스와 구독 기반 수익 모델을 제공합니다.

## 🚀 주요 기능

### 권한별 서비스
- **무료**: 최근 3일 공시 정보, 기본 검색, 광고 포함
- **베이직**: 전체 기간 공시 정보, 기본 검색, 광고 포함  
- **스탠다드**: 전체 기간 공시 정보, 고급 검색/필터링, 맞춤 알림, 광고 포함
- **프리미엄**: 전체 기간 공시 정보, 고급 검색/필터링, 맞춤 알림, 광고 제거, 통계 대시보드
- **관리자/개발자**: 모든 기능 + 사용자 관리

### 핵심 기능
- 실시간 공시 정보 동기화
- 권한 기반 데이터 접근 제어
- 구독 관리 시스템
- 사용자 인증 (이메일/비밀번호, Google 소셜 로그인)
- 푸시 알림 시스템 (FCM)
- 반응형 디자인 (모바일 최적화)

## 🛠 기술 스택

- **프론트엔드**: Next.js 15 (App Router), React 18
- **스타일링**: Styled Components, 커스텀 디자인 시스템
- **데이터베이스**: Firebase Firestore
- **인증**: Firebase Authentication
- **알림**: Firebase Cloud Messaging (FCM)
- **호스팅**: Vercel
- **상태관리**: React Context API

## 📁 프로젝트 구조

```
frontend/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── auth/           # 인증 페이지 (로그인/회원가입)
│   │   ├── mypage/         # 마이페이지
│   │   ├── subscription/   # 구독 관리
│   │   ├── admin/          # 관리자 페이지
│   │   ├── layout.jsx      # 루트 레이아웃
│   │   └── page.jsx        # 메인 페이지 (서버 컴포넌트)
│   ├── components/         # UI 컴포넌트
│   │   ├── notice/         # 공지사항 관련
│   │   ├── ui/             # 공통 UI 컴포넌트
│   │   ├── AdvancedSearchAndFilters.jsx
│   │   ├── AdBanner.jsx
│   │   ├── StatisticsDashboard.jsx
│   │   └── ...
│   └── lib/                # 유틸리티
│       ├── firebase.js     # Firebase 설정
│       ├── AuthContext.js  # 인증 상태 관리
│       ├── permissions.js  # 권한 관리 유틸리티
│       └── ...
```

## 🚀 설치 및 실행

### 사전 요구사항
- Node.js 18.x 이상
- Firebase 프로젝트 (Firestore, Authentication, FCM 설정 필요)

### 설치
```bash
git clone <repository-url>
cd frontend
npm install
```

### 환경 변수 설정
`.env.local` 파일 생성:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## 📊 데이터 구조

### 사용자 정보
```javascript
users/{userId} {
  uid: string,
  email: string,
  displayName: string,
  role: string,              // 'free_user' | 'subscriber_c' | 'subscriber_b' | 'subscriber_a' | 'manager' | 'developer'
  subscription: {
    plan: string,            // '무료' | '베이직' | '스탠다드' | '프리미엄'
    startDate: timestamp,
    endDate: timestamp,
    status: string           // 'active' | 'inactive'
  }
}
```

### 공지사항
```javascript
notices/{noticeId} {
  title: string,
  content: string,
  district: string,          // 자치구명
  publishDate: timestamp,
  category: string
}
```

### FCM 토큰
```javascript
users/{userId}/fcm_tokens/{tokenId} {
  token: string,
  createdAt: timestamp,
  platform: string
}
```

## 🔐 권한 시스템

### 권한 매핑
```javascript
// src/lib/permissions.js
export const PERMISSIONS = {
  ACCESS_ALL_PERIODS: ['subscriber_c', 'subscriber_b', 'subscriber_a', 'manager', 'developer'],
  ACCESS_RECENT_ONLY: ['free_user'],
  ADVANCED_SEARCH: ['subscriber_b', 'subscriber_a', 'manager', 'developer'],
  NO_ADS: ['subscriber_a', 'manager', 'developer'],
  STATISTICS: ['subscriber_a', 'manager', 'developer']
};
```

### 사용 예시
```javascript
import { hasPermission, getDataPeriodLimit } from '@/lib/permissions';

const userRole = userProfile?.role || 'free_user';
const canUseAdvancedSearch = hasPermission(userRole, 'ADVANCED_SEARCH');
const dayLimit = getDataPeriodLimit(userRole); // 무료: 3일, 유료: null
```

## 🎯 핵심 구현 사항

### 1. 권한 기반 데이터 필터링
- 무료 사용자: 최근 3일 데이터만 표시
- 유료 사용자: 전체 기간 데이터 접근
- 권한별 UI 컴포넌트 렌더링

### 2. 구독 관리 시스템
- 실시간 구독 상태 동기화
- 플랜 업그레이드/다운그레이드
- 결제 준비 완료 (PG 연동 대기)

### 3. 고급 검색 시스템 (스탠다드+)
- 날짜 범위 필터
- 카테고리별 검색
- 자치구별 필터링
- 키워드 검색

### 4. 통계 대시보드 (프리미엄)
- 총/오늘/주간 공지 수
- 자치구별 통계
- 실시간 데이터 업데이트

## 🔄 상태 관리

### AuthContext 사용
```javascript
import { useAuth } from '@/lib/AuthContext';

function MyComponent() {
  const { user, userProfile, loading, isAuthenticated } = useAuth();
  const userRole = userProfile?.role || 'free_user';
  
  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) return <LoginPrompt />;
  
  return <AuthenticatedContent userRole={userRole} />;
}
```

## 📱 푸시 알림 시스템

### FCM 토큰 관리
- 자동 토큰 등록/갱신
- 사용자별 토큰 저장
- 만료된 토큰 정리

### 알림 유형
- 키워드 알림 (맞춤 알림 서비스)
- 시스템 알림
- 긴급 공지사항 알림

## 🚀 배포

### Vercel 배포
```bash
npm i -g vercel
vercel login
vercel
```

### 환경 변수 설정 (Vercel)
1. Vercel 대시보드 접속
2. Settings > Environment Variables
3. Firebase 관련 변수 추가

## 📈 완료된 주요 기능

- ✅ 권한 기반 데이터 접근 제어
- ✅ 구독 관리 시스템
- ✅ Firebase Authentication 연동
- ✅ 고급 검색/필터링 (스탠다드+)
- ✅ 통계 대시보드 (프리미엄)
- ✅ 광고 시스템 (프리미엄 제외)
- ✅ 관리자 사용자 관리 기능
- ✅ 실시간 데이터 동기화
- ✅ 반응형 디자인

## 🔮 향후 계획

### 단기 (1-2개월)
- 결제 게이트웨이 연동
- 카카오 소셜 로그인
- 알림 내역 관리 시스템
- 공지사항 상세 페이지

### 중기 (3-6개월)
- 모바일 앱 (React Native)
- 다크 모드 지원
- 다국어 지원 (i18n)
- API 문서화

### 장기 (6개월+)
- AI 기반 맞춤 추천
- 데이터 분석 대시보드
- 타 지역 확장 (경기도, 부산시 등)

## 📞 문의

프로젝트 관련 문의는 GitHub Issues를 통해 남겨주세요.

---

**서울시 자치구 공시 정보** - 시민을 위한 투명하고 접근하기 쉬운 공공정보 서비스