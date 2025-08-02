import * as cheerio from 'cheerio';
import { BaseScraper } from './base-scraper';
import { NoticeListItem } from '../types/notice';

export class GangdongScraper extends BaseScraper {
  constructor() {
    super('강동구', 'https://www.gangdong.go.kr');
  }

  async scrapeNoticeList(): Promise<NoticeListItem[]> {
    const notices: NoticeListItem[] = [];

    // 최대 1페이지까지 스크래핑
    const maxPages = 1;
    for (let page = 1; page <= maxPages; page++) {
      const listUrl = `${this.baseUrl}/web/newportal/notice/01?cp=${page}&pageSize=10`;
      const html = await this.fetchWithRetry(listUrl);
      const $ = cheerio.load(html);

      // 공지사항 목록의 각 행 처리
      $('.table01 table tbody tr').each((index, element) => {
        const $row = $(element);
        const columns = $row.find('td');
        
        if (columns.length >= 5) {
          // 제목은 td.tx-lt 내부의 a 태그에 있음
          const titleElement = $(columns[2]).find('a');
          const dateString = $(columns[4]).text().trim();
          
          const title = titleElement.text().trim();
          const relativeUrl = titleElement.attr('href');
          
          if (title && relativeUrl && dateString) {
            notices.push({
              title: title,
              url: this.absoluteUrl(relativeUrl),
              publishDate: this.parseDate(dateString),
              category: '고시/공고'
            });
          }
        }
      });

      console.log(`📋 Found notices on page ${page}: ${notices.length}`);
      await this.sleep(100);
    }

    // 중복 제거 (URL 기준)
    const unique = Array.from(new Map(notices.map(n => [n.url, n])).values());
    return unique;
  }
  
  // 증분 스크래핑용 첫 페이지만 가져오기
  async scrapeFirstPageList(): Promise<NoticeListItem[]> {
    const notices: NoticeListItem[] = [];
    
    // 첫 페이지만 가져오기
    const listUrl = `${this.baseUrl}/web/newportal/notice/01?cp=1&pageSize=10`;
    console.log(`📡 Fetching first page: ${listUrl}`);
    
    const html = await this.fetchWithRetry(listUrl);
    const $ = cheerio.load(html);
    
    $('.table01 table tbody tr').each((index, element) => {
      const $row = $(element);
      const columns = $row.find('td');
      
      if (columns.length >= 5) {
        const titleElement = $(columns[2]).find('a');
        const dateString = $(columns[4]).text().trim();
        
        const title = titleElement.text().trim();
        const relativeUrl = titleElement.attr('href');
        
        if (title && relativeUrl && dateString) {
          notices.push({
            title: title,
            url: this.absoluteUrl(relativeUrl),
            publishDate: this.parseDate(dateString),
            category: '고시/공고'
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
      const listUrl = `${this.baseUrl}/web/newportal/notice/01?cp=${page}&pageSize=10`;
      console.log(`📡 Fetching additional page ${page}: ${listUrl}`);
      
      const html = await this.fetchWithRetry(listUrl);
      const $ = cheerio.load(html);
      
      $('.table01 table tbody tr').each((index, element) => {
        const $row = $(element);
        const columns = $row.find('td');
        
        if (columns.length >= 5) {
          const titleElement = $(columns[2]).find('a');
          const dateString = $(columns[4]).text().trim();
          
          const title = titleElement.text().trim();
          const relativeUrl = titleElement.attr('href');
          
          if (title && relativeUrl && dateString) {
            notices.push({
              title: title,
              url: this.absoluteUrl(relativeUrl),
              publishDate: this.parseDate(dateString),
              category: '고시/공고'
            });
          }
        }
      });

      console.log(`📋 페이지 ${page}에서 ${notices.length}개 공지 발견`);
      await this.sleep(100);
    }
    
    // 중복 제거 (URL 기준)
    const unique = Array.from(new Map(notices.map(n => [n.url, n])).values());
    return unique;
  }

  async scrapeNoticeDetail(url: string): Promise<string> {
    const html = await this.fetchWithRetry(url);
    const $ = cheerio.load(html);

    // 상세 페이지에서 주요 내용이 담긴 td 태그 찾기
    // 예제에서 제공한 내용처럼 colspan="4"가 있는 td를 찾거나
    // 다른 식별 가능한 특성을 가진 콘텐츠 영역 찾기
    let content = '';
    
    // 1. colspan="4"가 있는 td 태그 찾기
    const colspanTd = $('td[colspan="4"]');
    if (colspanTd.length > 0) {
      content = colspanTd.html() || '';
    }
    
    // 2. 주요 콘텐츠 컨테이너 찾기 (여러 셀렉터 시도)
    if (!content) {
      const contentSelectors = [
        '.board-view-con',
        '.view-cont',
        '.bd-view-cont',
        '.view-content',
        '.board-cont',
        '.boardview-cont'
      ];
      
      for (const selector of contentSelectors) {
        const element = $(selector);
        if (element.length > 0) {
          content = element.html() || '';
          break;
        }
      }
    }
    
    // 3. 더 큰 범위에서 찾기
    if (!content) {
      // 게시물 내용 테이블 찾기 (일반적인 패턴)
      const boardTable = $('.board-view').find('table');
      if (boardTable.length > 0) {
        // 내용이 있는 행 찾기 - 일반적으로 마지막 행이나 특정 클래스가 있는 행
        const contentRow = boardTable.find('tr').eq(1); // 두 번째 행을 시도 (첫 번째는 보통 제목)
        if (contentRow.length > 0) {
          content = contentRow.find('td').html() || '';
        }
      }
    }
    
    // 4. 표준 콘텐츠 컨테이너 확인
    if (!content) {
      const bodyContent = $('.view-body').html() || 
                         $('.boardview').html() || 
                         $('#content').html();
      
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
    // 강동구 날짜 형식: "2024-05-16" 또는 "2024.05.16"
    const cleaned = dateString.replace(/\s+/g, '').trim();
    
    // 다양한 날짜 형식 처리
    const patterns = [
      /(\d{4})-(\d{1,2})-(\d{1,2})/,   // 2024-01-15
      /(\d{4})\.(\d{1,2})\.(\d{1,2})/,  // 2024.01.15
      /(\d{4})\/(\d{1,2})\/(\d{1,2})/   // 2024/01/15
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