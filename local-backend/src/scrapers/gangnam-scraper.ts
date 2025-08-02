import * as cheerio from 'cheerio';
import { BaseScraper } from './base-scraper';
import { NoticeListItem } from '../types/notice';

export class GangnamScraper extends BaseScraper {
  constructor() {
    super('강남구', 'https://www.gangnam.go.kr');
  }

  async scrapeNoticeList(): Promise<NoticeListItem[]> {
    const notices: NoticeListItem[] = [];

    const maxPages = 1; // 또는 필요한 만큼
    for (let page = 1; page <= maxPages; page++) {
      const listUrl = `${this.baseUrl}/notice/list.do?mid=ID05_040201&pgno=${page}&lists=10`;
      const html = await this.fetchWithRetry(listUrl);
      const $ = cheerio.load(html);

      $('tbody tr').each((index, element) => {
        const $row = $(element);
        const columns = $row.find('td');
        
        if (columns.length >= 4) {
          const noticeNumber = $(columns[1]).text().trim();
          const titleElement = $(columns[2]).find('a');
          const department = $(columns[3]).text().trim();
          const dateString = $(columns[4]).text().trim();
          
          const title = titleElement.text().trim();
          const relativeUrl = titleElement.attr('href');
          
          if (title && relativeUrl && dateString) {
            notices.push({
              title: `[${noticeNumber}] ${title}`,
              url: this.absoluteUrl(relativeUrl),
              publishDate: this.parseDate(dateString),
              category: department || '고시공고'
            });
          }
        }
      });

      console.log(`📋 Found notices on page ${page}: ${notices.length}`);
      await this.sleep(1000);
    }

    // 중복 제거 (URL 기준)
    const unique = Array.from(new Map(notices.map(n => [n.url, n])).values());
    return unique;
  }
  
  // 증분 스크래핑용 첫 페이지만 가져오기
  async scrapeFirstPageList(): Promise<NoticeListItem[]> {
    const notices: NoticeListItem[] = [];
    
    // 첫 페이지만 가져오기
    const listUrl = `${this.baseUrl}/notice/list.do?mid=ID05_040201&pgno=1&lists=30`;
    console.log(`📡 Fetching first page: ${listUrl}`);
    
    const html = await this.fetchWithRetry(listUrl);
    const $ = cheerio.load(html);
    
    $('tbody tr').each((index, element) => {
      const $row = $(element);
      const columns = $row.find('td');
      
      if (columns.length >= 4) {
        const noticeNumber = $(columns[1]).text().trim();
        const titleElement = $(columns[2]).find('a');
        const department = $(columns[3]).text().trim();
        const dateString = $(columns[4]).text().trim();
        
        const title = titleElement.text().trim();
        const relativeUrl = titleElement.attr('href');
        
        if (title && relativeUrl && dateString) {
          notices.push({
            title: `[${noticeNumber}] ${title}`,
            url: this.absoluteUrl(relativeUrl),
            publishDate: this.parseDate(dateString),
            category: department || '고시공고'
          });
        }
      }
    });

    console.log(`📋 첫 페이지에서 ${notices.length}개 공지 발견`);
    
    // 중복 제거 (URL 기준)
    const unique = Array.from(new Map(notices.map(n => [n.url, n])).values());
    return unique;
  }
  
  // 증분 스크래핑용 추가 페이지 가져오기
  async scrapeAdditionalPagesList(): Promise<NoticeListItem[]> {
    const notices: NoticeListItem[] = [];
    
    // 2~3페이지 가져오기
    for (let page = 2; page <= 3; page++) {
      const listUrl = `${this.baseUrl}/notice/list.do?mid=ID05_040201&pgno=${page}&lists=30`;
      console.log(`📡 Fetching additional page ${page}: ${listUrl}`);
      
      const html = await this.fetchWithRetry(listUrl);
      const $ = cheerio.load(html);
      
      $('tbody tr').each((index, element) => {
        const $row = $(element);
        const columns = $row.find('td');
        
        if (columns.length >= 4) {
          const noticeNumber = $(columns[1]).text().trim();
          const titleElement = $(columns[2]).find('a');
          const department = $(columns[3]).text().trim();
          const dateString = $(columns[4]).text().trim();
          
          const title = titleElement.text().trim();
          const relativeUrl = titleElement.attr('href');
          
          if (title && relativeUrl && dateString) {
            notices.push({
              title: `[${noticeNumber}] ${title}`,
              url: this.absoluteUrl(relativeUrl),
              publishDate: this.parseDate(dateString),
              category: department || '고시공고'
            });
          }
        }
      });

      console.log(`📋 페이지 ${page}에서 ${notices.length}개 공지 발견`);
      await this.sleep(1000);
    }
    
    // 중복 제거 (URL 기준)
    const unique = Array.from(new Map(notices.map(n => [n.url, n])).values());
    return unique;
  }

