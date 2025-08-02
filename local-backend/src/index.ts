import dotenv from 'dotenv';

import { GangnamScraper } from './scrapers/gangnam-scraper';
import { GangdongScraper } from './scrapers/gangdong-scraper';
import { GangbukScraper } from './scrapers/gangbuk-scraper';
import { GangseoScraper } from './scrapers/gangseo-scraper';
import { GwanakScraper } from './scrapers/gwanak-scraper';
import { GwangjinScraper } from './scrapers/gwangjin-scraper';
import { GuroScraper } from './scrapers/guro-scraper';
import { GeumcheonScraper } from './scrapers/geumcheon-scraper';
import { NowonScraper } from './scrapers/nowon-scraper';
import { DobongScraper } from './scrapers/dobong-scraper';
import { DongdaemunScraper } from './scrapers/dongdaemun-scraper';
// import { DongjakScraper } from './scrapers/dongjak-scraper';
import { MapoScraper } from './scrapers/mapo-scraper';
import { SeodaemunScraper } from './scrapers/seodaemun-scraper';
// import { SeochoScraper } from './scrapers/seocho-scraper';
import { SeongdongScraper } from './scrapers/seongdong-scraper';
import { SeongbukScraper } from './scrapers/seongbuk-scraper';
import { SongpaScraper } from './scrapers/songpa-scraper';
import { YangcheonScraper } from './scrapers/yangcheon-scraper';
import { YeongdeungpoScraper } from './scrapers/yeongdeungpo-scraper';
import { YongsanScraper } from './scrapers/yongsan-scraper';
import { EunpyeongScraper } from './scrapers/eunpyeong-scraper';
import { JongnoScraper } from './scrapers/jongno-scraper';
import { JungguScraper } from './scrapers/junggu-scraper';
// import { JungnangScraper } from './scrapers/jungnang-scraper';
import { JeongbiScraper } from './scrapers/jeongbi-scraper';


import { LocalRepository } from './repositories/local-repository';
import { ScraperService } from './services/scraper-service';
import { BaseScraper } from './scrapers/base-scraper';

dotenv.config();

// 지역 그룹 정의
// 6개 그룹: 중부권, 동북권A, 동북권B, 서북권, 서남권, 동남권
const DISTRICT_GROUPS = {
  CENTRAL: ['jongno', 'junggu', 'yongsan', 'seongdong', 'gangbuk'],
  NORTHEAST_A: ['dongdaemun', 'seongbuk', 'dobong', 'gangbuk'],
  NORTHEAST_B: ['nowon', 'gwangjin', 'gangdong'], // 중랑구는 아직 미구현
  NORTHWEST: ['eunpyeong', 'seodaemun', 'mapo', 'yangcheon'],
  SOUTHWEST: ['gangseo', 'guro', 'geumcheon', 'yeongdeungpo'], // 동작구는 아직 미구현
  SOUTHEAST: ['gwanak', 'gangnam', 'songpa','seocho'] // 서초구는 아직 미구현
};

// 모든 자치구 스크래퍼 목록
export function getScrapers(): { [key: string]: BaseScraper } {
  return {
    'gangnam': new GangnamScraper(),
    'gangdong': new GangdongScraper(),
    'gangbuk': new GangbukScraper(),
    'gangseo': new GangseoScraper(),
    'gwanak': new GwanakScraper(),
    'gwangjin': new GwangjinScraper(),
    'guro': new GuroScraper(),
    'geumcheon': new GeumcheonScraper(),
    'nowon': new NowonScraper(),
    'dobong': new DobongScraper(),
    'dongdaemun': new DongdaemunScraper(),
    // 'dongjak': new DongjakScraper(),
    'mapo': new MapoScraper(),
    'seodaemun': new SeodaemunScraper(),
    // 'seocho': new SeochoScraper(),
    'seongdong': new SeongdongScraper(),
    'seongbuk': new SeongbukScraper(),
    'songpa': new SongpaScraper(),
    'yangcheon': new YangcheonScraper(),
    'yeongdeungpo': new YeongdeungpoScraper(),
    'yongsan': new YongsanScraper(),
    'eunpyeong': new EunpyeongScraper(),
    'jongno': new JongnoScraper(),
    'junggu': new JungguScraper(),
    // 'jungnang': new JungnangScraper(),
    'jeongbi': new JeongbiScraper()
  };
}

