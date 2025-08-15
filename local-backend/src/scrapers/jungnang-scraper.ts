import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import { BaseScraper } from './base-scraper';
import { NoticeListItem } from '../types/notice';

export class JungnangScraper extends BaseScraper {
  constructor() {
    super('중랑구', 'https://www.jungnang.go.kr');
  }

  async scrapeNoticeList(): Promise<NoticeListItem[]> {
    const notices: NoticeListItem[] = [];
    const maxPages = 3;

    console.log('🔍 중랑구 스크래핑 시작...');

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      for (let page = 1; page <= maxPages; page++) {
        console.log(`📄 중랑구 페이지 ${page} 처리 중...`);
        
        const pageObj = await browser.newPage();
        
        // 네비게이션 타임아웃 설정
        pageObj.setDefaultNavigationTimeout(30000);
        
        // 유저 에이전트 설정 및 추가 헤더 설정
        await pageObj.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await pageObj.setExtraHTTPHeaders({
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'max-age=0'
        });

        const url = `${this.baseUrl}/portal/bbs/list/B0000117.do?menuNo=200475&pageIndex=${page}`;
        console.log(`🌐 URL에 접속 중: ${url}`);
        
        try {
          await pageObj.goto(url, { waitUntil: 'networkidle2' });
          
          // 페이지 로딩 대기
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const html = await pageObj.content();
          console.log('📝 HTML 가져오기 성공');
          
          const $ = cheerio.load(html);

          // 테이블 구조 확인을 위한 디버깅
          const tableRows = $('tr.noticeTitlte');
          console.log(`📊 발견된 공지사항 행 수: ${tableRows.length}`);

          // 데이터가 없으면 다른 선택자 시도
          if (tableRows.length === 0) {
            console.log('⚠️ tr.noticeTitlte를 찾을 수 없습니다. 다른 선택자를 시도합니다.');
            
            // 다른 가능한 선택자들
            const alternativeSelectors = [
              'tr.noticeTitle',
              'tr[class*="notice"]',
              'tbody tr',
              '.table_type02 tbody tr'
            ];
            
            for (const selector of alternativeSelectors) {
              const altRows = $(selector);
              console.log(`📊 ${selector}로 찾은 행 수: ${altRows.length}`);
              if (altRows.length > 0) {
                console.log(`✅ ${selector}를 사용합니다.`);
                break;
              }
            }
          }

          $('tr.noticeTitlte, tr.noticeTitle, tbody tr').each((index, el) => {
            const $tr = $(el);
            
            // 헤더 행이나 빈 행 건너뛰기
            if ($tr.find('th').length > 0 || $tr.find('td').length < 5) {
              return;
            }
            
            // 번호 추출 (첫 번째 td)
            const number = $tr.find('td').eq(0).text().trim();
            
            // 제목과 링크 추출 (두 번째 td)
            const $titleCell = $tr.find('td').eq(1);
            const $a = $titleCell.find('a');
            const title = $a.text().trim();
            const href = $a.attr('href');
            
            // 담당부서 추출 (세 번째 td)
            const department = $tr.find('td').eq(2).text().trim();
            
            // 첨부파일 여부 확인 (네 번째 td)
            const hasFile = $tr.find('td').eq(3).find('a').length > 0;
            
            // 등록일 추출 (다섯 번째 td)
            const dateText = $tr.find('td').eq(4).text().trim();
            
            // 조회수 추출 (여섯 번째 td, 있는 경우)
            const views = $tr.find('td').eq(5).text().trim();

            console.log(`📋 행 ${index + 1}: 번호=${number}, 제목="${title.substring(0, 30)}...", 부서=${department}, 날짜=${dateText}`);

            if (href && title && dateText) {
              notices.push({
                title,
                url: this.absoluteUrl(href),
                publishDate: this.parseDate(dateText),
                category: department || '고시/공고', // 담당부서를 카테고리로 사용
              });
              console.log(`  ✅ 공지사항 추가 완료`);
            } else {
              console.log(`  ❌ 필수 정보 누락: href=${!!href}, title=${!!title}, date=${!!dateText}`);
            }
          });

          // 페이지에 데이터가 없으면 중단
          if (tableRows.length === 0 && notices.length === 0) {
            console.log(`❌ 페이지 ${page}에서 데이터를 찾을 수 없습니다. 크롤링을 중단합니다.`);
            await pageObj.close();
            break;
          }

        } catch (pageError) {
          console.error(`❌ 페이지 ${page} 처리 중 오류:`, pageError);
        }

        await pageObj.close();
        await new Promise(resolve => setTimeout(resolve, 1000)); // 페이지 간 대기
      }
      
    } catch (error) {
      console.error('🚨 중랑구 스크래핑 중 오류 발생:', error);
    } finally {
      await browser.close();
      console.log('🔒 브라우저 세션 종료');
    }

