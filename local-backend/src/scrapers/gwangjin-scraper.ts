import * as cheerio from 'cheerio';
import { BaseScraper } from './base-scraper';
import { NoticeListItem } from '../types/notice';
import axios from 'axios';

export class GwangjinScraper extends BaseScraper {
  constructor() {
    super('광진구', 'https://www.gwangjin.go.kr');
  }

  async scrapeNoticeList(): Promise<NoticeListItem[]> {
    const notices: NoticeListItem[] = [];
    const maxPages = 1;

    for (let page = 1; page <= maxPages; page++) {
      const url = `${this.baseUrl}/portal/bbs/B0000003/list.do?menuNo=200192&pageIndex=${page}`;
      const html = await this.fetchWithRetry(url);
      const $ = cheerio.load(html);

      $('.table.m table tbody tr').each((_, el) => {
        const $row = $(el);
        const $link = $row.find('td.tit a');

        const title = $link.text().trim();
        const href = $link.attr('href');
        const fullUrl = href?.startsWith('http') ? href : `${this.baseUrl}${href}`;
        const dateText = $row.find('td').eq(5).text().trim(); // 공고시작일

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

    // 본문은 <dd> 안에 <p>, <span>, <table> 등 다양한 구조가 섞여 있음
    const contentText = $('dd')
      .find('p, span, li, td')
      .map((_, el) => $(el).text())
      .get()
      .join('\n');

    return this.cleanText(contentText);
  }

  parseDate(dateStr: string): string {
    const cleaned = dateStr.replace(/\D/g, '');
    if (cleaned.length === 8) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}T00:00:00.000Z`;
    }
    return new Date().toISOString();
  }
}
