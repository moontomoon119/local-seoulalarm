import * as cheerio from 'cheerio';
import { BaseScraper } from './base-scraper';
import { NoticeListItem } from '../types/notice';

export class DobongScraper extends BaseScraper {
  constructor() {
    super('도봉구', 'https://www.dobong.go.kr');
  }

  async scrapeNoticeList(): Promise<NoticeListItem[]> {
    const results: NoticeListItem[] = [];
    const maxPages = 3;

    for (let page = 1; page <= maxPages; page++) {
      const url = `${this.baseUrl}/WDB_DEV/gosigong_go/default.asp?intPage=${page}`;
      const html = await this.fetchWithRetry(url);
      const $ = cheerio.load(html);

      $('table.gosigonggo_table tbody tr').each((_, el) => {
        const $row = $(el);
        const $link = $row.find('td[data-cell-header="제목"] a');

        const title = $link.text().trim();
        const href = $link.attr('href');
        const fullUrl = href ? `${this.baseUrl}/WDB_DEV/gosigong_go/${href.replace('./', '')}` : '';
        const dateText = $row.find('td[data-cell-header="등록일"]').text().trim();

        if (title && fullUrl && dateText) {
          results.push({
            title,
            url: fullUrl,
            publishDate: this.parseDate(dateText),
            category: '고시/공고',
          });
        }
      });

      await this.sleep(200);
    }

    return results;
  }

  async scrapeNoticeDetail(url: string): Promise<string> {
    const html = await this.fetchWithRetry(url);
    const $ = cheerio.load(html);

    const content = $('#scontents')
      .find('p, td, li, div')
      .map((_, el) => $(el).text())
      .get()
      .join('\n');

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
