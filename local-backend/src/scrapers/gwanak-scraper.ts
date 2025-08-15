import * as cheerio from 'cheerio';
import { BaseScraper } from './base-scraper';
import { NoticeListItem } from '../types/notice';
import axios from 'axios';

export class GwanakScraper extends BaseScraper {
  constructor() {
    super('관악구', 'https://www.gwanak.go.kr');
  }

  async scrapeNoticeList(): Promise<NoticeListItem[]> {
    const notices: NoticeListItem[] = [];
    const maxPages = 3;

    for (let page = 1; page <= maxPages; page++) {
      const listUrl = `${this.baseUrl}/site/gwanak/ex/bbsNew/List.do?typeCode=1`;
      const formData = new URLSearchParams();
      formData.append('pageIndex', page.toString());

      const response = await axios.post(listUrl, formData);
      const $ = cheerio.load(response.data);

      $('table.list tbody tr').each((_, el) => {
        const $row = $(el);
        const titleAnchor = $row.find('td').eq(2).find('a');
        const title = titleAnchor.text().trim();

        const bIdxMatch = titleAnchor.attr('onclick')?.match(/doBbsFView\('(\d+)'\)/);
        const bIdx = bIdxMatch?.[1];
        const dateText = $row.find('td').eq(6).text().trim(); // 등록일

        if (title && bIdx && dateText) {
          notices.push({
            title,
            url: `${this.baseUrl}/site/gwanak/ex/bbsNew/View.do?bIdx=${bIdx}&typeCode=1`,
            publishDate: this.parseDate(dateText),
            category: '고시/공고'
          });
        }
      });

      console.log(`📋 관악구 ${page}페이지에서 ${notices.length}건`);
      await this.sleep(100);
    }

    // 중복 제거
    return Array.from(new Map(notices.map(n => [n.url, n])).values());
  }

  async scrapeNoticeDetail(url: string): Promise<string> {
    const html = await this.fetchWithRetry(url);
    const $ = cheerio.load(html);

    const contentElement = $('.view_contents .txt-area pre');
    if (contentElement.length > 0) {
      return this.cleanText(contentElement.text());
    }

    return $('title').text() || '본문을 찾을 수 없습니다';
  }

  parseDate(dateString: string): string {
    const cleaned = dateString.trim().replace(/\D/g, '');
    if (cleaned.length === 8) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}T00:00:00.000Z`;
    }
    console.warn(`날짜 파싱 실패: ${dateString}`);
    return new Date().toISOString();
  }
}