  private async scrapeNoticeListPage(page: number): Promise<NoticeListItem[]> {
    const listUrl = `${this.baseUrl}/notice/list.do?mid=ID05_040201&pgno=${page}&lists=10`;
    const html = await this.fetchWithRetry(listUrl);
    const $ = cheerio.load(html);

    const notices: NoticeListItem[] = [];

    $('tbody tr').each((index, element) => {
      const $row = $(element);
      const columns = $row.find('td');
      
      if (columns.length >= 4) {
        const noticeNumber = $(columns[1]).text().trim();
        const titleElement = $(columns[2]).find('a');
        const department = $(columns[3]).text().trim();
        const dateString = $(columns[4]).text().trim();
        
        const title = titleElement.text().trim();
        const relativeUrl = titleElement.attr('href');
        
        if (title && relativeUrl && dateString) {
          notices.push({
            title: `[${noticeNumber}] ${title}`,
            url: this.absoluteUrl(relativeUrl),
            publishDate: this.parseDate(dateString),
            category: department || '고시공고'
          });
        }
      }
    });

    console.log(`📋 Found ${notices.length} notices on page ${page}`);
    return notices;
  }

  private getTotalPages($: cheerio.CheerioAPI): number {
    // 페이지네이션에서 마지막 페이지 번호 찾기
    const lastPageLink = $('.pagination a').last();
    const lastPageText = lastPageLink.text().trim();
    
    if (lastPageText && /^\d+$/.test(lastPageText)) {
      return parseInt(lastPageText);
    }
    
    // 페이지네이션 링크에서 숫자 찾기
    let maxPage = 1;
    $('.pagination a').each((i, el) => {
      const text = $(el).text().trim();
      const pageNum = parseInt(text);
      if (!isNaN(pageNum) && pageNum > maxPage) {
        maxPage = pageNum;
      }
    });
    
    return maxPage;
  }

  async scrapeNoticeDetail(url: string): Promise<string> {
    const html = await this.fetchWithRetry(url);
    const $ = cheerio.load(html);

    // 강남구 공고문 상세 페이지 구조에 맞는 셀렉터들
    const contentSelectors = [
      '.board-view .view-content',
      '.board-detail .content',
      '.notice-view .content',
      '.view-wrapper .content',
      '#content .board-content'
    ];

    let content = '';
    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.html() || element.text();
        break;
      }
    }

    // 더 넓은 범위에서 컨텐츠 찾기
    if (!content) {
      const bodyContent = $('.board-view').html() || 
                         $('.notice-detail').html() || 
                         $('.content-area').html() ||
                         $('#container .content').html();
      
      if (bodyContent) {
        content = bodyContent;
      }
    }

    // HTML 정리
    if (content) {
      // 불필요한 태그 제거
      content = content
        .replace(/<script[^>]*>.*?<\/script>/gis, '')
        .replace(/<style[^>]*>.*?<\/style>/gis, '')
        .replace(/<noscript[^>]*>.*?<\/noscript>/gis, '')
        .replace(/<iframe[^>]*>.*?<\/iframe>/gis, '');
      
      return this.cleanText(content);
    }

    // 컨텐츠를 찾지 못한 경우 페이지 제목이라도 반환
    const title = $('title').text() || $('h1').first().text() || '';
    return title || 'Content could not be extracted';
  }

  parseDate(dateString: string): string {
    // 강남구 날짜 형식: "2025-05-16" 
    const cleaned = dateString.replace(/\s+/g, '').trim();
    
    // 다양한 날짜 형식 처리
    const patterns = [
      /(\d{4})-(\d{1,2})-(\d{1,2})/,   // 2024-01-15 (강남구 기본 형식)
      /(\d{4})\.(\d{1,2})\.(\d{1,2})/,  // 2024.01.15
      /(\d{4})\/(\d{1,2})\/(\d{1,2})/  // 2024/01/15
    ];

    for (const pattern of patterns) {
      const match = cleaned.match(pattern);
      if (match) {
        const [, year, month, day] = match;
        const paddedMonth = month.padStart(2, '0');
        const paddedDay = day.padStart(2, '0');
        return `${year}-${paddedMonth}-${paddedDay}T00:00:00.000Z`;
      }
    }

    // 파싱 실패 시 현재 날짜 반환
    console.warn(`Failed to parse date: ${dateString}`);
    return new Date().toISOString();
  }
} 