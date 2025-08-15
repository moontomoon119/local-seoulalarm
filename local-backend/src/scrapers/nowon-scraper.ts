import * as cheerio from 'cheerio';
import { BaseScraper } from './base-scraper';
import { NoticeListItem } from '../types/notice';

export class NowonScraper extends BaseScraper {
  constructor() {
    super('노원구', 'https://www.nowon.kr');
  }

  async scrapeNoticeList(): Promise<NoticeListItem[]> {
    const notices: NoticeListItem[] = [];
    const maxPages = 3;

    for (let page = 1; page <= maxPages; page++) {
      const url = `${this.baseUrl}/www/user/bbs/BD_selectBbsList.do?q_bbsCode=1003&q_clCode=0&q_estnColumn1=11&q_ntceSiteCode=11&q_currPage=${page}`;
      const html = await this.fetchWithRetry(url);
      const $ = cheerio.load(html);

      $('table.table-list tbody tr').each((_, el) => {
        const $row = $(el);
        const title = $row.find('.cell-subject a').text().trim();
        const jsOnclick = $row.find('.cell-subject a').attr('href') || '';
        const match = jsOnclick.match(/opView\('(\d+)'\)/);
        const id = match?.[1];
        const date = $row.find('.cell-date').text().trim();

        if (title && id && date) {
            notices.push({
            title,
            url: `${this.baseUrl}/www/user/bbs/BD_selectBbs.do?q_bbsCode=1003&q_bbscttSn=${id}&q_estnColumn1=11&q_ntceSiteCode=11`,
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
    const content = $('.article-body .txt .se-contents')
      .text()
      .replace(/\s{2,}/g, '\n')
      .trim();

    return this.cleanText(content);
  }

  parseDate(dateStr: string): string {
    return new Date(dateStr.trim()).toISOString();
  }
}
