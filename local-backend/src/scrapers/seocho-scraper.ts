import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import { BaseScraper } from './base-scraper';
import { NoticeListItem } from '../types/notice';

export class SeochoScraper extends BaseScraper {
  constructor() {
    super('서초구', 'https://eminwon.seocho.go.kr');
  }

  // 목록 수집 시 페이지 정보도 함께 저장
  async scrapeNoticeList(): Promise<NoticeListItem[]> {
    const noticeItems: NoticeListItem[] = [];
    const maxPages = 3;

    console.log('🔍 서초구 스크래핑 시작...');

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      for (let page = 1; page <= maxPages; page++) {
        console.log(`📄 서초구 페이지 ${page} 처리 중...`);
        
        const pageObj = await browser.newPage();
        
        // 네비게이션 타임아웃 설정
        pageObj.setDefaultNavigationTimeout(60000);
        
        // 유저 에이전트 설정 및 추가 헤더 설정
        await pageObj.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await pageObj.setExtraHTTPHeaders({
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
          'Referer': 'https://eminwon.seocho.go.kr/',
          'Connection': 'keep-alive',
          'Cache-Control': 'max-age=0'
        });

        // 서초구 고시공고 페이지 URL - 직접 JSP 접근
        const targetUrl = 'https://eminwon.seocho.go.kr/emwp/jsp/ofr/OfrNotAncmtL.jsp?not_ancmt_se_code=01,04';
        console.log(`🌐 URL에 접속 중: ${targetUrl}`);
        
        await pageObj.goto(targetUrl, { waitUntil: 'networkidle2' });
        
        // 페이지 로딩 대기
        console.log('⏳ 페이지 로딩을 위해 3초 대기 중...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // JavaScript 실행 완료 대기
        await pageObj.waitForFunction(() => {
          return document.readyState === 'complete';
        }, { timeout: 10000 });

        // 페이지가 1보다 크면 해당 페이지로 이동
        if (page > 1) {
          try {
            console.log(`📄 페이지 ${page}로 이동 중...`);
            await pageObj.evaluate((pageNum) => {
              const pageLink = document.querySelector(`a[onclick*="document.form1.pageIndex.value=${pageNum};goPage()"]`) as HTMLElement;
              if (pageLink) {
                pageLink.click();
              } else {
                throw new Error(`페이지 ${pageNum} 링크를 찾을 수 없습니다`);
              }
            }, page);
            
            // 페이지 이동 후 충분한 대기 시간
            console.log('⏳ 페이지 이동 완료 대기 중...');
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // 페이지 로딩 완료 대기
            await pageObj.waitForFunction(() => {
              return document.readyState === 'complete';
            }, { timeout: 10000 });
            
            // 테이블이 로드될 때까지 대기
            await pageObj.waitForSelector('table', { timeout: 5000 });
            
          } catch (error) {
            console.log(`❌ 페이지 ${page}로 이동 실패. 더 이상 페이지가 없을 수 있습니다.`);
            await pageObj.close();
            break;
          }
        }
        
        let html;
        try {
          html = await pageObj.content();
          console.log('📝 HTML 가져오기 성공');
        } catch (contentError) {
          console.log(`❌ HTML 가져오기 실패: ${contentError}`);
          await pageObj.close();
          break;
        }
        
        const $ = cheerio.load(html);
        
        // 서초구 HTML 구조에 맞는 공지사항 행 선택
        // 동작구와 동일한 구조: bgcolor가 #FFFFFF 또는 #F0F9FB인 tr 요소들을 찾음
        const noticeRows = $('tr[bgcolor="#FFFFFF"], tr[bgcolor="#F0F9FB"]');
        console.log(`📊 발견된 공지사항 행 수: ${noticeRows.length}`);
        
        if (noticeRows.length === 0) {
          console.log('⚠️ 공지사항을 찾을 수 없습니다.');
        }
        
        noticeRows.each((index, el) => {
          console.log(`📋 서초구 행 ${index + 1} 처리 중...`);
          const $row = $(el);
          
          const tds = $row.find('td');
          if (tds.length < 7) {
            console.log(`  - td 개수가 부족합니다 (${tds.length}/7)`);
            return;
          }
          
          // 서초구 HTML 구조에 맞게 데이터 추출
          const number = tds.eq(0).text().trim();
          const noticeNumber = tds.eq(1).text().trim();
          const title = tds.eq(2).text().trim();
          const department = tds.eq(3).text().trim();
          const registerDate = tds.eq(4).text().trim();
          const period = tds.eq(5).text().trim();
          const views = tds.eq(6).text().trim();
          
          console.log(`  - 번호: ${number}`);
          console.log(`  - 고시공고번호: ${noticeNumber}`);
          console.log(`  - 제목: ${title}`);
          console.log(`  - 담당부서: ${department}`);
          console.log(`  - 등록일: ${registerDate}`);
          console.log(`  - 게재기간: ${period}`);
          console.log(`  - 조회수: ${views}`);
          
          // onclick 속성에서 ID 추출
          const firstLink = tds.eq(1).find('a');
          const onclick = firstLink.attr('onclick') || '';
          console.log(`  - onclick: ${onclick}`);
          
          // searchDetail('41410') 형태에서 ID 추출
          const idMatch = onclick.match(/searchDetail\(['"](\d+)['"]\)/);
          let noticeId = '';
          if (idMatch && idMatch[1]) {
            noticeId = idMatch[1];
            console.log(`  - 추출된 ID: ${noticeId}`);
          }
          
          if (title && noticeId && registerDate) {
            // 상세 페이지 URL 구성
            const detailUrl = `https://eminwon.seocho.go.kr/emwp/gov/mogaha/ntis/web/ofr/action/OfrAction.do?method=selectOfrNotAncmtRegst&not_ancmt_mgt_no=${noticeId}`;
            
            noticeItems.push({
              title: title,
              url: detailUrl,
              publishDate: this.parseDate(registerDate),
              category: department || '고시/공고',
              // 페이지 정보 추가
              pageNumber: page,
              noticeId: noticeId
            } as any);
            console.log('  ✅ 공지사항 항목이 추가되었습니다.');
          } else {
            console.log('  ❌ 필수 정보가 누락되어 항목을 추가하지 않았습니다.');
            console.log(`     title: ${!!title}, noticeId: ${!!noticeId}, date: ${!!registerDate}`);
          }
        });
        
        await pageObj.close();
        
        // 수집된 항목이 없으면 중단
        if (noticeRows.length === 0) {
          console.log('❌ 더 이상 데이터가 없습니다.');
          break;
        }
      }
      
    } catch (error) {
      console.error('🚨 서초구 스크래핑 중 오류 발생:', error);
    } finally {
      await browser.close();
      console.log('🔒 브라우저 세션 종료');
    }

    console.log(`🔢 서초구 총 스크래핑된 공지사항: ${noticeItems.length}개`);
    return noticeItems;
  }

  async scrapeNoticeDetail(url: string, pageNumber?: number): Promise<string> {
    console.log(`🔍 서초구 상세 페이지 스크래핑 시작: ${url}`);
    
    // URL에서 게시물 ID 추출
    const noticeIdMatch = url.match(/not_ancmt_mgt_no=([^&]+)/);
    const noticeId = noticeIdMatch ? noticeIdMatch[1] : 'unknown';
    
    console.log(`🔑 추출된 공지사항 ID: ${noticeId}, 페이지: ${pageNumber || 'unknown'}`);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    try {
      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(30000);
      
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      await page.setExtraHTTPHeaders({
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://eminwon.seocho.go.kr/',
        'Connection': 'keep-alive',
        'Cache-Control': 'max-age=0'
      });
      
      // 1단계: 먼저 목록 페이지로 이동
      console.log('🔄 1단계: 목록 페이지에 접속 중...');
      const listUrl = 'https://eminwon.seocho.go.kr/emwp/jsp/ofr/OfrNotAncmtL.jsp?not_ancmt_se_code=01,04';
      await page.goto(listUrl, { waitUntil: 'networkidle2' });
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 2단계: 해당 페이지로 직접 이동 (pageNumber가 있는 경우)
      if (pageNumber && pageNumber > 1) {
        console.log(`🔄 ${pageNumber}페이지로 직접 이동 중...`);
        try {
          await page.evaluate((pageNum) => {
            const pageLink = document.querySelector(`a[onclick*="document.form1.pageIndex.value=${pageNum};goPage()"]`) as HTMLElement;
            if (pageLink) {
              pageLink.click();
            } else {
              throw new Error(`페이지 ${pageNum} 링크를 찾을 수 없습니다`);
            }
          }, pageNumber);
          
          await new Promise(resolve => setTimeout(resolve, 3000));
          await page.waitForFunction(() => document.readyState === 'complete', { timeout: 10000 });
        } catch (pageError) {
          console.log(`❌ 페이지 ${pageNumber}로 이동 실패, 전체 페이지 검색으로 전환`);
        }
      }
      
      // 3단계: 해당 공지사항 링크 찾아서 클릭
      console.log(`🔄 3단계: ID ${noticeId}인 공지사항 링크 찾는 중...`);
      
      const linkClicked = await page.evaluate((targetId) => {
        const links = Array.from(document.querySelectorAll('a[onclick*="searchDetail"]'));
        for (let link of links) {
          const onclick = link.getAttribute('onclick') || '';
          const idMatch = onclick.match(/searchDetail\(['"](\d+)['"]\)/);
          if (idMatch && idMatch[1] === targetId) {
            (link as HTMLElement).click();
            return true;
          }
        }
        return false;
      }, noticeId);
      
      if (!linkClicked) {
        console.log('❌ 해당 ID의 링크를 찾을 수 없습니다.');
        return '';
      }
      
      console.log('✅ 해당 공지사항 링크 클릭 성공');
      
      // 페이지 이동 대기
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const html = await page.content();
      const $ = cheerio.load(html);
      
      // 에러 페이지인지 확인
      const pageTitle = $('title').text();
      if (pageTitle.includes('페이지가 없습니다') || pageTitle.includes('오류') || pageTitle.includes('에러')) {
        console.log('❌ 에러 페이지입니다. 빈 내용을 반환합니다.');
        return '';
      }
      
      // 상세 페이지에서 내용 추출 시도
      let content = '';
      
      // 다양한 선택자로 내용 찾기
      const contentSelectors = [
        'table[summary*="상세"] td',
        '.view_cont',
        '.view_contents', 
        '.bbs_detail_content',
        '.board_view_contents',
        '.board_view_detail',
        'td[class*="content"]',
        'div[class*="content"]',
        '.dbdata_table'
      ];
      
      for (const selector of contentSelectors) {
        const contentEl = $(selector);
        if (contentEl.length && contentEl.text().trim().length > 50) {
          content = contentEl.text().trim();
          console.log(`📄 컨텐츠 발견 (${selector}): ${content.length}자`);
          break;
        }
      }
      
      // 내용을 찾지 못한 경우, 테이블 구조에서 찾기
      if (!content) {
        console.log('⚠️ 일반적인 선택자로 내용을 찾지 못했습니다. 테이블 구조 분석 중...');
        
        // 테이블의 모든 셀 확인
        $('table tr').each((i, row) => {
          const $row = $(row);
          const $cells = $row.find('td');
          
          if ($cells.length > 0) {
            $cells.each((j, cell) => {
              const cellText = $(cell).text().trim();
              // 긴 텍스트이면서 일반적인 라벨이 아닌 경우
              if (cellText.length > 100 && 
                  !cellText.includes('번호') && 
                  !cellText.includes('제목') && 
                  !cellText.includes('등록일') &&
                  !cellText.includes('담당부서') &&
                  !cellText.includes('조회수')) {
                content = cellText;
                console.log(`📄 테이블 셀에서 내용 발견 (행${i}, 셀${j}): ${content.length}자`);
                return false;
              }
            });
            
            if (content) return false; // 외부 루프도 중단
          }
        });
      }
      
      // 여전히 내용이 없으면 모든 텍스트 노드 확인
      if (!content) {
        console.log('⚠️ 모든 방법으로 구조화된 내용을 찾지 못했습니다.');
        const bodyText = $('body').text().trim();
        
        // body 텍스트가 의미있는 길이라면 사용
        if (bodyText.length > 100) {
          content = bodyText;
          console.log(`📄 전체 페이지 텍스트 사용: ${content.length}자`);
        }
      }
      
      console.log(`📋 최종 추출된 내용 길이: ${content.length}자`);
      return content;
      
    } catch (error) {
      console.error('🚨 서초구 상세 페이지 스크래핑 중 오류 발생:', error);
      return '';
    } finally {
      await browser.close();
    }
  }

  // 전체 스크래핑 프로세스를 오버라이드하여 병렬 처리 적용
  async scrapeAll(): Promise<any[]> {
    console.log(`🚀 Starting scrape for ${this.district}...`);
    
    // 1단계: 목록 페이지만 먼저 수집
    const notices = await this.scrapeNoticeList();
    console.log(`📋 Found ${notices.length} notices`);
    
    if (notices.length === 0) {
      return [];
    }

    // 2단계: 상세 페이지를 병렬로 처리
    console.log(`🚀 병렬로 ${notices.length}개 상세 페이지 처리 시작...`);
    
    const concurrency = 5; // 동시 처리 개수
    const results: any[] = [];
    
    // 청크로 나누기
    for (let i = 0; i < notices.length; i += concurrency) {
      const chunk = notices.slice(i, i + concurrency);
      console.log(`📦 청크 ${Math.floor(i/concurrency) + 1}: ${i + 1}-${Math.min(i + concurrency, notices.length)} 처리 중...`);
      
      // 병렬 처리
      const chunkPromises = chunk.map(async (notice, index) => {
        const globalIndex = i + index + 1;
        console.log(`📄 Processing ${globalIndex}/${notices.length}: ${notice.title.substring(0, 30)}...`);
        
        try {
          // 페이지 정보를 함께 전달
          const content = await this.scrapeNoticeDetail(notice.url, (notice as any).pageNumber);
          
          // Notice 형태로 변환
          return {
            title: notice.title,
            url: notice.url,
            publishDate: notice.publishDate,
            category: notice.category,
            district: this.district,
            content: content || ''
          };
        } catch (error) {
          console.error(`❌ ${notice.title} 처리 실패:`, error);
          return {
            title: notice.title,
            url: notice.url,
            publishDate: notice.publishDate,
            category: notice.category,
            district: this.district,
            content: ''
          };
        }
      });
      
      const chunkResults = await Promise.all(chunkPromises);
      results.push(...chunkResults);
      
      // 다음 청크 처리 전 대기 (서버 부하 분산)
      if (i + concurrency < notices.length) {
        console.log(`⏳ 다음 청크 처리를 위해 2초 대기...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log(`✅ 모든 상세 페이지 처리 완료!`);
    return results;
  }

  parseDate(dateStr: string): string {
    console.log(`📅 서초구 날짜 파싱: "${dateStr}"`);
    
    // 공백 정리
    let formattedDate = dateStr.replace(/\s+/g, '').trim();
    
    // YYYY-MM-DD 형식인지 확인
    if (/^\d{4}-\d{2}-\d{2}$/.test(formattedDate)) {
      try {
        const isoDate = new Date(formattedDate).toISOString();
        console.log(`📅 변환된 날짜: "${isoDate}"`);
        return isoDate;
      } catch (e) {
        console.error(`📅 날짜 파싱 오류: ${e}`);
      }
    }
    
    // 다른 형식들 처리
    // YYYY.MM.DD 형식
    formattedDate = formattedDate.replace(/(\d{4})\.(\d{2})\.(\d{2})/, '$1-$2-$3');
    
    // YYYY년MM월DD일 형식
    formattedDate = formattedDate.replace(/(\d{4})년(\d{1,2})월(\d{1,2})일/, (match: string, year: string, month: string, day: string) => {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    });
    
    try {
      const isoDate = new Date(formattedDate).toISOString();
      console.log(`📅 변환된 날짜: "${isoDate}"`);
      return isoDate;
    } catch (e) {
      console.error(`📅 날짜 파싱 최종 오류: ${e}, 원본: "${dateStr}"`);
      // 오류 발생 시 현재 날짜 사용
      return new Date().toISOString();
    }
  }
}