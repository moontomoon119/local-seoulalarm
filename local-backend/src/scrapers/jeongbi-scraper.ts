import * as cheerio from 'cheerio';
import { BaseScraper } from './base-scraper';
import { NoticeListItem } from '../types/notice';

export class JeongbiScraper extends BaseScraper {
  constructor() {
    super('정비몽땅', 'https://cleanup.seoul.go.kr');
  }

  async scrapeNoticeList(): Promise<NoticeListItem[]> {
    const notices: NoticeListItem[] = [];
    const maxPages = 1;

    for (let page = 1; page <= maxPages; page++) {
      const url = `${this.baseUrl}/cleanup/bbs/lscr.do?bbsClCode=1000&cpage=${page}&pageSize=10`;
      const html = await this.fetchWithRetry(url);
      const $ = cheerio.load(html);

      $('ul.board-list-ul > li').each((_, el) => {
        const $li = $(el);
        // 공지는 <p class="s-txt notice"> 로 식별 가능
        if ($li.find('.s-txt.notice').length > 0) return;

        const $a = $li.find('a');
        const title = $a.find('h3.b-tit').text().trim();
        const href = $a.attr('href');
        const dateText = $li.find('.left-box span')
          .filter((_, el) => $(el).text().includes('등록일'))
          .text()
          .replace('등록일 :', '')
          .trim();

        const url = href ? this.absoluteUrl(href) : null;

        if (title && url && dateText) {
          notices.push({
            title,
            url,
            publishDate: this.parseDate(dateText),
            category: '정비사업 공고',
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
  
    const contentHtml = $('.board-view-contants').html() || '';
    
    // 새 cheerio 인스턴스 생성 및 함수로 사용
    const $content = cheerio.load(contentHtml);
    const contentText = $content('*').text();
    
    const text = this.cleanText(contentText);
    return text;
  }

  parseDate(dateStr: string): string {
    const parsed = new Date(dateStr.trim());
    return isNaN(parsed.getTime()) ? '' : parsed.toISOString();
  }
}