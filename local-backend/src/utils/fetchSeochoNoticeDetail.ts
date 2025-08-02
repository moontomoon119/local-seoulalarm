// src/utils/fetchSeochoNoticeDetail.ts
import puppeteer from 'puppeteer';

export async function fetchSeochoNoticeDetail(id: string): Promise<string> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  await page.goto(
    'https://eminwon.seocho.go.kr/emwp/jsp/ofr/OfrNotAncmtLSub.jsp?not_ancmt_se_code=01,02,04',
    { waitUntil: 'networkidle2' }
  );

  // 👇 여기가 핵심: 브라우저 내 실행이므로 TS 무시
  await page.evaluate((detailId: string) => {
    // @ts-ignore
    window.searchDetail(detailId);
  }, id);

  // wait 대체
  await new Promise((res) => setTimeout(res, 1500));

  const content = await page.content();
  await browser.close();
  return content;
}
