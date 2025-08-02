// local-backend/src/server.ts
import express from 'express';
import cors from 'cors';
import * as cron from 'node-cron';
import dotenv from 'dotenv';
import { LocalRepository } from './repositories/local-repository';
import { ScraperService } from './services/scraper-service';
import { getScrapers } from './index';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS 설정 - 프론트엔드에서 접근 가능하도록
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

app.use(express.json());

// 레포지토리 초기화
const repository = new LocalRepository();

// 지역 그룹 정의 (원본과 동일)
const DISTRICT_GROUPS = {
  CENTRAL: ['jongno', 'junggu', 'yongsan', 'seongdong', 'gangbuk'],
  NORTHEAST_A: ['dongdaemun', 'seongbuk', 'dobong', 'gangbuk'],
  NORTHEAST_B: ['nowon', 'gwangjin', 'gangdong'],
  NORTHWEST: ['eunpyeong', 'seodaemun', 'mapo', 'yangcheon'],
  SOUTHWEST: ['gangseo', 'guro', 'geumcheon', 'yeongdeungpo'],
  SOUTHEAST: ['gwanak', 'gangnam', 'songpa', 'seocho']
};

// 모든 스크래퍼 가져오기
const scrapers = getScrapers();

// API 라우트들
// 1. 최근 공지사항 조회
app.get('/api/notices/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const notices = await repository.getRecent(limit);
    res.json({
      success: true,
      data: notices,
      total: notices.length
    });
  } catch (error) {
    console.error('최근 공지사항 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '공지사항 조회 중 오류가 발생했습니다.'
    });
  }
});

// 2. 공지사항 검색
app.get('/api/notices/search', async (req, res) => {
  try {
    const keyword = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 20;
    
    if (!keyword) {
      return res.status(400).json({
        success: false,
        error: '검색 키워드가 필요합니다.'
      });
    }

    const notices = await repository.searchNotices(keyword, limit);
    res.json({
      success: true,
      data: notices,
      total: notices.length,
      keyword
    });
  } catch (error) {
    console.error('공지사항 검색 오류:', error);
    res.status(500).json({
      success: false,
      error: '검색 중 오류가 발생했습니다.'
    });
  }
});

// 3. 날짜 범위로 공지사항 조회
app.get('/api/notices/date-range', async (req, res) => {
  try {
    const startDate = req.query.start as string;
    const endDate = req.query.end as string;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: '시작 날짜와 끝 날짜가 필요합니다.'
      });
    }

    const notices = await repository.getNoticesByDateRange(startDate, endDate);
    res.json({
      success: true,
      data: notices,
      total: notices.length,
      dateRange: { startDate, endDate }
    });
  } catch (error) {
    console.error('날짜 범위 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '날짜 범위 조회 중 오류가 발생했습니다.'
    });
  }
});

// 4. 지역별 통계 조회
app.get('/api/statistics/districts', async (req, res) => {
  try {
    const stats = await repository.getStatsByDistrict();
    const totalCount = await repository.count();
    
    res.json({
      success: true,
      data: {
        districts: stats,
        total: totalCount
      }
    });
  } catch (error) {
    console.error('지역별 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '통계 조회 중 오류가 발생했습니다.'
    });
  }
});

// 5. 수동 스크래핑 트리거 (특정 지역)
app.post('/api/scrape/:district', async (req, res) => {
  try {
    const district = req.params.district;
    const fullScrape = req.query.full === 'true';
    
    if (!scrapers[district]) {
      return res.status(404).json({
        success: false,
        error: `지역 '${district}'을 찾을 수 없습니다.`
      });
    }

    console.log(`🚀 수동 스크래핑 시작: ${district} (전체: ${fullScrape})`);
    
    // 지역별 스크래퍼와 서비스 생성
    const scraper = scrapers[district];
    const scraperService = new ScraperService(scraper, repository);
    
    // 전체 또는 증분 스크래핑 실행
    const result = fullScrape 
      ? await scraperService.scrapeAndSave() 
      : await scraperService.scrapeAuto();
    
    res.json({
      success: true,
      data: {
        district,
        saved: result.saved,
        duplicates: result.duplicates,
        total: result.total,
        errors: result.errors,
        fullScrape
      }
    });
  } catch (error) {
    console.error(`${req.params.district} 스크래핑 오류:`, error);
    res.status(500).json({
      success: false,
      error: '스크래핑 중 오류가 발생했습니다.'
    });
  }
});

// 6. 전체 스크래핑 트리거
app.post('/api/scrape/all', async (req, res) => {
  try {
    console.log('🚀 전체 수동 스크래핑 시작');
    const results = [];
    
    for (const [groupName, districts] of Object.entries(DISTRICT_GROUPS)) {
      console.log(`📍 ${groupName} 그룹 스크래핑 시작`);
      
      for (const district of districts) {
        if (scrapers[district]) {
          try {
            // 지역별 스크래퍼와 서비스 생성
            const scraper = scrapers[district];
            const scraperService = new ScraperService(scraper, repository);
            
            // 자동 스크래핑 실행
            const result = await scraperService.scrapeAuto();
            
            results.push({
              district,
              success: true,
              saved: result.saved,
              duplicates: result.duplicates,
              total: result.total,
              errors: result.errors
            });
          } catch (error) {
            console.error(`${district} 스크래핑 실패:`, error);
            results.push({
              district,
              success: false,
              error: error instanceof Error ? error.message : '알 수 없는 오류'
            });
          }
        }
      }
    }
    
    res.json({
      success: true,
      data: {
        totalDistricts: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      }
    });
  } catch (error) {
    console.error('전체 스크래핑 오류:', error);
    res.status(500).json({
      success: false,
      error: '전체 스크래핑 중 오류가 발생했습니다.'
    });
  }
});

