import { BaseScraper } from './base-scraper';
import { NoticeListItem } from '../types/notice';
import * as cheerio from 'cheerio';
import axios from 'axios';

export class SongpaScraper extends BaseScraper {
  constructor() {
    super('송파구', 'https://www.songpa.go.kr');
  }

  async scrapeNoticeList(): Promise<NoticeListItem[]> {
    const baseListUrl = `${this.baseUrl}/www/selectGosiList.do`;
    const maxPages = 1;
    const notices: NoticeListItem[] = [];

    for (let page = 1; page <= maxPages; page++) {
      const params = {
        key: '2776',
        pageIndex: page.toString(),
        searchCnd: 'all',
        searchKrwd: ''
      };

      const res = await axios.get(baseListUrl, { params });
      const $ = cheerio.load(res.data);

      $('table.p-table tbody tr').each((_, el) => {
        const $row = $(el);
        const titleEl = $row.find('td.p-subject a');
        const title = titleEl.text().trim();
        const href = titleEl.attr('href');
        const date = $row.find('td').eq(4).text().trim();

        const match = href?.match(/not_ancmt_mgt_no=(\d+)/);
        const noticeId = match ? match[1] : null;

        if (noticeId && title) {
          const url = `${this.baseUrl}/www/selectGosiData.do?not_ancmt_mgt_no=${noticeId}&key=2776`;
          notices.push({
            title,
            url,
            publishDate: this.parseDate(date),
            category: '고시공고'
          });
        }
      });

      console.log(`📋 송파구 ${page}페이지에서 ${notices.length}건`);
      await this.sleep(300);
    }

    return notices;
  }

  async scrapeNoticeDetail(url: string): Promise<string> {
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);

    const content = $('pre').text().trim();
    return this.cleanText(content);
  }

  parseDate(dateString: string): string {
    // 예: 2025-05-16 → ISO 포맷
    const cleaned = dateString.trim();
    const [yyyy, mm, dd] = cleaned.split('-');
    if (yyyy && mm && dd) {
      return `${yyyy}-${mm}-${dd}T00:00:00.000Z`;
    }
    return new Date().toISOString();
  }
}
