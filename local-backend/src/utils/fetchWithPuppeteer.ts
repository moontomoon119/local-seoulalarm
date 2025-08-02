import puppeteer from 'puppeteer';

export async function fetchWithPuppeteer(url: string, waitSelector: string, waitTime = 3000): Promise<string> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'], // ✅ 이 줄 추가
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });

  try {
    await page.waitForSelector(waitSelector, { timeout: waitTime });
  } catch (err) {
    console.warn('⚠️ 지정된 요소가 나타나지 않았습니다:', waitSelector);
  }

  const content = await page.content();
  await browser.close();
  return content;
}
