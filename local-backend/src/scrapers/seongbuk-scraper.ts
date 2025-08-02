import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseScraper } from './base-scraper';
import { NoticeListItem } from '../types/notice';

export class SeongbukScraper extends BaseScraper {
  constructor() {
    super('성북구', 'https://www.sb.go.kr');
  }

  async scrapeNoticeList(): Promise<NoticeListItem[]> {
    const notices: NoticeListItem[] = [];
    const url = `${this.baseUrl}/www/selectEminwonList.do?key=6977`;

    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    $('table.p-table tbody tr').each((_, el) => {
      const $row = $(el);
      const titleAnchor = $row.find('td.p-subject a');
      const href = titleAnchor.attr('href') || '';
      const title = titleAnchor.text().trim();
      const publishDate = $row.find('td').last().text().trim();
      const seqMatch = href.match(/notAncmtMgtNo=(\d+)/);

      if (seqMatch && title) {
        const fullUrl = `${this.baseUrl}/www/selectEminwonView.do?key=6977&notAncmtMgtNo=${seqMatch[1]}`;
        notices.push({
          title,
          url: fullUrl,
          publishDate: this.parseDate(publishDate),
          category: '고시공고',
        });
      }
    });

    console.log(`📋 성북구에서 ${notices.length}건`);
    return notices;
  }

  async scrapeNoticeDetail(url: string): Promise<string> {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const contentHtml = $('td').first().html() || '';

    return this.cleanText(
      cheerio.load(contentHtml).text().replace(/\u00a0/g, ' ')
    );
  }

  parseDate(dateString: string): string {
    // e.g., "2025-05-16"
    const cleaned = dateString.trim();
    const [yyyy, mm, dd] = cleaned.split('-');
    if (yyyy && mm && dd) {
      return `${yyyy}-${mm}-${dd}T00:00:00.000Z`;
    }
    return new Date().toISOString();
  }
}