// 7. 서버 상태 확인
app.get('/api/health', async (req, res) => {
  try {
    const totalNotices = await repository.count();
    const stats = await repository.getStatsByDistrict();
    
    res.json({
      success: true,
      data: {
        status: 'healthy',
        totalNotices,
        supportedDistricts: Object.keys(scrapers).length,
        districtStats: stats.slice(0, 5) // 상위 5개 지역만
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '서버 상태 확인 중 오류가 발생했습니다.'
    });
  }
});

// 스케줄링된 크롤링 함수들
async function scrapeDistrictGroup(groupName: string, districts: string[]) {
  console.log(`🚀 스케줄링 스크래핑 시작: ${groupName}`);
  
  for (const district of districts) {
    if (scrapers[district]) {
      try {
        console.log(`📍 ${district} 스크래핑 중...`);
        
        // 지역별 스크래퍼와 서비스 생성
        const scraper = scrapers[district];
        const scraperService = new ScraperService(scraper, repository);
        
        // 자동 스크래핑 실행
        const result = await scraperService.scrapeAuto();
        console.log(`✅ ${district} 완료: 신규 ${result.saved}개, 중복 ${result.duplicates}개, 전체 ${result.total}개`);
      } catch (error) {
        console.error(`❌ ${district} 스크래핑 실패:`, error instanceof Error ? error.message : '알 수 없는 오류');
      }
    } else {
      console.log(`⚠️  ${district} 스크래퍼가 없습니다.`);
    }
  }
  
  console.log(`✅ ${groupName} 그룹 스크래핑 완료`);
}

// 매시간 스케줄링 (Firebase Functions와 동일한 시간표)
// 중부권: 매시 5분
cron.schedule('5 * * * *', () => {
  scrapeDistrictGroup('중부권', DISTRICT_GROUPS.CENTRAL);
}, {
  timezone: 'Asia/Seoul'
});

// 동북권A: 매시 15분
cron.schedule('15 * * * *', () => {
  scrapeDistrictGroup('동북권A', DISTRICT_GROUPS.NORTHEAST_A);
}, {
  timezone: 'Asia/Seoul'
});

// 동북권B: 매시 25분
cron.schedule('25 * * * *', () => {
  scrapeDistrictGroup('동북권B', DISTRICT_GROUPS.NORTHEAST_B);
}, {
  timezone: 'Asia/Seoul'
});

// 서북권: 매시 35분
cron.schedule('35 * * * *', () => {
  scrapeDistrictGroup('서북권', DISTRICT_GROUPS.NORTHWEST);
}, {
  timezone: 'Asia/Seoul'
});

// 서남권: 매시 45분
cron.schedule('45 * * * *', () => {
  scrapeDistrictGroup('서남권', DISTRICT_GROUPS.SOUTHWEST);
}, {
  timezone: 'Asia/Seoul'
});

// 동남권: 매시 55분
cron.schedule('55 * * * *', () => {
  scrapeDistrictGroup('동남권', DISTRICT_GROUPS.SOUTHEAST);
}, {
  timezone: 'Asia/Seoul'
});

// 스케줄링 상태 로그 (매시 정각)
cron.schedule('0 * * * *', () => {
  console.log('🕐 매시간 스크래핑 스케줄 실행 중');
  console.log('📅 스케줄: 중부권(5분) → 동북권A(15분) → 동북권B(25분) → 서북권(35분) → 서남권(45분) → 동남권(55분)');
}, {
  timezone: 'Asia/Seoul'
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 로컬 백엔드 서버가 http://localhost:${PORT}에서 실행 중입니다.`);
  console.log(`📊 API 엔드포인트:`);
  console.log(`   GET  /api/notices/recent - 최근 공지사항`);
  console.log(`   GET  /api/notices/search?q=keyword - 공지사항 검색`);
  console.log(`   GET  /api/notices/date-range?start=YYYY-MM-DD&end=YYYY-MM-DD - 날짜 범위 조회`);
  console.log(`   GET  /api/statistics/districts - 지역별 통계`);
  console.log(`   POST /api/scrape/:district - 수동 스크래핑`);
  console.log(`   POST /api/scrape/all - 전체 수동 스크래핑`);
  console.log(`   GET  /api/health - 서버 상태`);
  console.log(`⏰ 자동 스크래핑이 매시간 스케줄링되어 실행됩니다.`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 서버를 종료합니다...');
  repository.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 서버를 종료합니다...');
  repository.close();
  process.exit(0);
});