import * as cheerio from 'cheerio';
import { BaseScraper } from './base-scraper';
import { NoticeListItem } from '../types/notice';
import axios from 'axios';

export class DongdaemunScraper extends BaseScraper {
  constructor() {
    super('동대문구', 'https://www.ddm.go.kr');
  }

  async scrapeNoticeList(): Promise<NoticeListItem[]> {
    const notices: NoticeListItem[] = [];
    const maxPages = 1;

    for (let page = 1; page <= maxPages; page++) {
      const url = `${this.baseUrl}/www/selectEminwonWebList.do?key=3291&pageIndex=${page}`;
      const html = await this.fetchWithRetry(url);
      const $ = cheerio.load(html);

      $('table.p-table tbody tr').each((_, el) => {
        const $row = $(el);
        const $link = $row.find('td.text_left a');
        const href = $link.attr('href') || '';
        const fullUrl = href ? this.baseUrl + href.replace('./', '/www/') : '';
        const title = $link.text().trim();
        const dateText = $row.find('td').eq(4).text().trim();

        if (title && fullUrl && dateText) {
          notices.push({
            title,
            url: fullUrl,
            publishDate: this.parseDate(dateText),
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

    const content = $('td[colspan="2"] pre').text();
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
