import * as cheerio from 'cheerio';
import { BaseScraper } from './base-scraper';
import { NoticeListItem } from '../types/notice';

export class GeumcheonScraper extends BaseScraper {
  constructor() {
    super('금천구', 'https://www.geumcheon.go.kr');
  }

  async scrapeNoticeList(): Promise<NoticeListItem[]> {
    const notices: NoticeListItem[] = [];
    const maxPages = 3;

    for (let page = 1; page <= maxPages; page++) {
      const url = `${this.baseUrl}/portal/tblSeolGosiDetailList.do?key=294&rep=1&pageIndex=${page}`;
      const html = await this.fetchWithRetry(url);
      const $ = cheerio.load(html);

      $('table.p-table tbody tr').each((_, el) => {
        const $row = $(el);
        const $link = $row.find('td').eq(2).find('a');

        const title = $link.text().trim();
        const href = $link.attr('href');
        const fullUrl = this.baseUrl + '/portal/' + href?.replace('./', '');
        const dateText = $row.find('td').eq(4).text().trim(); // 등록일

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

    // 본문 내용: 마지막 td[data-brl-flag="7"]에 공고 본문 있음
    const detail = $('td[data-brl-flag="7"]').text().trim();

    return this.cleanText(detail);
  }

  parseDate(dateStr: string): string {
    const cleaned = dateStr.replace(/\./g, '-').replace(/\s/g, '');
    return cleaned.length === 10
      ? `${cleaned}T00:00:00.000Z`
      : new Date().toISOString();
  }
}
