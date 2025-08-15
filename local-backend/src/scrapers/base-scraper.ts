//local-backend\src\scrapers\base-scraper.ts
import axios, { AxiosResponse } from 'axios';
import { Notice, NoticeListItem } from '../types/notice';
import https from 'https'; 
import iconv from 'iconv-lite';

export abstract class BaseScraper {
  protected district: string;
  protected baseUrl: string;
  
  constructor(district: string, baseUrl: string) {
    this.district = district;
    this.baseUrl = baseUrl;
  }

  // 추상 메서드들 - 각 자치구에서 구현
  abstract scrapeNoticeList(): Promise<NoticeListItem[]>;
  abstract scrapeNoticeDetail(url: string): Promise<string>;
  abstract parseDate(dateString: string): string;

  // 증분 스크래핑을 위한 메서드들 - 자치구별로 오버라이드 가능
  async scrapeFirstPage(): Promise<Notice[]> {
    console.log(`🔍 ${this.district} 첫 페이지 스크래핑...`);
    
    // 기본 구현: 첫 페이지만 스크래핑해서 공지 목록 가져오기
    const noticeItems = await this.scrapeFirstPageList();
    return this.convertItemsToNotices(noticeItems);
  }
  
  async scrapeAdditionalPages(): Promise<Notice[]> {
    console.log(`🔍 ${this.district} 추가 페이지 스크래핑...`);
    
    // 기본 구현: 2~3페이지만 스크래핑
    const noticeItems = await this.scrapeAdditionalPagesList();
    return this.convertItemsToNotices(noticeItems);
  }
  
  // 첫 페이지 목록만 가져오는 메서드
  async scrapeFirstPageList(): Promise<NoticeListItem[]> {
    // 기본 구현: 첫 페이지만 가져오도록 구현
    // 상속받는 클래스에서 재정의 가능
    return this.scrapeNoticeList();
  }
  
  // 추가 페이지 목록을 가져오는 메서드
  async scrapeAdditionalPagesList(): Promise<NoticeListItem[]> {
    // 기본 구현: 빈 배열 반환
    // 상속받는 클래스에서 재정의 필요
    return [];
  }
  
  // NoticeListItem 배열을 완전한 Notice 배열로 변환
  private async convertItemsToNotices(items: NoticeListItem[]): Promise<Notice[]> {
    const notices: Notice[] = [];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        const content = await this.scrapeNoticeDetail(item.url);
        
        const notice: Notice = {
          district: this.district,
          title: item.title,
          content,
          publishDate: item.publishDate,
          url: item.url,
          category: item.category || '일반공고'
        };
        
        if (this.validateNotice(notice)) {
          notices.push(notice);
        }
        
        // 요청 간 지연
        await this.sleep(1000);
      } catch (error: any) {
        console.error(`❌ Failed to scrape detail for ${item.title}:`, error.message);
      }
    }
    
    return notices;
  }

  // 공통 메서드들
  protected async fetchWithRetry(
    url: string,
    maxRetries: number = 3,
    encoding: 'utf-8' | 'euc-kr' = 'utf-8'
  ): Promise<string> {
    const agent = new https.Agent({ rejectUnauthorized: false });
  
    // 자치구별 Referer 설정
    const refererMap: Record<string, string> = {
      '강북구': 'https://www.gangbuk.go.kr/',
      // 다른 자치구는 생략하거나 null
    };
  
    const referer = refererMap[this.district] || undefined;
  
    for (let i = 0; i < maxRetries; i++) {
      try {
        console.log(`📡 Fetching: ${url} (attempt ${i + 1})`);
  
        const response: AxiosResponse<ArrayBuffer> = await axios.get(url, {
          responseType: 'arraybuffer',
          timeout: 15000,
          httpsAgent: agent,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'Accept': 'text/html,application/xhtml+xml',
            'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8',
            ...(referer ? { 'Referer': referer } : {})
          }
        });
  
        if (!response.data) throw new Error('Empty response received');
  
        const buffer = Buffer.from(response.data);
        return encoding === 'euc-kr' ? iconv.decode(buffer, 'euc-kr') : buffer.toString('utf-8');
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.warn(`⚠️  Attempt ${i + 1} failed:`, errMsg);
  
        if (i === maxRetries - 1) {
          throw new Error(`Failed to fetch ${url} after ${maxRetries} attempts: ${errMsg}`);
        }
  
        await this.sleep(Math.pow(2, i) * 1000);
      }
    }
  
    throw new Error('Unexpected error in fetchWithRetry');
  }
  


  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  protected validateNotice(notice: Notice): boolean {
    return !!(
      notice.title &&
      notice.url &&
      notice.publishDate &&
      notice.district
    );
  }

  protected cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();
  }

  protected absoluteUrl(relativeUrl: string): string {
    if (relativeUrl.startsWith('http')) {
      return relativeUrl;
    }
    
    const base = new URL(this.baseUrl);
    if (relativeUrl.startsWith('/')) {
      return `${base.protocol}//${base.host}${relativeUrl}`;
    }
    
    return `${this.baseUrl}/${relativeUrl}`;
  }

  // 전체 스크래핑 워크플로우
  async scrapeAll(): Promise<Notice[]> {
    console.log(`🚀 Starting scrape for ${this.district}...`);
    
    const noticeItems = await this.scrapeNoticeList();
    console.log(`📋 Found ${noticeItems.length} notices`);
    
    const notices: Notice[] = [];
    
    for (let i = 0; i < noticeItems.length; i++) {
      const item = noticeItems[i];
      console.log(`📄 Processing ${i + 1}/${noticeItems.length}: ${item.title}`);
      
      try {
        const content = await this.scrapeNoticeDetail(item.url);
        
        const notice: Notice = {
          district: this.district,
          title: item.title,
          content,
          publishDate: item.publishDate,
          url: item.url,
          category: item.category || '일반공고'
        };

        if (this.validateNotice(notice)) {
          notices.push(notice);
        } else {
          console.log(`⚠️  Invalid notice skipped: ${item.title}`);
        }

        // 요청 간 지연 (서버 부하 방지)
        await this.sleep(1000);
      } catch (error: any) {
        console.error(`❌ Failed to scrape detail for ${item.title}:`, error.message);
      }
    }

    console.log(`✅ Scraping completed: ${notices.length} valid notices`);
    return notices;
  }
} 