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
    const maxPages = 3; // 더 많은 페이지 테스트

    console.log('🔍 동작구 스크래핑 시작...');

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      for (let page = 1; page <= maxPages; page++) {
        console.log(`📄 페이지 ${page} 처리 중...`);
        
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

        // 올바른 URL 사용
        const targetUrl = 'https://dongjak.eminwon.seoul.kr/emwp/gov/mogaha/ntis/web/ofr/action/OfrAction.do';
        console.log(`🌐 URL에 접속 중: ${targetUrl}`);
        
        await pageObj.goto(targetUrl, { waitUntil: 'networkidle2' });
        
        // 페이지 로딩 대기
        console.log('⏳ 페이지 로딩을 위해 5초 대기 중...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // JavaScript 실행 완료 대기
        await pageObj.waitForFunction(() => {
          return document.readyState === 'complete';
        }, { timeout: 10000 });
        
        // 폼이 로드될 때까지 대기
        try {
          await pageObj.waitForSelector('form[name="form1"]', { timeout: 5000 });
          console.log('✅ 폼이 로드되었습니다.');
        } catch (e) {
          console.log('⚠️ 폼 로드 대기 실패, 계속 진행합니다.');
        }
        
        // 테이블이 로드될 때까지 대기
        try {
          await pageObj.waitForSelector('table', { timeout: 5000 });
          console.log('✅ 테이블이 로드되었습니다.');
        } catch (e) {
          console.log('⚠️ 테이블 로드 대기 실패, 계속 진행합니다.');
        }

        // 페이지가 1보다 크면 해당 페이지로 이동
        if (page > 1) {
          try {
            console.log(`📄 페이지 ${page}로 이동 중...`);
            await pageObj.evaluate((pageNum) => {
              const pageLink = document.querySelector(`a[onclick="javascript:document.form1.pageIndex.value=${pageNum};goPage()"]`) as HTMLElement;
              if (pageLink) {
                pageLink.click();
              } else {
                throw new Error(`페이지 ${pageNum} 링크를 찾을 수 없습니다`);
              }
            }, page);
            
            // 페이지 이동 후 로딩 대기
            await new Promise(resolve => setTimeout(resolve, 3000));
          } catch (error) {
            console.log(`❌ 페이지 ${page}로 이동 실패. 더 이상 페이지가 없을 수 있습니다.`);
            await pageObj.close();
            break;
          }
        }
        
        // 디버깅을 위해 페이지 스크린샷 저장
        await pageObj.screenshot({ path: `dongjak-page-${page}-screenshot.png` });
        console.log(`📸 페이지 ${page} 스크린샷 저장됨`);
        
        const html = await pageObj.content();
        console.log('📝 HTML 가져오기 성공');
        
        let $ = cheerio.load(html);
        
        // 페이지 분석을 위한 추가 정보 수집
        console.log('🔍 페이지 구조 분석 중...');
        
        // 페이지 타이틀 확인
        const pageTitle = $('title').text();
        console.log(`📄 페이지 타이틀: ${pageTitle}`);
        
        // body 내용 일부 확인
        const bodyText = $('body').text().substring(0, 500);
        console.log(`📄 페이지 내용 일부: ${bodyText}...`);
        
        // form 태그 확인
        const forms = $('form');
        console.log(`📊 폼 개수: ${forms.length}`);
        forms.each((i, form) => {
          const formName = $(form).attr('name') || 'unnamed';
          console.log(`📋 폼 ${i}: name="${formName}"`);
        });
        
        // 테이블 구조 확인
        const tables = $('table');
        console.log(`📊 테이블 개수: ${tables.length}`);
        
        // 모든 tr 요소 확인
        const allTrs = $('tr');
        console.log(`📊 전체 tr 개수: ${allTrs.length}`);
        
        // bgcolor 속성이 있는 tr 찾기
        const bgcolorTrs = $('tr[bgcolor]');
        console.log(`📊 bgcolor 속성이 있는 tr 개수: ${bgcolorTrs.length}`);
        bgcolorTrs.each((i, tr) => {
          const bgcolor = $(tr).attr('bgcolor');
          console.log(`  - tr ${i}: bgcolor="${bgcolor}"`);
        });
        
        // 여러 방법으로 공지사항 행 찾기 시도
        let noticeRows = $('tr[bgcolor="#FFFFFF"], tr[bgcolor="#F0F9FB"]');
        console.log(`📊 방법1 - bgcolor 속성으로 찾은 행 수: ${noticeRows.length}`);
        
        if (noticeRows.length === 0) {
          // 방법2: onmouseover 속성이 있는 tr 찾기
          noticeRows = $('tr[onmouseover*="backgroundColor"]');
          console.log(`📊 방법2 - onmouseover로 찾은 행 수: ${noticeRows.length}`);
        }
        
        if (noticeRows.length === 0) {
          // 방법3: 7개의 td를 가진 tr 찾기 (헤더 제외)
          noticeRows = $('tr').filter((i, tr) => {
            const tds = $(tr).find('td');
            return tds.length === 7 && !$(tr).find('th').length;
          });
          console.log(`📊 방법3 - 7개 td를 가진 행 수: ${noticeRows.length}`);
        }
        
        if (noticeRows.length === 0) {
          console.log('⚠️ 모든 방법으로 공지사항을 찾을 수 없습니다. 상세 디버깅을 실행합니다.');
          
          // 디버깅용 HTML 저장
          fs.writeFileSync(`dongjak-debug-page-${page}.html`, html);
          console.log(`🔍 디버깅용 HTML 저장됨: dongjak-debug-page-${page}.html`);
          
          // 페이지에 "고시공고" 텍스트가 있는지 확인
          const hasNoticeText = html.includes('고시공고') || html.includes('공고') || html.includes('제목');
          console.log(`📄 공고 관련 텍스트 존재: ${hasNoticeText}`);
          
          // 에러 메시지나 접근 제한 확인
          const hasError = html.includes('오류') || html.includes('접근') || html.includes('권한') || html.includes('차단');
          console.log(`❌ 에러/접근제한 메시지: ${hasError}`);
          
          // JavaScript 실행이 필요한지 확인
          const hasJavaScript = html.includes('javascript:') || html.includes('function') || html.includes('document.form');
          console.log(`⚡ JavaScript 관련 코드: ${hasJavaScript}`);
          
          // 폼 제출이 필요한 경우 시도
          if (hasJavaScript && html.includes('form1')) {
            console.log('🔄 폼 제출을 통한 데이터 로드 시도...');
            try {
              // 폼의 hidden 값들을 찾아서 제출
              await pageObj.evaluate(() => {
                const forms = document.forms as HTMLCollectionOf<HTMLFormElement>;
                const form = forms.namedItem('form1') as HTMLFormElement;
                if (form) {
                  // pageIndex를 1로 설정
                  const pageIndexInput = form.querySelector('input[name="pageIndex"]') as HTMLInputElement;
                  if (pageIndexInput) {
                    pageIndexInput.value = '1';
                  }
                  
                  // 폼 제출 또는 특정 함수 호출
                  if (typeof (window as any).goPage === 'function') {
                    (window as any).goPage();
                  } else {
                    form.submit();
                  }
                }
              });
              
              // 폼 제출 후 로딩 대기
              await new Promise(resolve => setTimeout(resolve, 3000));
              
              // 새로운 HTML 가져오기
              const newHtml = await pageObj.content();
              const new$ = cheerio.load(newHtml);
              noticeRows = new$('tr[bgcolor="#FFFFFF"], tr[bgcolor="#F0F9FB"]');
              console.log(`📊 폼 제출 후 찾은 행 수: ${noticeRows.length}`);
              
              if (noticeRows.length > 0) {
                $ = new$; // 새로운 HTML 사용
              }
            } catch (formError) {
              console.log(`❌ 폼 제출 실패: ${formError}`);
            }
          }
          
          // 여전히 데이터가 없으면 다른 URL 시도
          if (noticeRows.length === 0) {
            console.log('🔄 다른 URL로 시도...');
            const alternativeUrl = 'https://dongjak.eminwon.seoul.kr/emwp/jsp/ofr/OfrNotAncmtL.jsp?not_ancmt_se_code=01,04';
            try {
              await pageObj.goto(alternativeUrl, { waitUntil: 'networkidle2' });
              await new Promise(resolve => setTimeout(resolve, 3000));
              
              const altHtml = await pageObj.content();
              const alt$ = cheerio.load(altHtml);
              noticeRows = alt$('tr[bgcolor="#FFFFFF"], tr[bgcolor="#F0F9FB"]');
              console.log(`📊 대체 URL에서 찾은 행 수: ${noticeRows.length}`);
              
              if (noticeRows.length > 0) {
                $ = alt$;
              }
            } catch (altError) {
              console.log(`❌ 대체 URL 접근 실패: ${altError}`);
            }
          }
          
          // 실제 데이터가 있는 경우를 위해 다른 테이블 구조 시도
          $('table').each((tableIndex, table) => {
            const tableRows = $(table).find('tr');
            console.log(`📊 테이블 ${tableIndex}: ${tableRows.length}개 행`);
            
            if (tableRows.length > 1) {
              console.log(`  첫 번째 행 내용: ${tableRows.first().text().trim().substring(0, 100)}`);
              if (tableRows.length > 1) {
                console.log(`  두 번째 행 내용: ${tableRows.eq(1).text().trim().substring(0, 100)}`);
              }
            }
          });
        }
        
        noticeRows.each((index, el) => {
          console.log(`📋 행 ${index + 1} 처리 중...`);
          const $row = $(el);
          
          const tds = $row.find('td');
          if (tds.length < 7) {
            console.log(`  - td 개수가 부족합니다 (${tds.length}/7)`);
            return;
          }
          
          // HTML 구조에 맞게 데이터 추출
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
          const firstLink = tds.eq(0).find('a');
          const onclick = firstLink.attr('onclick') || '';
          console.log(`  - onclick: ${onclick}`);
          
          // searchDetail('25693') 형태에서 ID 추출
          const idMatch = onclick.match(/searchDetail\(['"](\d+)['"]\)/);
          let noticeId = '';
          if (idMatch && idMatch[1]) {
            noticeId = idMatch[1];
            console.log(`  - 추출된 ID: ${noticeId}`);
          }
          
          if (title && noticeId && registerDate) {
            // 상세 페이지 URL 구성 (실제 사이트 구조에 맞게 수정 필요)
            const detailUrl = `https://dongjak.eminwon.seoul.kr/emwp/gov/mogaha/ntis/web/ofr/action/OfrAction.do?method=selectOfrNotAncmtRegst&not_ancmt_mgt_no=${noticeId}`;
            
            noticeItems.push({
              title: title,
              url: detailUrl,
              publishDate: this.parseDate(registerDate),
              category: department || '고시/공고',
            });
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
      console.error('🚨 스크래핑 중 오류 발생:', error);
    } finally {
      await browser.close();
      console.log('🔒 브라우저 세션 종료');
    }

    console.log(`🔢 총 스크래핑된 공지사항: ${noticeItems.length}개`);
    return noticeItems;
  }

  async scrapeNoticeDetail(url: string): Promise<string> {
    console.log(`🔍 상세 페이지 스크래핑 시작: ${url}`);
    
    // URL에서 게시물 ID 추출
    const noticeIdMatch = url.match(/not_ancmt_mgt_no=([^&]+)/);
    const noticeId = noticeIdMatch ? noticeIdMatch[1] : 'unknown';
    
    console.log(`🔑 추출된 공지사항 ID: ${noticeId}`);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    try {
      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(60000);
      
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      await page.setExtraHTTPHeaders({
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://dongjak.eminwon.seoul.kr/',
        'Connection': 'keep-alive',
        'Cache-Control': 'max-age=0'
      });
      
      // 1단계: 먼저 목록 페이지로 이동
      console.log('🔄 1단계: 목록 페이지에 접속 중...');
      const listUrl = 'https://dongjak.eminwon.seoul.kr/emwp/jsp/ofr/OfrNotAncmtL.jsp?not_ancmt_se_code=01,04';
      await page.goto(listUrl, { waitUntil: 'networkidle2' });
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 2단계: 목록에서 해당 공지사항 찾아서 클릭
      console.log(`🔄 2단계: ID ${noticeId}인 공지사항 링크 찾는 중...`);
      
      try {
        // 해당 ID의 링크를 찾아서 클릭
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
          console.log('❌ 해당 ID의 링크를 찾을 수 없습니다. 목록에서 첫 번째 링크를 클릭합니다.');
          await page.evaluate(() => {
            const firstLink = document.querySelector('a[onclick*="searchDetail"]') as HTMLElement;
            if (firstLink) {
              firstLink.click();
            }
          });
        } else {
          console.log('✅ 해당 공지사항 링크 클릭 성공');
        }
        
        // 페이지 이동 대기
        console.log('⏳ 상세 페이지 로딩 대기 중...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // 페이지가 변경되었는지 확인
        const currentUrl = page.url();
        console.log(`📍 현재 URL: ${currentUrl}`);
        
      } catch (clickError) {
        console.log(`❌ 링크 클릭 실패: ${clickError}`);
        // 실패시 직접 URL 접근 시도
        console.log('🔄 직접 URL 접근 시도...');
        await page.goto(url, { waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      
      // 디버깅용 스크린샷
      await page.screenshot({ path: `dongjak-detail-${noticeId}-screenshot.png` });
      console.log(`📸 상세 페이지 스크린샷 저장됨`);
      
      const html = await page.content();
      
      // 디버깅용 HTML 저장
      fs.writeFileSync(`dongjak-detail-${noticeId}.html`, html);
      console.log(`🔍 상세 페이지 HTML 저장됨`);
      
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
        '.view_cont',
        '.view_contents', 
        '.bbs_detail_content',
        '.board_view_contents',
        '.board_view_detail',
        'td[class*="content"]',
        'div[class*="content"]',
        '.dbdata_table',
        'table[class*="view"] td',
        'table[summary*="상세"] td'
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
      console.error('🚨 상세 페이지 스크래핑 중 오류 발생:', error);
      return '';
    } finally {
      await browser.close();
    }
  }

  public parseDate(dateStr: string): string {
    console.log(`📅 날짜 파싱: "${dateStr}"`);
    
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
    formattedDate = formattedDate.replace(/(\d{4})년(\d{1,2})월(\d{1,2})일/, (match, year, month, day) => {
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