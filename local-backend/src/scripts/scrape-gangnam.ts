import { GangnamScraper } from '../scrapers/gangnam-scraper';
import { LocalRepository } from '../repositories/local-repository';
import { ScraperService } from '../services/scraper-service';

async function main() {
  const scraper = new GangnamScraper();
  const repository = new LocalRepository();
  const service = new ScraperService(scraper, repository);

  try {
    console.log('🔍 강남구 스크래핑 시작...');
    
    // 기존 통계 출력
    const beforeStats = await service.getStats();
    console.log('📊 실행 전 통계:', beforeStats);
    
    // 자동 감지 스크래핑 실행
    const result = await service.scrapeAuto();
    console.log('🎯 스크래핑 결과:', result);
    
    // 완료 후 통계 출력
    const afterStats = await service.getStats();
    console.log('📊 실행 후 통계:', afterStats);
    
    // 실행 요약
    if (result.isIncremental) {
      console.log(`✅ 증분 스크래핑 완료: 추가 ${result.saved}개, 중복 ${result.duplicates}개`);
    } else {
      console.log(`✅ 전체 스크래핑 완료: 저장 ${result.saved}개, 중복 ${result.duplicates}개`);
    }
    
  } catch (error) {
    console.error('💥 Error:', error);
    process.exit(1);
  } finally {
    repository.close();
  }
}

main(); 