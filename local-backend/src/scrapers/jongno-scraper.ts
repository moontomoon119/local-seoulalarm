// src/scrapers/jongno.ts
import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseScraper } from './base-scraper';
import { NoticeListItem } from '../types/notice';

export class JongnoScraper extends BaseScraper {
  constructor() {
    super('종로구', 'https://www.jongno.go.kr');
  }

  async scrapeNoticeList(): Promise<NoticeListItem[]> {
    const notices: NoticeListItem[] = [];
    const maxPages = 2;

    for (let page = 1; page <= maxPages; page++) {
      const formData = new URLSearchParams({
        bbsId: 'BBSMSTR_000000000271',
        menuNo: '1756',
        menuId: '1756',
        pageIndex: String(page),
      });

      const response = await axios.post(
        `${this.baseUrl}/portal/bbs/selectBoardList.do`,
        formData
      );

      const $ = cheerio.load(response.data);

      $('table.list_type01 tbody tr').each((_, el) => {
        const $row = $(el);
        const onclick = $row.find('td.sj a').attr('href') || '';
        const match = onclick.match(/viewMove\('(\d+)'\)/);
        const title = $row.find('td.sj').text().trim();
        const date = $row.find('td.reg').text().trim();

        if (match) {
          const nttId = match[1];
          const url = `${this.baseUrl}/portal/bbs/selectBoardArticle.do?bbsId=BBSMSTR_000000000271&menuNo=1756&menuId=1756&nttId=${nttId}`;

          notices.push({
            title,
            url,
            publishDate: this.parseDate(date),
            category: '고시공고',
          });
        }
      });

      console.log(`📋 종로구 ${page}페이지에서 ${notices.length}건`);
      await this.sleep(100);
    }

    return notices;
  }

  async scrapeNoticeDetail(url: string): Promise<string> {
    const html = await this.fetchWithRetry(url, 3, 'utf-8'); // 종로는 UTF-8
    const $ = cheerio.load(html);
    const content = $('td[colspan="4"].output').html() || '';
    return this.cleanText(cheerio.load(content).text());
  }

  parseDate(dateString: string): string {
    // e.g. 2025-05-15 → 2025-05-15T00:00:00.000Z
    const date = dateString.trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? `${date}T00:00:00.000Z`
      : new Date().toISOString();
  }
}
