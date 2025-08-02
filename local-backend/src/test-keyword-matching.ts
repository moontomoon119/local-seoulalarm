import { DobongScraper } from './scrapers/dobong-scraper';

async function testKeywordMatching() {
  console.log('🚀 도봉구 스크래퍼 키워드 매칭 테스트 시작\n');
  
  const scraper = new DobongScraper();
  
  try {
    // 공지사항 목록 스크래핑
    const notices = await scraper.scrapeNoticeList();
    console.log(`\n✅ 총 ${notices.length}개의 공지사항을 스크래핑했습니다.`);
    
    // 각 공지사항의 상세 내용 스크래핑
    for (const notice of notices) {
      console.log(`\n📑 공지사항 상세 스크래핑: ${notice.title}`);
      await scraper.scrapeNoticeDetail(notice.url);
    }
    
  } catch (error) {
    console.error('❌ 에러 발생:', error);
  }
}

testKeywordMatching(); 