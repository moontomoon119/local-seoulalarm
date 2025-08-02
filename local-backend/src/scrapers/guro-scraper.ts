import * as cheerio from 'cheerio';
import { BaseScraper } from './base-scraper';
import { NoticeListItem } from '../types/notice';

export class GuroScraper extends BaseScraper {
  constructor() {
    super('구로구', 'https://www.guro.go.kr');
  }

  async scrapeNoticeList(): Promise<NoticeListItem[]> {
    const notices: NoticeListItem[] = [];
    const maxPages = 1;

    for (let page = 1; page <= maxPages; page++) {
      const url = `${this.baseUrl}/www/selectBbsNttList.do?bbsNo=663&key=1791&pageIndex=${page}`;
      const html = await this.fetchWithRetry(url);
      const $ = cheerio.load(html);

      $('table.p-table tbody tr').each((_, el) => {
        const $row = $(el);
        const $link = $row.find('td.p-subject a');

        const title = $link.text().trim();
        const href = $link.attr('href') || '';
        const correctedPath = href.replace('./', '/www/');
        const fullUrl = `${this.baseUrl}${correctedPath}`;
        const date = $row.find('td').eq(4).text().trim();

        if (title && fullUrl && date) {
          notices.push({
            title,
            url: fullUrl,
            publishDate: this.parseDate(date),
            category: '고시/공고',
          });
        }
      });

      await this.sleep(200);
    }

    return notices;
  }

  async scrapeNoticeDetail(url: string): Promise<string> {
    const html = await this.fetchWithRetry(url);
    const $ = cheerio.load(html);

    // 본문 내용은 <pre> 태그 내에 있음
    const content = $('pre').text().trim();
    return this.cleanText(content);
  }

  parseDate(dateStr: string): string {
    const cleaned = dateStr.replace(/\D/g, '');
    if (cleaned.length === 8) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}T00:00:00.000Z`;
    }
    return new Date().toISOString();
  }
}
