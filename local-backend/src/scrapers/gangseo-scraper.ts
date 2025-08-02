import * as cheerio from 'cheerio';
import { BaseScraper } from './base-scraper';
import { NoticeListItem } from '../types/notice';

export class GangseoScraper extends BaseScraper {
  constructor() {
    super('강서구', 'https://www.gangseo.seoul.kr');
  }

  async scrapeNoticeList(): Promise<NoticeListItem[]> {
    const notices: NoticeListItem[] = [];
    const maxPages = 1;

    for (let page = 1; page <= maxPages; page++) {
      const listUrl = `${this.baseUrl}/gs040301?curPage=${page}`;
      const html = await this.fetchWithRetry(listUrl);
      const $ = cheerio.load(html);

      $('table.gosi-list-table tbody tr').each((_, element) => {
        const $row = $(element);
        const columns = $row.find('td');

        if (columns.length >= 5) {
          const titleElement = $(columns[1]).find('a');
          const title = titleElement.text().trim();
          const mgtNo = $row.find('input[name="mgtNo"]').val();
          const dateString = $(columns[4]).text().trim();

          if (title && mgtNo && dateString) {
            notices.push({
              title: title,
              url: `${this.baseUrl}/gs040301/view?mgtNo=${mgtNo}`,
              publishDate: this.parseDate(dateString),
              category: '고시/공고'
            });
          }
        }
      });

      console.log(`📋 Found ${notices.length} notices on page ${page}`);
      await this.sleep(100);
    }

    const unique = Array.from(new Map(notices.map(n => [n.url, n])).values());
    return unique;
  }

  async scrapeFirstPageList(): Promise<NoticeListItem[]> {
    const listUrl = `${this.baseUrl}/gs040301?curPage=1`;
    const html = await this.fetchWithRetry(listUrl);
    const $ = cheerio.load(html);
    const notices: NoticeListItem[] = [];

    $('table.gosi-list-table tbody tr').each((_, element) => {
      const $row = $(element);
      const columns = $row.find('td');

      if (columns.length >= 5) {
        const titleElement = $(columns[1]).find('a');
        const title = titleElement.text().trim();
        const mgtNo = $row.find('input[name="mgtNo"]').val();
        const dateString = $(columns[4]).text().trim();

        if (title && mgtNo && dateString) {
          notices.push({
            title: title,
            url: `${this.baseUrl}/gs040301/view?mgtNo=${mgtNo}`,
            publishDate: this.parseDate(dateString),
            category: '고시/공고'
          });
        }
      }
    });

    const unique = Array.from(new Map(notices.map(n => [n.url, n])).values());
    return unique;
  }

  async scrapeAdditionalPagesList(): Promise<NoticeListItem[]> {
    const notices: NoticeListItem[] = [];

    for (let page = 2; page <= 3; page++) {
      const listUrl = `${this.baseUrl}/gs040301?curPage=${page}`;
      const html = await this.fetchWithRetry(listUrl);
      const $ = cheerio.load(html);

      $('table.gosi-list-table tbody tr').each((_, element) => {
        const $row = $(element);
        const columns = $row.find('td');

        if (columns.length >= 5) {
          const titleElement = $(columns[1]).find('a');
          const title = titleElement.text().trim();
          const mgtNo = $row.find('input[name="mgtNo"]').val();
          const dateString = $(columns[4]).text().trim();

          if (title && mgtNo && dateString) {
            notices.push({
              title: title,
              url: `${this.baseUrl}/gs040301/view?mgtNo=${mgtNo}`,
              publishDate: this.parseDate(dateString),
              category: '고시/공고'
            });
          }
        }
      });

      console.log(`📋 Found notices on page ${page}: ${notices.length}`);
      await this.sleep(100);
    }

    const unique = Array.from(new Map(notices.map(n => [n.url, n])).values());
    return unique;
  }

  async scrapeNoticeDetail(url: string): Promise<string> {
  const html = await this.fetchWithRetry(url);
  const $ = cheerio.load(html);

  // 본문 추출: <div class="view-content"> 내부 <div class="gosi-con"> > <pre>
  const contentEl = $('.view-content .gosi-con pre');

  if (contentEl.length > 0) {
    const text = contentEl.text().trim();

    return this.cleanText(text);
  }

  // fallback: 전체 HTML 탐색
  const fallbackHtml =
    $('.view-content').html() ||
    $('#content').html() ||
    $('body').html() ||
    '';

  return this.cleanText(
    fallbackHtml
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<style[^>]*>.*?<\/style>/gis, '')
      .replace(/<[^>]+>/g, ' ')
  );
}


  parseDate(dateString: string): string {
    const cleaned = dateString.replace(/\s+/g, '').trim();

    const patterns = [
      /(\d{4})-(\d{1,2})-(\d{1,2})/,
      /(\d{4})\.(\d{1,2})\.(\d{1,2})/,
      /(\d{4})\/(\d{1,2})\/(\d{1,2})/
    ];

    for (const pattern of patterns) {
      const match = cleaned.match(pattern);
      if (match) {
        const [, year, month, day] = match;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00.000Z`;
      }
    }

    console.warn(`Failed to parse date: ${dateString}`);
    return new Date().toISOString();
  }
}
