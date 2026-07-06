import { chromium } from 'playwright';

export interface SeoResult {
  url: string;
  statusCode: number;
  title: string;
  metaDescription: string;
  h1Count: number;
  wordCount: number;
  links: { href: string; text: string; isInternal: boolean }[];
  loadTimeMs: number;
  error?: string;
}

export const crawlPage = async (url: string): Promise<SeoResult> => {
  const startTime = Date.now();
  let browser;

  try {
    // Launch headless chromium
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const context = await browser.newContext({
      userAgent: 'AformixPulse-Bot/1.0 (+http://aformix.com)',
    });

    const page = await context.newPage();
    
    // Set a timeout of 30s
    page.setDefaultTimeout(30000);

    const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
    const statusCode = response?.status() || 500;

    // Extract SEO data directly in the page context to avoid cheerio dependency
    const extracted = await page.evaluate((base) => {
      const title = document.querySelector('title')?.textContent?.trim() || '';
      const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || '';
      const h1Count = document.querySelectorAll('h1').length;
      const bodyText = document.body ? (document.body.textContent || '').replace(/\s+/g, ' ').trim() : '';
      const wordCount = bodyText ? bodyText.split(' ').length : 0;
      const links: { href: string; text: string; isInternal: boolean }[] = [];
      const anchors = Array.from(document.querySelectorAll('a'));
      for (const a of anchors) {
        const href = a.getAttribute('href');
        const text = (a.textContent || '').trim().substring(0, 100);
        if (href) {
          const isInternal = href.startsWith('/') || href.startsWith(base);
          links.push({ href, text, isInternal });
        }
      }
      return { title, metaDescription, h1Count, wordCount, links };
    }, new URL(url).origin);

    const title = extracted.title;
    const metaDescription = extracted.metaDescription;
    const h1Count = extracted.h1Count;
    const wordCount = extracted.wordCount;
    const links = extracted.links;

    const loadTimeMs = Date.now() - startTime;

    return {
      url,
      statusCode,
      title,
      metaDescription,
      h1Count,
      wordCount,
      links: links.slice(0, 100), // Limit to 100 links for now to save space
      loadTimeMs,
    };
  } catch (error: any) {
    console.error(`Crawler Error for ${url}:`, error.message);
    return {
      url,
      statusCode: 500,
      title: '',
      metaDescription: '',
      h1Count: 0,
      wordCount: 0,
      links: [],
      loadTimeMs: Date.now() - startTime,
      error: error.message,
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
