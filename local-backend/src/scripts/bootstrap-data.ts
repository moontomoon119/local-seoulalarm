// local-backend/src/scripts/bootstrap-data.ts
import { LocalRepository } from '../repositories/local-repository';
import { ScraperService } from '../services/scraper-service';
import { getScrapers } from '../index';

interface BootstrapOptions {
  maxConcurrent?: number;
  delayBetweenBatches?: number;
  targetDistricts?: string[];
}

export async function bootstrapAllData(options: BootstrapOptions = {}) {
  const {
    maxConcurrent = 3, // 동시 실행 개수
    delayBetweenBatches = 10000, // 배치 간 대기시간 (10초)
    targetDistricts = []
  } = options;

  const repository = new LocalRepository();
  const scrapers = getScrapers();
  
  // 타겟 지역 설정 (없으면 전체)
  const districts = targetDistricts.length > 0 
    ? targetDistricts 
    : Object.keys(scrapers);

  console.log(`🚀 초기 데이터 수집 시작: ${districts.length}개 자치구`);
  console.log(`⚙️  설정: 동시 ${maxConcurrent}개, 배치 간격 ${delayBetweenBatches}ms`);

  const results = [];
  
  // 배치 단위로 처리
  for (let i = 0; i < districts.length; i += maxConcurrent) {
    const batch = districts.slice(i, i + maxConcurrent);
    console.log(`\n📦 배치 ${Math.floor(i / maxConcurrent) + 1}: ${batch.join(', ')}`);
    
    // 동시 실행
    const batchPromises = batch.map(async (district) => {
      if (!scrapers[district]) {
        return { district, success: false, error: '스크래퍼 없음' };
      }

      try {
        console.log(`🔄 ${district} 시작...`);
        const scraper = scrapers[district];
        const scraperService = new ScraperService(scraper, repository);
        
        // 전체 스크래핑 (초기 수집이므로)
        const result = await scraperService.scrapeAndSave();
        
        console.log(`✅ ${district} 완료: ${result.saved}개 저장, ${result.duplicates}개 중복`);
        return {
          district,
          success: true,
          ...result
        };
      } catch (error) {
        console.error(`❌ ${district} 실패:`, error instanceof Error ? error.message : '알 수 없는 오류');
        return {
          district,
          success: false,
          error: error instanceof Error ? error.message : '알 수 없는 오류'
        };
      }
    });
    
    // 배치 완료 대기
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // 다음 배치 전 대기 (마지막 배치가 아닌 경우)
    if (i + maxConcurrent < districts.length) {
      console.log(`⏳ 다음 배치까지 ${delayBetweenBatches / 1000}초 대기...`);
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }
  }
  
  // 결과 요약
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const totalSaved = successful.reduce((sum, r) => sum + (r.saved || 0), 0);
  
  console.log(`\n🎉 초기 데이터 수집 완료!`);
  console.log(`✅ 성공: ${successful.length}개 자치구`);
  console.log(`❌ 실패: ${failed.length}개 자치구`);
  console.log(`📊 총 저장된 공지사항: ${totalSaved}개`);
  
  if (failed.length > 0) {
    console.log(`\n⚠️  실패한 자치구들:`);
    failed.forEach(f => console.log(`   - ${f.district}: ${f.error}`));
  }
  
  repository.close();
  return results;
}

// CLI에서 직접 실행 가능
if (require.main === module) {
  const args = process.argv.slice(2);
  const concurrent = parseInt(args.find(arg => arg.startsWith('--concurrent='))?.split('=')[1] || '3');
  const delay = parseInt(args.find(arg => arg.startsWith('--delay='))?.split('=')[1] || '10000');
  
  bootstrapAllData({
    maxConcurrent: concurrent,
    delayBetweenBatches: delay
  }).then(() => {
    console.log('부트스트랩 완료');
    process.exit(0);
  }).catch(error => {
    console.error('부트스트랩 오류:', error);
    process.exit(1);
  });
}