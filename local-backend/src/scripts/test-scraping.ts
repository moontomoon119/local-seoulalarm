import { GangnamScraper } from '../scrapers/gangnam-scraper';

async function testScraping() {
  const scraper = new GangnamScraper();

  try {
    console.log('🧪 스크래핑 테스트 시작...\n');

    // 1. 목록 페이지 테스트
    console.log('1️⃣ 공고문 목록 스크래핑 테스트...');
    const notices = await scraper.scrapeNoticeList();
    console.log(`✅ ${notices.length}개 공고문 목록 추출 성공\n`);

    // 처음 3개 공고문 정보 출력
    console.log('📋 추출된 공고문 샘플 (처음 3개):');
    notices.slice(0, 3).forEach((notice, index) => {
      console.log(`\n${index + 1}. ${notice.title}`);
      console.log(`   📅 ${notice.publishDate}`);
      console.log(`   🏷️ ${notice.category}`);
      console.log(`   🔗 ${notice.url}`);
    });

    // 2. 상세 페이지 테스트 (첫 번째 공고문만)
    if (notices.length > 0) {
      console.log('\n2️⃣ 공고문 상세 내용 스크래핑 테스트...');
      const firstNotice = notices[0];
      const content = await scraper.scrapeNoticeDetail(firstNotice.url);
      
      console.log(`✅ 상세 내용 추출 성공 (${content.length}자)`);
      console.log(`📄 내용 미리보기: ${content.substring(0, 200)}...`);
    }

    console.log('\n🎉 스크래핑 테스트 완료!');

  } catch (error) {
    console.error('❌ 스크래핑 테스트 실패:', error);
  }
}

testScraping(); 