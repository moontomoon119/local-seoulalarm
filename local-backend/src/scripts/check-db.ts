import { LocalRepository } from '../repositories/local-repository';

async function main() {
  const repository = new LocalRepository();

  try {
    console.log('🔍 Database 조회 시작...\n');

    // 전체 공고 수
    const totalCount = await repository.count();
    console.log(`📊 총 공고문 수: ${totalCount}개`);

    // 최근 10개 공고 조회
    const recentNotices = await repository.getRecent(10);
    console.log(`\n📋 최근 공고 ${recentNotices.length}개:`);
    console.log('─'.repeat(100));
    
    recentNotices.forEach((notice, index) => {
      console.log(`${index + 1}. [${notice.category}] ${notice.title}`);
      console.log(`   📅 ${notice.publishDate} | 📍 ${notice.district}`);
      console.log(`   🔗 ${notice.url}`);
      if (notice.content) {
        const preview = notice.content.replace(/\s+/g, ' ').slice(0, 100);
        console.log(`   📝 본문 요약: ${preview}...`);
      } else {
        console.log(`   ⚠️ 본문 없음`);
      }
      console.log('─'.repeat(100));
    });

    // 마지막 동기화 시간
    const lastSync = await repository.getLastSyncDate('강남구');
    console.log(`\n⏰ 마지막 동기화: ${lastSync ? lastSync.toLocaleString('ko-KR') : '없음'}`);

    // 자치구별 통계
    console.log('\n📈 자치구별 통계:');
    const stats = await repository.getStatsByDistrict();
    stats.forEach(stat => {
      console.log(`  ${stat.district}: ${stat.count}개`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    repository.close();
  }
}

main();