// 특정 지역 그룹만 스크래핑하는 함수 (로컬 환경용)
async function scrapeDistrictGroup(groupName: string, districts: string[], repository: LocalRepository, incremental: boolean = false) {
  const allScrapers = getScrapers();
  const results: Record<string, any> = {};
  
  console.log(`🔄 ${groupName} 지역 스크래핑 시작`);
  
  for (const district of districts) {
    const scraper = allScrapers[district];
    if (!scraper) {
      console.warn(`⚠️ ${district} 스크래퍼가 구현되지 않았거나 활성화되지 않았습니다.`);
      continue;
    }
    
    try {
      console.log(`ℹ️ ${district} 스크래핑 시작...`);
      const service = new ScraperService(scraper, repository);
      
      let result;
      if (incremental) {
        result = await service.scrapeIncremental(); // 증분 스크래핑만 실행
      } else {
        result = await service.scrapeAuto(); // 자동 스크래핑 (전체 또는 증분)
      }
      
      results[district] = {
        ...result,
        success: true,
        timestamp: new Date().toISOString()
      };
      
      if (result.saved > 0) {
        console.log(`✅ ${district} 공고문 업데이트됨:`, {
          ...result,
          timestamp: new Date().toISOString()
        });
      } else {
        console.log(`ℹ️ ${district} 새 공고문 없음:`, {
          saved: result.saved,
          duplicates: result.duplicates,
          timestamp: new Date().toISOString()
        });
      }
      
      // 다음 스크래퍼 실행 전 잠시 대기 (서버 부하 방지)
      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (error) {
      results[district] = {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        timestamp: new Date().toISOString()
      };
      
      console.error(`❌ ${district} 공고문 스크래핑 실패:`, results[district]);
    }
  }
  
  console.log(`✅ ${groupName} 지역 스크래핑 완료`);
  
  // 결과 요약
  let totalSaved = 0;
  let totalDuplicates = 0;
  let failedDistricts = 0;
  
  for (const [district, result] of Object.entries(results)) {
    if (result.success) {
      totalSaved += result.saved || 0;
      totalDuplicates += result.duplicates || 0;
    } else {
      failedDistricts++;
    }
  }
  
  console.log(`- 저장된 공고: ${totalSaved}개`);
  console.log(`- 중복 공고: ${totalDuplicates}개`);
  console.log(`- 실패한 자치구: ${failedDistricts}개`);
  
  return results;
}

// Firebase의 hourlyDistrictNotices 로직을 로컬에서 실행하는 함수
async function runHourlyScraper(groupName?: string) {
  console.log('🔄 Firebase hourlyDistrictNotices 로직 테스트 시작...');
  
  const repository = new LocalRepository();
  
  try {
    if (groupName) {
      // 특정 그룹만 실행
      const groupKey = Object.keys(DISTRICT_GROUPS).find(key => 
        key.toLowerCase() === groupName.toLowerCase() || 
        getGroupNameKorean(key) === groupName
      );
      
      if (!groupKey) {
        console.error(`❌ 알 수 없는 지역 그룹: ${groupName}`);
        console.log('사용 가능한 지역 그룹:');
        Object.keys(DISTRICT_GROUPS).forEach(key => {
          console.log(`  - ${key.toLowerCase()} (${getGroupNameKorean(key)})`);
        });
        return;
      }
      
      const districts = (DISTRICT_GROUPS as any)[groupKey];
      const koreanName = getGroupNameKorean(groupKey);
      await scrapeDistrictGroup(koreanName, districts, repository, true);
    } else {
      // 모든 그룹 순차 실행
      for (const [groupKey, districts] of Object.entries(DISTRICT_GROUPS)) {
        const koreanName = getGroupNameKorean(groupKey);
        console.log(`\n📌 ${koreanName} 그룹 스크래핑 시작... (${districts.join(', ')})`);
        
        await scrapeDistrictGroup(koreanName, districts as string[], repository, true);
        
        // 다음 그룹 실행 전 잠시 대기
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    console.log('🏁 Firebase hourlyDistrictNotices 테스트 완료');
  } finally {
    repository.close();
  }
}

// 그룹 키를 한글 이름으로 변환
function getGroupNameKorean(groupKey: string): string {
  const nameMap: Record<string, string> = {
    'CENTRAL': '중부권',
    'NORTHEAST_A': '동북권A',
    'NORTHEAST_B': '동북권B',
    'NORTHWEST': '서북권', 
    'SOUTHWEST': '서남권',
    'SOUTHEAST': '동남권'
  };
  
  return nameMap[groupKey] || groupKey;
}

async function main() {
  console.log('🚀 Mongtang Scraper Started');
  
  const repository = new LocalRepository();
  // 명령행 인자를 try 블록 밖으로 이동
  const args = process.argv.slice(2);
  
  try {
    // 기본 통계 출력
    const count = await repository.count();
    console.log(`📊 Current notices in DB: ${count}`);
    
    // 명령행 인자로 동작 모드 결정
    console.log('📌 명령행 인자:', args);
    
    const testDistrict = !args[0]?.startsWith('--') ? args[0] : undefined;
    const fullScrape = args.includes('--full');
    const hourlyTest = args.includes('--hourly-test');
    const groupOption = args.indexOf('--group');
    const groupName = groupOption !== -1 && groupOption + 1 < args.length ? args[groupOption + 1] : undefined;
    
    console.log('📌 실행 모드:', { testDistrict, fullScrape, hourlyTest, groupName });
    
    // Firebase의 hourlyDistrictNotices 테스트 모드
    if (hourlyTest) {
      console.log('🧪 Firebase의 hourlyDistrictNotices 함수 로직 테스트 실행');
      if (groupName) {
        console.log(`🧪 '${groupName}' 그룹만 실행`);
      } else {
        console.log('🧪 모든 그룹 순차 실행');
      }
      
      await runHourlyScraper(groupName);
      return;
    }
    
    // 테스트 실행 모드
    if (testDistrict) {
      console.log(`🧪 Running test for district: ${testDistrict} (${fullScrape ? 'full' : 'auto'} mode)`);
      
      const scrapers = getScrapers();
      const scraper = scrapers[testDistrict];
      
      if (!scraper) {
        console.error(`❌ Unknown district: ${testDistrict}`);
        console.log('Available districts:');
        Object.keys(scrapers).forEach(d => console.log(`  - ${d}`));
        return;
      }
      
      const service = new ScraperService(scraper, repository);
      
      let result;
      if (fullScrape) {
        result = await service.scrapeAndSave();
      } else {
        result = await service.scrapeAuto();
      }
      
      console.log('✅ Test completed:', result);
    } else {
      // 기본 모드 - 최근 공고 출력
      const recent = await repository.getRecent(5);
      console.log('📋 Recent notices:');
      recent.forEach((notice, index) => {
        console.log(`  ${index + 1}. [${notice.district}] ${notice.title}`);
      });
      
      console.log('\n📊 Usage:');
      console.log('  npm start gangnam          # 강남구 증분 스크래핑 테스트');
      console.log('  npm start gangdong --full  # 강동구 전체 스크래핑 테스트');
      console.log('  npm start -- --hourly-test                # Firebase hourlyDistrictNotices 함수 테스트 (모든 그룹)');
      console.log('  npm start -- --hourly-test --group 중부권   # 중부권만 테스트');
      console.log('\n📊 사용 가능한 지역 그룹:');
      Object.keys(DISTRICT_GROUPS).forEach(key => {
        const districts = (DISTRICT_GROUPS as any)[key];
        console.log(`  - ${key.toLowerCase()} (${getGroupNameKorean(key)}): ${districts.join(', ')}`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (!args.includes('--hourly-test')) {
      repository.close();
    }
  }
}

if (require.main === module) {
  main();
} 