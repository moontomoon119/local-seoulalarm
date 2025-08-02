import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import { BaseScraper } from './base-scraper';
import { NoticeListItem } from '../types/notice';
import * as fs from 'fs';

export class DongjakScraper extends BaseScraper {
  constructor() {
    super('동작구', 'https://dongjak.eminwon.seoul.kr');
  }

  async scrapeNoticeList(): Promise<NoticeListItem[]> {
    const noticeItems: NoticeListItem[] = [];
    const maxPages = 1;

    console.log('🔍 동작구 스크래핑 시작...');

    for (let page = 1; page <= maxPages; page++) {
      console.log(`📄 페이지 ${page} 처리 중...`);
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      
      try {
        const pageObj = await browser.newPage();
        
        // 네비게이션 타임아웃 늘리기 (60초)
        pageObj.setDefaultNavigationTimeout(60000);
        
        // 유저 에이전트 설정 및 추가 헤더 설정
        await pageObj.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await pageObj.setExtraHTTPHeaders({
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
          'Referer': 'https://dongjak.eminwon.seoul.kr/',
          'Connection': 'keep-alive',
          'Cache-Control': 'max-age=0'
        });

        // 파라미터 없는 기본 URL 사용
        const baseUrl = 'https://dongjak.eminwon.seoul.kr/emwp/gov/mogaha/ntis/web/ofr/action/OfrAction.do';
        console.log(`🌐 기본 URL에 접속 중: ${baseUrl}`);
        
        await pageObj.goto(baseUrl, { waitUntil: 'networkidle2' });
        
        // 페이지 로딩 시간 추가 (5초)
        console.log('⏳ 페이지 로딩을 위해 5초 대기 중...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // 디버깅을 위해 페이지 스크린샷 저장
        await pageObj.screenshot({ path: 'dongjak-screenshot.png' });
        console.log('📸 페이지 스크린샷 저장됨: dongjak-screenshot.png');
        
        // 페이지의 모든 버튼과 링크 찾기 시도
        console.log('🔍 페이지에서 검색, 조회 버튼 또는 링크 찾기 시도...');
        const clickableElements = await pageObj.evaluate(() => {
  const elements = Array.from(document.querySelectorAll('button, a, input[type="submit"]'));
  return elements.map((el) => {
    const element = el as HTMLElement;
    const text = element.textContent || '';
    const id = (element as HTMLInputElement).id || '';
    const className = element.className || '';
    const name = (element as HTMLInputElement).name || '';
    const type = (element as HTMLInputElement).type || '';
    const href = (element as HTMLAnchorElement).href || '';
    const onclick = element.getAttribute('onclick') || '';

    return { text: text.trim(), id, className, name, type, href, onclick };
  });
});
        
        console.log('📋 페이지 내 클릭 가능한 요소:', JSON.stringify(clickableElements, null, 2));
        
        const html = await pageObj.content();
        console.log('📝 HTML 가져오기 성공');
        
        // HTML 구조를 파일로 저장하여 디버깅
        fs.writeFileSync('dongjak-debug.html', html);
        console.log('🔍 디버깅용 HTML 저장됨: dongjak-debug.html');
        
        // DOM 구조 분석 부분 단순화
        console.log('📊 페이지 분석 중...');
        
        const $ = cheerio.load(html);
        
        // 페이지 타이틀 확인
        const pageTitle = $('title').text();
        console.log(`📄 페이지 타이틀: ${pageTitle}`);
        
        // 페이지 내용 검색
        const bodyText = $('body').text();
        console.log(`📄 페이지 내용 일부: ${bodyText.slice(0, 200)}...`);
        
        // 새 사이트에 맞는 선택자 사용
        const trElements = $('table.board_list tr');
        console.log(`📊 테이블 행(tr) 개수: ${trElements.length}`);
        
        // 테이블이 없는 경우, 입력 양식이나 검색 폼 확인
        if (trElements.length === 0) {
          console.log('⚠️ 게시판 테이블을 찾을 수 없습니다. 폼 요소 확인 중...');
          const forms = $('form');
          console.log(`📊 폼 개수: ${forms.length}`);
          
          forms.each((i, form) => {
            const formId = $(form).attr('id') || '';
            const formName = $(form).attr('name') || '';
            const formAction = $(form).attr('action') || '';
            const formMethod = $(form).attr('method') || '';
            console.log(`📋 폼 정보 #${i}: id=${formId}, name=${formName}, action=${formAction}, method=${formMethod}`);
            
            const inputs = $(form).find('input');
            console.log(`📊 폼 #${i} 내 입력 필드 개수: ${inputs.length}`);
            
            inputs.each((j, input) => {
              const inputType = $(input).attr('type') || '';
              const inputName = $(input).attr('name') || '';
              const inputId = $(input).attr('id') || '';
              const inputValue = $(input).attr('value') || '';
              console.log(`  - 입력 필드 #${j}: type=${inputType}, name=${inputName}, id=${inputId}, value=${inputValue}`);
            });
          });
        }
        
        trElements.each((index, el) => {
          if (index === 0) return; // 헤더 행 건너뛰기
          
          console.log(`📋 행 ${index} 처리 중...`);
          const $row = $(el);
          
          // td 개수 확인
          const tdCount = $row.find('td').length;
          console.log(`  - td 개수: ${tdCount}`);
          
          if (tdCount < 3) {
            console.log('  - 충분한 td 요소가 없어 건너뜁니다.');
            return; // continue
          }
          
          // 새 사이트 구조에 맞는 데이터 추출
          const titleEl = $row.find('td.al a');
          const title = titleEl.text().trim();
          const onclick = titleEl.attr('onclick') || '';
          console.log(`  - 제목: "${title}"`);
          console.log(`  - onclick 속성: ${onclick}`);
          
          // 날짜는 보통 마지막 열이나 마지막에서 두 번째 열에 있음
          const date = $row.find('td').eq(-2).text().trim();
          console.log(`  - 날짜: ${date}`);
          
          // ID 추출 (예: fnDetail('3010001','2023010047') 형식)
          let id = '';
          const idMatch = onclick.match(/fnDetail\(['"]?([^'"]+)['"]?,\s*['"]?([^'"]+)/);
          if (idMatch && idMatch.length >= 3) {
            const orgId = idMatch[1];
            const noticeId = idMatch[2];
            id = `${orgId},${noticeId}`;
            console.log(`  - 추출된 ID: ${id} (orgId: ${orgId}, noticeId: ${noticeId})`);
          }
          
          if (title && id && date) {
            const url = `https://dongjak.eminwon.seoul.kr/emwp/gov/mogaha/ntis/web/ofr/action/OfrAction.do?method=selectOfrNotAncmtRegst&not_ancmt_mgt_no=${id.split(',')[1]}&up_not_ancmt_mgt_se=${id.split(',')[0]}`;
            
            noticeItems.push({
              title,
              url,
              publishDate: this.parseDate(date),
              category: '고시/공고',
            });
            console.log('  ✅ 공지사항 항목이 추가되었습니다.');
          } else {
            console.log('  ❌ 필수 정보가 누락되어 항목을 추가하지 않았습니다.');
          }
        });
        
        // 페이지내이션 확인하여 다음 페이지가 있는지 확인
        const pageLinks = $('.paging a');
        if (pageLinks.length > 0) {
          console.log(`📊 페이지 링크 개수: ${pageLinks.length}`);
        }
        
      } catch (error) {
        console.error('🚨 스크래핑 중 오류 발생:', error);
      } finally {
        await browser.close();
        console.log('🔒 브라우저 세션 종료');
      }
    }

    console.log(`🔢 총 스크래핑된 공지사항: ${noticeItems.length}개`);
    return noticeItems;
  }

  async scrapeNoticeDetail(url: string): Promise<string> {
    console.log(`🔍 상세 페이지 스크래핑 시작: ${url}`);
    
    // URL에서 게시물 ID 추출 시도
    let noticeId = '';
    let orgId = '';
    
    const noticeIdMatch = url.match(/not_ancmt_mgt_no=([^&]+)/);
    if (noticeIdMatch && noticeIdMatch[1]) {
      noticeId = noticeIdMatch[1];
    }
    
    const orgIdMatch = url.match(/up_not_ancmt_mgt_se=([^&]+)/);
    if (orgIdMatch && orgIdMatch[1]) {
      orgId = orgIdMatch[1];
    }
    
    if (!noticeId || !orgId) {
      console.log('⚠️ URL에서 ID를 추출할 수 없습니다.');
      throw new Error(`잘못된 상세 URL: ${url}`);
    }
    
    console.log(`🔑 추출된 ID: noticeId=${noticeId}, orgId=${orgId}`);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    try {
      const page = await browser.newPage();
      // 네비게이션 타임아웃 늘리기 (60초)
      page.setDefaultNavigationTimeout(60000);
      
      // 유저 에이전트 설정 및 추가 헤더 설정
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      await page.setExtraHTTPHeaders({
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://dongjak.eminwon.seoul.kr/',
        'Connection': 'keep-alive',
        'Cache-Control': 'max-age=0'
      });
      
      // 직접 상세 페이지로 이동 시도
      console.log(`🌐 상세 페이지 URL에 접속 중: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      // 페이지 로딩 시간 추가 (10초)
      console.log('⏳ 상세 페이지 로딩을 위해 10초 대기 중...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // 디버깅을 위해 페이지 스크린샷 저장
      await page.screenshot({ path: `dongjak-detail-${noticeId}-screenshot.png` });
      console.log(`📸 상세 페이지 스크린샷 저장됨: dongjak-detail-${noticeId}-screenshot.png`);
      
      const html = await page.content();
      console.log('📝 상세 페이지 HTML 가져오기 성공');
      
      // 상세 페이지 HTML 저장
      fs.writeFileSync(`dongjak-detail-${noticeId}.html`, html);
      console.log(`🔍 상세 페이지 HTML 저장됨: dongjak-detail-${noticeId}.html`);
      
      const $ = cheerio.load(html);
      
      // 페이지 타이틀 확인
      const pageTitle = $('title').text();
      console.log(`📄 상세 페이지 타이틀: ${pageTitle}`);
      
      // 새 사이트 구조에 맞는 컨텐츠 선택자
      const contentSelectors = [
        '.view_cont', 
        '.view_contents',
        '.bbs_detail_content',
        '.dbdata_table',
        '.board_view_contents',
        '.board_view_detail'
      ];
      
      let content = '';
      
      for (const selector of contentSelectors) {
        const contentEl = $(selector).first();
        if (contentEl.length) {
          content = contentEl.text().trim();
          console.log(`📄 컨텐츠 발견: ${selector}`);
          break;
        }
      }
      
      console.log('📋 콘텐츠 길이:', content.length);
      
      if (!content) {
        console.log('⚠️ 컨텐츠를 찾을 수 없습니다. 다른 방법으로 시도합니다.');
        // 테이블 구조에서 내용 찾기 시도
        const contentRows = $('table.dbdata_table tr');
        contentRows.each((i, row) => {
          const label = $(row).find('th').text().trim();
          if (label.includes('내용')) {
            content = $(row).find('td').text().trim();
            console.log(`📄 테이블에서 내용 발견: ${label}`);
            return false; // 루프 중단
          }
        });
      }
      
      if (!content) {
        console.log('⚠️ 컨텐츠를 찾을 수 없습니다. 페이지 구조 분석:');
        const bodyText = $('body').text().trim();
        console.log(`📄 페이지 전체 텍스트 길이: ${bodyText.length}`);
        
        // 컨텐츠를 찾을 수 없는 경우 전체 페이지 텍스트 반환
        return bodyText;
      }
      
      return content;
    } catch (error) {
      console.error('🚨 상세 페이지 스크래핑 중 오류 발생:', error);
      throw error;
    } finally {
      await browser.close();
      console.log('🔒 브라우저 세션 종료');
    }
  }

  public parseDate(dateStr: string): string {
    console.log(`📅 날짜 파싱: "${dateStr}"`);
    
    // 다양한 날짜 형식 처리
    let formattedDate = dateStr.replace(/\s+/g, ' ').trim();
    
    // YYYY.MM.DD 형식을 YYYY-MM-DD로 변환
    formattedDate = formattedDate.replace(/(\d{4})\.(\d{2})\.(\d{2})/, '$1-$2-$3');
    
    // YYYY년 MM월 DD일 형식 처리
    formattedDate = formattedDate.replace(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/, '$1-$2-$3');
    
    // YYYY-MM-DD 형식이 아닌 경우
    if (!/^\d{4}-\d{1,2}-\d{1,2}$/.test(formattedDate)) {
      console.log(`📅 알 수 없는 날짜 형식: "${formattedDate}"`);
      return new Date().toISOString(); // 현재 날짜로 대체
    }
    
    try {
      const isoDate = new Date(formattedDate).toISOString();
      console.log(`📅 변환된 날짜: "${isoDate}"`);
      return isoDate;
    } catch (e) {
      console.error(`📅 날짜 파싱 오류: ${e}`);
      // 오류 발생 시 현재 날짜 사용
      return new Date().toISOString();
    }
  }
}