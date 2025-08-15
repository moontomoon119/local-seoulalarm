import * as cheerio from 'cheerio';
import { BaseScraper } from './base-scraper';
import { NoticeListItem } from '../types/notice';
import axios from 'axios';
import iconv from 'iconv-lite';
import { Notice } from '../types/notice';

export class SeodaemunScraper extends BaseScraper {
  constructor() {
    super('서대문구', 'https://www.sdm.go.kr');
  }

async scrapeNoticeList(): Promise<NoticeListItem[]> {
  const notices: NoticeListItem[] = [];
  const maxPages = 3;

  for (let page = 1; page <= maxPages; page++) {
    const formData = new URLSearchParams();
    formData.append('mode', 'list');
    formData.append('cp', page.toString());
    formData.append('sdmBoardConfSeq', '82');

    const response = await axios.post(`${this.baseUrl}/news/notice/notice.do`, formData, {
      responseType: 'arraybuffer', // ✅ 중요!
    });

    const decodedHtml = iconv.decode(Buffer.from(response.data), 'euc-kr');
    const $ = cheerio.load(decodedHtml);

    $('table.boardList tbody tr').each((_, el) => {
      const $row = $(el);
      const titleAnchor = $row.find('td.aleft a');
      const onclick = titleAnchor.attr('href') || '';
      const seqMatch = onclick.match(/goView\('(\d+)'\)/);
      const title = titleAnchor.text().trim();
      const date = $row.find('td').eq(3).text().trim(); // 등록일

      if (seqMatch && title) {
        notices.push({
          title,
          url: `${this.baseUrl}/news/notice/notice.do?mode=view&sdmBoardConfSeq=82&sdmBoardSeq=${seqMatch[1]}`,
          publishDate: this.parseDate(date),
          category: '고시공고',
        });
      }
    });

    console.log(`📋 서대문구 ${page}페이지에서 ${notices.length}건`);
    await this.sleep(100);
  }

  return Array.from(new Map(notices.map(n => [n.url, n])).values());
}

async scrapeNoticeDetail(url: string): Promise<string> {
  try {
    const urlObj = new URL(url);
    const seq = urlObj.searchParams.get('sdmBoardSeq');
    if (!seq) throw new Error('게시글 ID가 없습니다');

    const formData = new URLSearchParams();
    formData.append('mode', 'view');
    formData.append('sdmBoardConfSeq', '82');
    formData.append('sdmBoardSeq', seq);

    const response = await axios.post(`${this.baseUrl}/news/notice/notice.do`, formData, {
      responseType: 'arraybuffer', // ✅ 꼭 설정
    });

    const decodedHtml = iconv.decode(Buffer.from(response.data), 'euc-kr');
    const $ = cheerio.load(decodedHtml);
    const contentHtml = $('#viewCon').html() || '';

    return this.cleanText(cheerio.load(contentHtml).text());
  } catch (error) {
    console.error(`🔴 서대문구 상세 스크래핑 오류 (URL: ${url}):`, error instanceof Error ? error.message : String(error));
    return `[서대문구 공지사항 본문을 가져오지 못했습니다]`;
  }
}

  parseDate(dateString: string): string {
    // 예: 2025.05.15 → ISO 포맷으로 변환
    const cleaned = dateString.replace(/\./g, '-').trim();
    const [yyyy, mm, dd] = cleaned.split('-');
    if (yyyy && mm && dd) {
      return `${yyyy}-${mm}-${dd}T00:00:00.000Z`;
    }
    console.warn(`날짜 파싱 실패: ${dateString}`);
    return new Date().toISOString();
  }

  // 공지사항 유효성 검사 오버라이드 - 내용이 없어도 유효하게 처리
  protected validateNotice(notice: Notice): boolean {
    return !!(
      notice.title &&
      notice.url &&
      notice.publishDate &&
      notice.district
      // content 체크 제외됨
    );
  }
}
