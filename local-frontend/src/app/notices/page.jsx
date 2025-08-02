import NoticePageClient from '@/components/NoticePageClient';

// TODO: 서버 컴포넌트에서 Firestore 데이터 가져오기 구현
// - 공지사항 목록을 Firebase에서 가져오는 로직 구현
// - 페이지네이션 처리 (한 페이지당 10개 항목)
// - 필터링 및 정렬 옵션 처리
// - 타임스탬프 직렬화 로직 재사용

export const metadata = {
  title: '공지사항 목록 | 서울시 자치구별 고시공고 정보',
  description: '서울시 25개 자치구의 최신 공지사항을 한 곳에서 확인하세요.',
};

export default async function NoticesPage() {
  // TODO: 서버 컴포넌트에서 데이터 패칭 구현
  // const noticesData = await fetchNotices();
  
  return (
    <NoticePageClient>
      <h1>공지사항 목록</h1>
      
      {/* TODO: 클라이언트 컴포넌트로 검색 및 필터 UI 구현 */}
      {/* <SearchAndFilters /> */}
      
      {/* TODO: 공지사항 리스트 컴포넌트 구현 */}
      {/* <NoticeList notices={noticesData} /> */}
      
      <div style={{ padding: '2rem 0', textAlign: 'center' }}>
        이 페이지는 개발 중입니다.
      </div>
      
      {/* TODO: 페이지네이션 컴포넌트 구현 */}
      {/* <Pagination /> */}
    </NoticePageClient>
  );
}

/**
 * ## 개발 TODO 리스트
 * 
 * 1. 공지사항 데이터 패칭 로직
 *    - Firestore에서 공지사항 목록 쿼리 구현
 *    - 페이지네이션 처리 (limit, startAfter 활용)
 *    - 정렬 옵션 구현 (최신순, 조회순 등)
 * 
 * 2. 검색 및 필터링 기능
 *    - 자치구별 필터링 기능
 *    - 키워드 검색 기능
 *    - 날짜 범위 필터 구현
 * 
 * 3. UI 컴포넌트 개발
 *    - NoticeList 컴포넌트 개선 (반응형 그리드)
 *    - NoticeCard 컴포넌트 디자인 개선
 *    - 페이지네이션 컴포넌트 구현
 * 
 * 4. 클라이언트 상태 관리
 *    - 필터 상태 관리를 위한 Context 또는 상태관리 도입
 *    - URL 쿼리 파라미터와 상태 연동
 * 
 * 5. SEO 최적화
 *    - 동적 메타데이터 구현
 *    - 구조화된 데이터(Schema.org) 적용
 * 
 * 6. 성능 최적화
 *    - 이미지 최적화
 *    - 데이터 캐싱 전략 구현
 */
