import { BaseScraper } from './base-scraper';
import { NoticeListItem } from '../types/notice';
import * as cheerio from 'cheerio';

export class YongsanScraper extends BaseScraper {
  constructor() {
    super('용산구', 'https://www.yongsan.go.kr');
  }

  async scrapeNoticeList(): Promise<NoticeListItem[]> {
    const notices: NoticeListItem[] = [];
    const pageIndex = 1; // 처음엔 1페이지만
    const listUrl = `${this.baseUrl}/portal/bbs/B0000095/list.do?menuNo=200233&pageIndex=${pageIndex}`;

    const html = await this.fetchWithRetry(listUrl, 3, 'utf-8');
    const $ = cheerio.load(html);

    $('div.bd-list table tbody tr').each((_, el) => {
      const $row = $(el);
      const $a = $row.find('td.title a');
      const href = $a.attr('href');
      const title = $a.text().trim();
      const date = $row.find('td').eq(5).text().trim(); // 작성일
      const category = $row.find('td').eq(1).text().trim();

      if (href && title) {
        const absoluteUrl = this.absoluteUrl(href);
        notices.push({
          title,
          url: absoluteUrl,
          publishDate: this.parseDate(date),
          category,
        });
      }
    });

    console.log(`📋 용산구 ${pageIndex}페이지에서 ${notices.length}건`);
    return notices;
  }

  async scrapeNoticeDetail(url: string): Promise<string> {
    const html = await this.fetchWithRetry(url, 3, 'utf-8');
    const $ = cheerio.load(html);

    const content = $('.dbdata').text().trim(); // 상세 내용 영역
    return this.cleanText(content);
  }

  parseDate(dateString: string): string {
    // "2025-05-16" → "2025-05-16T00:00:00.000Z"
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return `${dateString}T00:00:00.000Z`;
    }
    console.warn(`⚠️ 날짜 파싱 실패: ${dateString}`);
    return new Date().toISOString();
  }
}
