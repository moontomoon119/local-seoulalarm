import * as cheerio from 'cheerio';
import { BaseScraper } from './base-scraper';
import { NoticeListItem } from '../types/notice';

export class JungnangScraper extends BaseScraper {
  constructor() {
    super('중랑구', 'https://www.jungnang.go.kr');
  }

  async scrapeNoticeList(): Promise<NoticeListItem[]> {
    const notices: NoticeListItem[] = [];
    const maxPages = 3;

    for (let page = 1; page <= maxPages; page++) {
      const url = `${this.baseUrl}/portal/bbs/list/B0000117.do?menuNo=200475&pageIndex=${page}`;
      const html = await this.fetchWithRetry(url);
      const $ = cheerio.load(html);

      $('tr.noticeTitlte').each((_, el) => {
        const $tr = $(el);
        const $a = $tr.find('td.tit a');
        const title = $a.text().trim();
        const href = $a.attr('href');
        const dateText = $tr.find('td').eq(4).text().trim();

        if (href && title && dateText) {
          notices.push({
            title,
            url: this.absoluteUrl(href),
            publishDate: this.parseDate(dateText),
            category: '고시/공고',
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

    const contentHtml = $('#dbdata').html() || '';
    const text = this.cleanText(cheerio.load(contentHtml).text());
    return text;
  }

  parseDate(dateStr: string): string {
    const parsed = new Date(dateStr.trim());
    return isNaN(parsed.getTime()) ? '' : parsed.toISOString();
  }
}