    console.log(`🔢 중랑구 총 수집된 공지사항: ${notices.length}개`);
    return notices;
  }

  async scrapeNoticeDetail(url: string): Promise<string> {
    console.log(`🔍 중랑구 상세 페이지 스크래핑: ${url}`);
    
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
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Referer': 'https://www.jungnang.go.kr/',
        'Cache-Control': 'max-age=0'
      });
      
      console.log(`🌐 상세 페이지 URL에 접속 중: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      // 페이지 로딩 대기
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const html = await page.content();
      const $ = cheerio.load(html);

      // 다양한 선택자로 내용 찾기
      let content = '';
      
      // 1순위: 기존 선택자
      const dbdata = $('#dbdata').html();
      if (dbdata && dbdata.trim()) {
        content = this.cleanText(cheerio.load(dbdata).text());
        console.log(`📄 #dbdata에서 내용 발견: ${content.length}자`);
      }
      
      // 2순위: 게시판 내용 영역들
      if (!content) {
        const contentSelectors = [
          '.board_view_content',
          '.view_content',
          '.bbs_content',
          '.content_area',
          '.board_content',
          'div[class*="content"]',
          '.view_wrap',
          '.board_view',
          '#content'
        ];
        
        for (const selector of contentSelectors) {
          const contentEl = $(selector);
          if (contentEl.length && contentEl.text().trim().length > 50) {
            content = this.cleanText(contentEl.text());
            console.log(`📄 ${selector}에서 내용 발견: ${content.length}자`);
            break;
          }
        }
      }
      
      // 3순위: 테이블 구조에서 내용 찾기
      if (!content) {
        console.log('⚠️ 일반적인 선택자로 내용을 찾지 못했습니다. 테이블 구조를 확인합니다.');
        
        $('table tr').each((i, row) => {
          const $row = $(row);
          const $cells = $row.find('td');
          
          // 내용이 있는 셀 찾기 (보통 colspan이 있거나 긴 텍스트)
          $cells.each((j, cell) => {
            const $cell = $(cell);
            const cellText = $cell.text().trim();
            const colspan = $cell.attr('colspan');
            
            // colspan이 있고 텍스트가 긴 경우 (보통 본문 내용)
            if ((colspan && parseInt(colspan) > 1 && cellText.length > 100) || 
                cellText.length > 200) {
              content = this.cleanText(cellText);
              console.log(`📄 테이블 셀에서 내용 발견 (행${i}, 셀${j}, colspan=${colspan}): ${content.length}자`);
              return false; // 중단
            }
          });
          
          if (content) return false; // 외부 루프도 중단
        });
      }
      
      // 4순위: 전체 body에서 의미있는 내용 추출
      if (!content) {
        console.log('⚠️ 모든 방법으로 구조화된 내용을 찾지 못했습니다. 전체 텍스트를 사용합니다.');
        const bodyText = $('body').text().trim();
        if (bodyText.length > 100) {
          content = this.cleanText(bodyText);
          console.log(`📄 전체 페이지 텍스트 사용: ${content.length}자`);
        }
      }

      console.log(`📋 최종 추출된 내용 길이: ${content.length}자`);
      return content;
      
    } catch (error) {
      console.error(`🚨 중랑구 상세 페이지 스크래핑 오류: ${error}`);
      return '';
    } finally {
      await browser.close();
    }
  }

  parseDate(dateStr: string): string {
    console.log(`📅 중랑구 날짜 파싱: "${dateStr}"`);
    
    // 공백 제거 및 정리
    const cleanDateStr = dateStr.replace(/\s+/g, '').trim();
    
    // YYYY-MM-DD 형식 확인
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDateStr)) {
      try {
        const parsed = new Date(cleanDateStr);
        if (!isNaN(parsed.getTime())) {
          const isoDate = parsed.toISOString();
          console.log(`📅 변환된 날짜: "${isoDate}"`);
          return isoDate;
        }
      } catch (e) {
        console.error(`📅 날짜 파싱 오류: ${e}`);
      }
    }
    
    // 다른 형식들 처리
    let formattedDate = cleanDateStr;
    
    // YYYY.MM.DD 형식을 YYYY-MM-DD로 변환
    formattedDate = formattedDate.replace(/(\d{4})\.(\d{2})\.(\d{2})/, '$1-$2-$3');
    
    // YYYY년MM월DD일 형식 처리
    formattedDate = formattedDate.replace(/(\d{4})년(\d{1,2})월(\d{1,2})일/, (match, year, month, day) => {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    });
    
    try {
      const parsed = new Date(formattedDate);
      if (!isNaN(parsed.getTime())) {
        const isoDate = parsed.toISOString();
        console.log(`📅 변환된 날짜: "${isoDate}"`);
        return isoDate;
      }
    } catch (e) {
      console.error(`📅 날짜 파싱 최종 오류: ${e}, 원본: "${dateStr}"`);
    }
    
    // 파싱 실패시 현재 날짜 반환
    const currentDate = new Date().toISOString();
    console.log(`📅 파싱 실패로 현재 날짜 사용: "${currentDate}"`);
    return currentDate;
  }
}