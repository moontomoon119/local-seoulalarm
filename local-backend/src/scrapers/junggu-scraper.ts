import { BaseScraper } from './base-scraper';
import { NoticeListItem } from '../types/notice';
import * as cheerio from 'cheerio';
import axios from 'axios';

export class JungguScraper extends BaseScraper {
  constructor() {
    super('중구', 'https://www.junggu.seoul.kr');
  }

  async scrapeNoticeList(): Promise<NoticeListItem[]> {
    const notices: NoticeListItem[] = [];
    const maxPages = 1;

    for (let page = 1; page <= maxPages; page++) {
      const url = `${this.baseUrl}/content.do?cmsid=14232&page=${page}`;
      const html = await this.fetchWithRetry(url, 3, 'utf-8');
      const $ = cheerio.load(html);

      $('div.board_list table tbody tr').each((_, el) => {
        const $row = $(el);
        const titleLink = $row.find('td.tal a');
        const title = titleLink.text().trim();
        const href = titleLink.attr('href') || '';
        const cidMatch = href.match(/cid=(\d+)/);
        const periodText = $row.find('td').eq(2).text().trim(); // 공고기간

        if (cidMatch && title) {
          const publishDate = this.parseDate(periodText.split('~')[0].trim());

          notices.push({
            title,
            url: `${this.baseUrl}/content.do?cmsid=14232&mode=view&cid=${cidMatch[1]}`,
            publishDate,
            category: '고시공고',
          });
        }
      });

      console.log(`📋 중구 ${page}페이지에서 ${notices.length}건`);
      await this.sleep(500);
    }

    return Array.from(new Map(notices.map(n => [n.url, n])).values());
  }

  async scrapeNoticeDetail(url: string): Promise<string> {
    const html = await this.fetchWithRetry(url, 3, 'utf-8');
    const $ = cheerio.load(html);
    const contentHtml = $('td.article_body').html() || '';
    return this.cleanText(cheerio.load(contentHtml).text());
  }

  parseDate(dateString: string): string {
    const [yyyy, mm, dd] = dateString.replace(/\./g, '-').replace(/\//g, '-').trim().split('-');
    if (yyyy && mm && dd) {
      return `${yyyy}-${mm}-${dd}T00:00:00.000Z`;
    }
    console.warn(`날짜 파싱 실패: ${dateString}`);
    return new Date().toISOString();
  }
}
