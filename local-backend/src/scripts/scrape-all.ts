import dotenv from 'dotenv';
import { LocalRepository } from '../repositories/local-repository';
import { ScraperService } from '../services/scraper-service';
import { BaseScraper } from '../scrapers/base-scraper';
import { getScrapers } from '../index';

dotenv.config();

async function main() {
  console.log('🚀 시작: 모든 자치구 공고문 스크래핑');
  
  const repository = new LocalRepository();
  let success = 0;
  let failed = 0;
  const results: Record<string, any> = {};
  
  try {
    // 기본 통계 출력
    const count = await repository.count();
    console.log(`📊 현재 DB 공고문 수: ${count}`);
    
    // 모든 자치구 스크래퍼 가져오기
    const scrapers = getScrapers();
    const districts = Object.keys(scrapers);
    
    console.log(`🧪 스크래핑할 자치구: ${districts.length}개`);
    
    // 순차적으로 각 자치구 스크래핑
    for (const district of districts) {
      console.log(`\n🔍 ${district} 스크래핑 시작...`);
      
      try {
        const scraper = scrapers[district];
        const service = new ScraperService(scraper, repository);
        
        // 자동 모드로 실행 (기존 데이터 있으면 증분 스크래핑, 없으면 전체 스크래핑)
        const result = await service.scrapeAuto();
        
        console.log(`✅ ${district} 스크래핑 완료:`, result);
        results[district] = {
          ...result,
          success: true
        };
        success++;
        
        // 다음 자치구 스크래핑 전에 10초 대기 (서버 부하 방지)
        console.log(`⏱️ 10초 대기 중...`);
        await new Promise(resolve => setTimeout(resolve, 10000));
        
      } catch (error: any) {
        console.error(`❌ ${district} 스크래핑 실패:`, error.message || error);
        results[district] = {
          success: false,
          error: error.message || '알 수 없는 오류'
        };
        failed++;
      }
    }
    
    // 최종 결과 출력
    console.log('\n📊 스크래핑 최종 결과');
    console.log(`성공: ${success}개 자치구`);
    console.log(`실패: ${failed}개 자치구`);
    
    // 기본 통계 다시 출력
    const finalCount = await repository.count();
    console.log(`📊 최종 DB 공고문 수: ${finalCount} (증가: ${finalCount - count})`);
    
  } catch (error: any) {
    console.error('Error:', error.message || error);
  } finally {
    repository.close();
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
} 