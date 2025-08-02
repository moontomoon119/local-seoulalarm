import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseScraper } from './base-scraper';
import { NoticeListItem } from '../types/notice';

export class YeongdeungpoScraper extends BaseScraper {
  constructor() {
    super('영등포구', 'https://www.ydp.go.kr');
  }

  async scrapeNoticeList(): Promise<NoticeListItem[]> {
    const notices: NoticeListItem[] = [];
    const pageCount = 1; // 원하는 페이지 수 조절

    for (let page = 1; page <= pageCount; page++) {
      const url = `${this.baseUrl}/www/selectEminwonList.do?menuFlag=01&key=2851&pageIndex=${page}`;
      const html = await this.fetchWithRetry(url, 3, 'utf-8'); // ✅ UTF-8로 명시
      const $ = cheerio.load(html);

      $('table.p-table tbody tr').each((_, el) => {
        const $row = $(el);
        const titleAnchor = $row.find('td.p-subject a');
        const title = titleAnchor.text().trim();
        const href = titleAnchor.attr('href');
        const date = $row.find('td').eq(3).text().trim();

        const match = href?.match(/notAncmtMgtNo=(\d+)/);
        if (match && title) {
          const noticeId = match[1];
          notices.push({
            title,
            url: `${this.baseUrl}/www/selectEminwonView.do?menuFlag=01&notAncmtMgtNo=${noticeId}&key=2851`,
            publishDate: this.parseDate(date),
            category: '고시공고',
          });
        }
      });

      console.log(`📋 영등포구 ${page}페이지에서 ${notices.length}건`);
      await this.sleep(100);
    }

    return Array.from(new Map(notices.map(n => [n.url, n])).values());
  }

  async scrapeNoticeDetail(url: string): Promise<string> {
    const html = await this.fetchWithRetry(url, 3, 'utf-8');
    const $ = cheerio.load(html);
    const content = $('td.p-table__content[title="내용"]').html() || '';
    return this.cleanText(cheerio.load(content).text());
  }

  parseDate(dateString: string): string {
    const cleaned = dateString.replace(/\./g, '-').trim();
    const [yyyy, mm, dd] = cleaned.split('-');
    if (yyyy && mm && dd) {
      return `${yyyy}-${mm}-${dd}T00:00:00.000Z`;
    }
    console.warn(`⚠️ 날짜 파싱 실패: ${dateString}`);
    return new Date().toISOString();
  }
}
