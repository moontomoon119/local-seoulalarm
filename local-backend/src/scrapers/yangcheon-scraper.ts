import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseScraper } from './base-scraper';
import { NoticeListItem } from '../types/notice';
import * as https from 'https'; // https 모듈 임포트

// SSL 인증서 검증을 비활성화하는 https 에이전트 생성 (보안 경고: 사용에 주의)
const agent = new https.Agent({
  rejectUnauthorized: false
});

export class YangcheonScraper extends BaseScraper {
  constructor() {
    super('양천구', 'https://www.yangcheon.go.kr');
  }

  async scrapeNoticeList(): Promise<NoticeListItem[]> {
    const notices: NoticeListItem[] = [];
    const maxPages = 3;

    for (let page = 1; page <= maxPages; page++) {
      const formData = new URLSearchParams();
      formData.append('pageIndex', page.toString());

      try { // try-catch 블록 추가하여 오류 발생 시에도 다음 페이지 또는 종료 처리
        const response = await axios.post(
          `${this.baseUrl}/site/yangcheon/ex/seol/seolCollectList.do`,
          formData,
          {
            httpsAgent: agent // 생성한 에이전트 사용
          }
        );
        const $ = cheerio.load(response.data);

        $('article.board-row table.basic-list tbody tr').each((_, el) => {
          const $row = $(el);
          const seqMatch = $row.find('a').attr('href')?.match(/doSeolContentDeailView\('(\d+)'\)/);
          const seq = seqMatch?.[1];

          const title = $row.find('td.subject a').text().trim();
          const date = $row.find('td').last().text().trim();

          if (seq && title && date) {
            notices.push({
              title,
              url: `${this.baseUrl}/site/yangcheon/ex/seol/seolContentDeailView.do?not_ancmt_mgt_no=${seq}`,
              publishDate: this.parseDate(date),
              category: '고시공고',
            });
          }
        });

        console.log(`📋 양천구 ${page}페이지 처리 완료. 현재까지 ${notices.length}건 수집.`); // 로그 메시지 수정
        await this.sleep(100); // 과도한 요청 방지를 위한 딜레이 유지

      } catch (error: any) {
        console.error(`⚠️ 양천구 ${page}페이지 스크래핑 중 오류 발생: ${error.message}`);
        // 오류 발생 시 해당 페이지만 건너뛰거나, 치명적인 오류면 반복 중단 등을 결정할 수 있습니다.
        // 여기서는 일단 다음 페이지로 넘어가도록 처리합니다. 필요에 따라 로직 수정하세요.
      }
    }

    return notices;
  }

  // scrapeNoticeDetail 메소드에도 fetchWithRetry 내부에서 axios 호출 시 동일하게 agent를 전달해야 합니다.
  // fetchWithRetry 함수 구현 방법에 따라 다를 수 있습니다.
  // 예를 들어 fetchWithRetry가 axios를 사용한다면:
   async scrapeNoticeDetail(url: string): Promise<string> {
     // fetchWithRetry 내부 또는 fetchWithRetry 함수 자체를 수정하여 agent를 전달해야 함
     // 예: await this.fetchWithRetry(url, 3, 'utf-8', { httpsAgent: agent });
     const html = await this.fetchWithRetry(url, 3, 'utf-8'); // fetchWithRetry 구현 방법에 따라 다름
     const $ = cheerio.load(html);
     const contentHtml = $('.txt-area').html() || '';
     return this.cleanText(cheerio.load(contentHtml).text());
   }


  parseDate(dateString: string): string {
    const [yyyy, mm, dd] = dateString.trim().split('-');
    if (yyyy && mm && dd) {
      return `${yyyy}-${mm}-${dd}T00:00:00.000Z`;
    }
    console.warn(`⚠️ 날짜 파싱 실패: ${dateString}`);
    return new Date().toISOString(); // 실패 시 현재 시간 반환
  }
}