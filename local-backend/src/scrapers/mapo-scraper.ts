import * as cheerio from 'cheerio';
import { BaseScraper } from './base-scraper';
import { NoticeListItem } from '../types/notice';

export class MapoScraper extends BaseScraper {
  constructor() {
    super('마포구', 'https://www.mapo.go.kr');
  }

  async scrapeNoticeList(): Promise<NoticeListItem[]> {
    const notices: NoticeListItem[] = [];
    const maxPages = 3;

    for (let page = 1; page <= maxPages; page++) {
      const listUrl = `${this.baseUrl}/site/main/nPortal/list?cp=${page}`;
      const html = await this.fetchWithRetry(listUrl);
      const $ = cheerio.load(html);

      $('table tbody tr').each((_, el) => {
        const $row = $(el);
        const titleEl = $row.find('td').eq(2).find('a');
        const title = titleEl.text().trim();
        const relativeUrl = titleEl.attr('href');
        const dateText = $row.find('td').eq(5).text().trim();

        if (title && relativeUrl && dateText) {
          notices.push({
            title,
            url: this.absoluteUrl(relativeUrl),
            publishDate: this.parseDate(dateText),
            category: '고시/공고'
          });
        }
      });

      console.log(`📋 마포구 ${page}페이지에서 ${notices.length}건`);
      await this.sleep(100);
    }

    return Array.from(new Map(notices.map(n => [n.url, n])).values());
  }

  async scrapeNoticeDetail(url: string): Promise<string> {
    const html = await this.fetchWithRetry(url);
    const $ = cheerio.load(html);

    const contentTd = $('td[colspan="4"]').first();
    if (contentTd.length > 0) {
      return this.cleanText(contentTd.text());
    }

    return $('title').text() || '본문을 찾을 수 없습니다';
  }

  parseDate(dateString: string): string {
    const cleaned = dateString.replace(/\D/g, '');
    if (cleaned.length === 8) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}T00:00:00.000Z`;
    }
    console.warn(`날짜 파싱 실패: ${dateString}`);
    return new Date().toISOString();
  }
}
