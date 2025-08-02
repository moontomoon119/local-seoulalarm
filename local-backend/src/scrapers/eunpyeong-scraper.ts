import { BaseScraper } from './base-scraper';
import { NoticeListItem } from '../types/notice';
import * as cheerio from 'cheerio';

export class EunpyeongScraper extends BaseScraper {
  constructor() {
    super('은평구', 'https://www.ep.go.kr');
  }

  async scrapeNoticeList(): Promise<NoticeListItem[]> {
    const notices: NoticeListItem[] = [];
    const pageCount = 1;

    for (let page = 1; page <= pageCount; page++) {
      const listUrl = `${this.baseUrl}/www/selectEminwonList.do?key=754&notAncmtSeCode=01&pageUnit=10&pageIndex=${page}`;
      const html = await this.fetchWithRetry(listUrl);  // 기본값 utf-8

      const $ = cheerio.load(html);

      $('table.table tbody tr').each((_, el) => {
        const titleAnchor = $(el).find('td.p-subject a');
        const title = titleAnchor.text().trim();
        const date = $(el).find('td').eq(3).text().trim();
        const href = titleAnchor.attr('href');

        const match = href?.match(/notAncmtMgtNo=(\d+)/);
        const id = match?.[1];

        if (id && title) {
          const url = `${this.baseUrl}/www/selectEminwonView.do?key=754&notAncmtSeCode=01&notAncmtMgtNo=${id}`;
          notices.push({
            title,
            url,
            publishDate: this.parseDate(date),
            category: '고시공고',
          });
        }
      });

      console.log(`📋 은평구 ${page}페이지에서 ${notices.length}건`);
      await this.sleep(500);
    }

    return notices;
  }

  async scrapeNoticeDetail(url: string): Promise<string> {
    const html = await this.fetchWithRetry(url);
    const $ = cheerio.load(html);
    const td = $('td').first(); // 단일 <td>에 본문이 들어있음

    return this.cleanText(td.text());
  }

  parseDate(dateString: string): string {
    // 날짜 예: "2025-05-16"
    const cleaned = dateString.replace(/\./g, '-').trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
      return `${cleaned}T00:00:00.000Z`;
    }
    console.warn(`⚠️ 날짜 파싱 실패: ${dateString}`);
    return new Date().toISOString();
  }
}
