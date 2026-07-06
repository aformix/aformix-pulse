import { chromium, Page } from 'playwright';
import * as cheerio from 'cheerio';

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

    // Get the HTML content
    const html = await page.content();
    
    // Load into Cheerio for fast DOM parsing
    const $ = cheerio.load(html);

    // Extract basic SEO Data
    const title = $('title').text().trim();
    const metaDescription = $('meta[name="description"]').attr('content')?.trim() || '';
    const h1Count = $('h1').length;
    
    // Simple word count estimate on body text
    const textContent = $('body').text().replace(/\s+/g, ' ').trim();
    const wordCount = textContent ? textContent.split(' ').length : 0;

    // Extract links
    const baseUrl = new URL(url).origin;
    const links: { href: string; text: string; isInternal: boolean }[] = [];
    
    $('a').each((_, el) => {
      let href = $(el).attr('href');
      const text = $(el).text().trim().substring(0, 100); // cap text length

      if (href) {
        try {
          const isInternal = href.startsWith('/') || href.startsWith(baseUrl);
          links.push({ href, text, isInternal });
        } catch {
          // ignore invalid URLs
        }
      }
    });

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
