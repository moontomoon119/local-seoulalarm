// src/app/page.js
import { getRecentNotices } from '@/lib/api';
import ClientNoticeSection from '@/components/ClientNoticeSection';
import { Container } from '@/components/style';

export const metadata = {
  title: '서울시 고시공고 모음',
  description: '서울시 25개 자치구의 공지사항을 한 곳에서 모아보세요. 모든 자치구의 최신 공시 정보를 검색하고 필터링할 수 있습니다.',
  keywords: '서울시, 자치구, 공시, 공지사항, 정보, 검색, 지역, 구정 소식',
};

// 서버 컴포넌트에서 데이터 페칭
export default async function Home() {
  let noticeData = [];
  let districts = [];
  let fetchError = null;

  try {
    // 로컬 API에서 최근 공지사항 가져오기
    const response = await getRecentNotices(1000); // 초기 로딩시 더 많은 데이터
    noticeData = response.data || [];
    
    // 자치구 목록 추출
    districts = [...new Set(noticeData.map(notice => notice.district))].sort();
  } catch (err) {
    console.error('Error fetching notices:', err);
    fetchError = err.message;
    
    // API 서버가 실행 중인지 확인하는 안내 메시지
    if (err.message.includes('fetch')) {
      fetchError = '로컬 백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요. (http://localhost:3001)';
    }
  }

  return (
    <Container>
      <ClientNoticeSection 
        initialNotices={noticeData} 
        initialDistricts={districts} 
        initialError={fetchError}
      />
    </Container>
  );
}