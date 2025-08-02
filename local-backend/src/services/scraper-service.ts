import { BaseScraper } from '../scrapers/base-scraper';
import { NoticeRepository } from '../repositories/notice-repository';
import { Notice } from '../types/notice';
// Firebase 관련 기능들은 로컬 환경에서 비활성화
// import { KeywordMatcher } from '../utils/keyword-matcher';
// import { FCMService } from '../utils/fcm-service';

export interface ScrapeResult {
  total: number;
  saved: number;
  duplicates: number;
  errors: number;
  isIncremental?: boolean;
}

export class ScraperService {
  // Firebase 관련 기능들은 로컬 환경에서 비활성화
  // private keywordMatcher: KeywordMatcher;
  // private fcmService: FCMService;

  constructor(
    private scraper: BaseScraper,
    private repository: NoticeRepository
  ) {
    // 로컬 환경에서는 Firebase 기능 비활성화
    // this.keywordMatcher = new KeywordMatcher();
    // this.fcmService = new FCMService();
  }

  // 키워드 매칭 및 알림 전송 처리 메서드 (로컬 환경에서는 비활성화)
  private async processKeywordMatching(notice: Notice) {
    try {
      // 로컬 환경에서는 Firebase 기능 비활성화
      console.log(`📝 키워드 매칭 스킵됨 (로컬 환경): ${notice.title}`);
      return;
      
      // Firebase 환경에서만 활성화될 코드
      /*
      // 제목과 본문에서 키워드 매칭
      const titleMatches = await this.keywordMatcher.findMatchingSubscribers(notice.title);
      const contentMatches = await this.keywordMatcher.findMatchingSubscribers(notice.content);
      
      // 매칭된 모든 키워드와 사용자에 대해 알림 전송
      const processedTokens = new Set<string>(); // 중복 알림 방지
      
      const sendNotifications = async (matches: Map<string, any[]>, source: '제목' | '본문') => {
        for (const [keyword, users] of matches) {
          for (const user of users) {
            if (!processedTokens.has(user.fcmToken)) {
              processedTokens.add(user.fcmToken);
              
              await this.fcmService.sendNotification(user.fcmToken, {
                title: `${notice.district} 새 공지사항 알림`,
                body: `키워드 '${keyword}'가 포함된 새 공지사항이 등록되었습니다: ${notice.title}`,
                noticeUrl: notice.url,
                district: notice.district,
                keyword: keyword
              });
              
              console.log(`📱 알림 전송 완료 - 사용자: ${user.uid}, 키워드: ${keyword}`);
            }
          }
        }
      };
      
      await sendNotifications(titleMatches, '제목');
      await sendNotifications(contentMatches, '본문');
      */
      
    } catch (error) {
      console.error('❌ 키워드 매칭 및 알림 전송 실패 (로컬 환경에서는 스킵됨):', error);
    }
  }

  async scrapeAndSave(): Promise<ScrapeResult> {
    console.log(`🚀 Starting scrape and save for ${this.scraper['district']}...`);

    const startTime = Date.now();
    let saved = 0;
    let duplicates = 0;
    let errors = 0;

    try {
      const notices = await this.scraper.scrapeAll();

      for (const notice of notices) {
        try {
          const existing = await this.repository.findByUrl(notice.url);

          if (existing) {
            duplicates++;
            console.log(`🔄 Duplicate: ${notice.title}`);
          } else {
            await this.repository.save(notice);
            saved++;
            console.log(`💾 Saved: ${notice.title}`);
            // 새로운 글일 때만 키워드 매칭 수행
            await this.processKeywordMatching(notice);
          }
        } catch (error) {
          errors++;
          if (error instanceof Error) {
            console.error(`❌ Error saving notice: ${notice.title}`, error.message);
          } else {
            console.error(`❌ Error saving notice: ${notice.title}`, error);
          }
        }
      }

      // 동기화 시간 업데이트
      await this.repository.updateSyncDate(this.scraper['district'], new Date());

      const duration = Date.now() - startTime;
      const summary = {
        total: notices.length,
        saved,
        duplicates,
        errors
      };

      console.log(`✅ Scraping completed in ${duration}ms:`, summary);
      return summary;

    } catch (error) {
      if (error instanceof Error) {
        console.error(`💥 Scraping failed:`, error.message);
      } else {
        console.error(`💥 Scraping failed with unknown error:`, error);
      }
      throw error;
    }
  }

