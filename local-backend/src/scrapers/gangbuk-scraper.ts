import * as cheerio from 'cheerio';
import { BaseScraper } from './base-scraper';
import { NoticeListItem } from '../types/notice';

export class GangbukScraper extends BaseScraper {
  constructor() {
    super('강북구', 'https://www.gangbuk.go.kr');
  }

  async scrapeNoticeList(): Promise<NoticeListItem[]> {
    const notices: NoticeListItem[] = [];
    const maxPages = 2;

    for (let page = 1; page <= maxPages; page++) {
      const url = `${this.baseUrl}/portal/bbs/B0000245/list.do?menuNo=200082&pageIndex=${page}`;
      const html = await this.fetchWithRetry(url);
      const $ = cheerio.load(html);

      $('div.bd-list table tbody tr').each((_, el) => {
        const $tr = $(el);
        const $a = $tr.find('td.title a');

        const title = $a.text().trim();
        const href = $a.attr('href');
        const dateText = $tr.find('td').eq(4).text().trim();

        const fullUrl = href ? this.absoluteUrl(href) : null;

        if (title && fullUrl && dateText) {
          notices.push({
            title,
            url: fullUrl,
            publishDate: this.parseDate(dateText),
            category: '고시공고',
          });
        }
      });

      await this.sleep(300);
    }

    return notices;
  }

  async scrapeNoticeDetail(url: string): Promise<string> {
    const html = await this.fetchWithRetry(url);
    const $ = cheerio.load(html);

    const content = $('dd').text().replace(/\s{2,}/g, '\n').trim();
    return this.cleanText(content);
  }

  parseDate(dateStr: string): string {
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? '' : parsed.toISOString();
  }
}
