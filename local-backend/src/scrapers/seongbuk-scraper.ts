import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';
import { BaseScraper } from './base-scraper';
import { NoticeListItem } from '../types/notice';

export class SeongbukScraper extends BaseScraper {
  private httpsAgent: https.Agent;

  constructor() {
    super('성북구', 'https://www.sb.go.kr');
    
    // SSL 검증을 비활성화하는 HTTPS Agent 생성
    this.httpsAgent = new https.Agent({
      rejectUnauthorized: false
    });
  }

  async scrapeNoticeList(): Promise<NoticeListItem[]> {
    const notices: NoticeListItem[] = [];
    const url = `${this.baseUrl}/www/selectEminwonList.do?key=6977`;

    try {
      console.log(`🔍 성북구 공지사항 목록 요청: ${url}`);
      
      const response = await axios.get(url, {
        httpsAgent: this.httpsAgent,
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br'
        }
      });

      const $ = cheerio.load(response.data);

      $('table.p-table tbody tr').each((_, el) => {
        const $row = $(el);
        const titleAnchor = $row.find('td.p-subject a');
        const href = titleAnchor.attr('href') || '';
        const title = titleAnchor.text().trim();
        const publishDate = $row.find('td').last().text().trim();
        const seqMatch = href.match(/notAncmtMgtNo=(\d+)/);

        if (seqMatch && title) {
          const fullUrl = `${this.baseUrl}/www/selectEminwonView.do?key=6977&notAncmtMgtNo=${seqMatch[1]}`;
          notices.push({
            title,
            url: fullUrl,
            publishDate: this.parseDate(publishDate),
            category: '고시공고',
          });
        }
      });

      console.log(`📋 성북구에서 ${notices.length}건의 공지사항을 찾았습니다.`);
      return notices;
    } catch (error) {
      console.error('🚨 성북구 공지사항 목록 스크래핑 실패:', error);
      throw error;
    }
  }

  async scrapeNoticeDetail(url: string): Promise<string> {
    try {
      console.log(`📄 상세 내용 요청: ${url}`);
      
      const response = await axios.get(url, {
        httpsAgent: this.httpsAgent,
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8',
          'Referer': this.baseUrl
        }
      });

      const $ = cheerio.load(response.data);
      const contentHtml = $('td').first().html() || '';

      return this.cleanText(
        cheerio.load(contentHtml).text().replace(/\u00a0/g, ' ')
      );
    } catch (error) {
      console.error('🚨 성북구 상세 내용 스크래핑 실패:', error);
      throw error;
    }
  }

  parseDate(dateString: string): string {
    // e.g., "2025-05-16"
    const cleaned = dateString.trim();
    const [yyyy, mm, dd] = cleaned.split('-');
    if (yyyy && mm && dd) {
      return `${yyyy}-${mm}-${dd}T00:00:00.000Z`;
    }
    return new Date().toISOString();
  }

  // 첫 페이지만 스크래핑하는 메서드 오버라이드
  async scrapeFirstPageList(): Promise<NoticeListItem[]> {
    return this.scrapeNoticeList();
  }
}