  async scrapeIncremental(): Promise<ScrapeResult> {
    console.log(`🔍 Starting incremental scrape for ${this.scraper['district']}...`);
    
    const startTime = Date.now();
    let saved = 0;
    let duplicates = 0;
    let errors = 0;
    
    try {
      // 증분식 스크래핑 - 첫 페이지만 스크래핑해서 이미 존재하는 데이터가 나오면 중단
      const notices = await this.scraper.scrapeFirstPage();
      let shouldContinue = true;
      
      for (const notice of notices) {
        try {
          const existing = await this.repository.findByUrl(notice.url);
          
          if (existing) {
            duplicates++;
            console.log(`🔄 이미 존재: ${notice.title}`);
            
            // 이미 존재하는 데이터를 3개 이상 만나면 스크래핑 중단
            if (duplicates >= 3) {
              console.log(`⏹️ 이미 존재하는 데이터 ${duplicates}개 발견, 스크래핑 중단`);
              shouldContinue = false;
              break;
            }
          } else {
            await this.repository.save(notice);
            saved++;
            console.log(`💾 저장: ${notice.title}`);
            // 새로운 글일 때만 키워드 매칭 수행
            await this.processKeywordMatching(notice);
          }
        } catch (error) {
          errors++;
          if (error instanceof Error) {
            console.error(`❌ 오류 발생: ${notice.title}`, error.message);
          } else {
            console.error(`❌ 오류 발생: ${notice.title}`, error);
          }
        }
      }
      
      // 추가 페이지 스크래핑 여부 결정
      if (shouldContinue && saved > 0) {
        console.log(`🔄 신규 데이터 발견, 추가 페이지 스크래핑 진행...`);
        const moreNotices = await this.scraper.scrapeAdditionalPages();
        
        for (const notice of moreNotices) {
          try {
            const existing = await this.repository.findByUrl(notice.url);
            
            if (existing) {
              duplicates++;
              console.log(`🔄 이미 존재: ${notice.title}`);
            } else {
              await this.repository.save(notice);
              saved++;
              console.log(`💾 저장: ${notice.title}`);
              // 새로운 글일 때만 키워드 매칭 수행
              await this.processKeywordMatching(notice);
            }
          } catch (error) {
            errors++;
            if (error instanceof Error) {
              console.error(`❌ 오류 발생: ${notice.title}`, error.message);
            } else {
              console.error(`❌ 오류 발생: ${notice.title}`, error);
            }
          }
        }
      }
      
      // 동기화 시간 업데이트
      await this.repository.updateSyncDate(this.scraper['district'], new Date());
      
      const duration = Date.now() - startTime;
      const summary = {
        total: saved + duplicates,
        saved,
        duplicates,
        errors,
        isIncremental: true
      };
      
      console.log(`✅ 증분 스크래핑 완료 (${duration}ms):`, summary);
      return summary;
      
    } catch (error) {
      if (error instanceof Error) {
        console.error(`💥 증분 스크래핑 실패:`, error.message);
      } else {
        console.error(`💥 증분 스크래핑 실패:`, error);
      }
      throw error;
    }
  }

  async scrapeAuto(): Promise<ScrapeResult> {
    // 해당 자치구 데이터 존재 확인
    const district = this.scraper['district'] as string;
    const exists = await this.repository.hasNotices(district);
    const lastSync = await this.repository.getLastSyncDate(district);
    
    if (exists && lastSync) {
      // 증분 스크래핑
      console.log(`📌 ${district} 데이터 존재: 증분 스크래핑 실행`);
      return this.scrapeIncremental();
    } else {
      // 전체 스크래핑
      console.log(`📌 ${district} 데이터 없음: 전체 스크래핑 실행`);
      return this.scrapeAndSave();
    }
  }

  async getStats(): Promise<{
    totalNotices: number;
    lastSyncDate: Date | null;
  }> {
    const totalNotices = await this.repository.count();
    const lastSyncDate = await this.repository.getLastSyncDate(this.scraper['district']);

    return {
      totalNotices,
      lastSyncDate
    };
  }
}
