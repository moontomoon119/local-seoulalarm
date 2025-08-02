import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseScraper } from './base-scraper';
import { NoticeListItem } from '../types/notice';

export class SeongdongScraper extends BaseScraper {
  constructor() {
    super('성동구', 'https://www.sd.go.kr');
  }

  async scrapeNoticeList(): Promise<NoticeListItem[]> {
    const notices: NoticeListItem[] = [];
    const page = 1;

    const listUrl = `${this.baseUrl}/main/selectBbsNttList.do?bbsNo=184&key=1473&pageIndex=${page}`;
    const html = await this.fetchWithRetry(listUrl);
    const $ = cheerio.load(html);

    $('table.p-table tbody tr').each((_, el) => {
      const $row = $(el);

      const titleEl = $row.find('td.p-subject a');
      const title = titleEl.text().trim();
      const href = titleEl.attr('href') || '';
      const date = $row.find('td time').attr('datetime') || '';

      const nttNoMatch = href.match(/nttNo=(\d+)/);
      const nttNo = nttNoMatch ? nttNoMatch[1] : null;

      if (nttNo && title) {
        notices.push({
          title,
          url: `${this.baseUrl}/main/selectBbsNttView.do?bbsNo=184&nttNo=${nttNo}&key=1473`,
          publishDate: this.parseDate(date),
          category: '고시공고',
        });
      }
    });

    console.log(`📋 성동구 1페이지에서 ${notices.length}건`);
    return notices;
  }

  async scrapeNoticeDetail(url: string): Promise<string> {
    const html = await this.fetchWithRetry(url);
    const $ = cheerio.load(html);
    const contentHtml = $('.ntt_cn_container').html() || '';
    return this.cleanText(cheerio.load(contentHtml).text());
  }

  parseDate(dateString: string): string {
    if (!dateString) return new Date().toISOString();
    return `${dateString}T00:00:00.000Z`; // ISO 포맷으로 변환
  }
}
