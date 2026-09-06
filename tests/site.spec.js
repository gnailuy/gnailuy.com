const { test, expect } = require('@playwright/test');

test('home and primary navigation are responsive', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Blog posts' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
  await expect(page.locator('.post-card')).toHaveCount(72);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: testInfo.outputPath('home.png'), fullPage: true });
});

test('archive reaches a preserved post URL', async ({ page }, testInfo) => {
  await page.route(/(googletagmanager|googlesyndication|disqus)\./, route => route.abort());
  await page.goto('/archive/');
  const link = page.getByRole('link', { name: 'Accept imperfectness' });
  await expect(link).toHaveAttribute('href', '/me/2024/03/17/imperfectness/');
  await link.click();
  await expect(page.getByRole('heading', { name: 'Accept imperfectness' })).toBeVisible();
  await expect(page.locator('main')).toContainText('accept imperfectness');
  await expect(page.locator('script[src*="googletagmanager.com/gtag/js?id=G-LPP02XNH54"]')).toHaveCount(1);
  await expect(page.locator('.adsbygoogle[data-ad-client="ca-pub-3373062932769749"][data-ad-slot="3716173942"]')).toHaveCount(1);
  await expect(page.locator('#disqus_thread')).toHaveCount(1);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: testInfo.outputPath('post.png'), fullPage: true });
});

test('math-enabled posts render inline and display LaTeX', async ({ page }, testInfo) => {
  await page.route(/(googletagmanager|googlesyndication|disqus)\./, route => route.abort());
  await page.goto('/mathematics/2026/09/06/asymptotic-notations/');
  await expect(page.locator('script[src*="mathjax@3"]')).toHaveCount(1);
  await expect(page.locator('mjx-container:not([display="true"])').first()).toBeVisible({ timeout: 15_000 });
  const displayMath = page.locator('mjx-container[display="true"]').first();
  await expect(displayMath).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('math-inline.png'), fullPage: true });
  await displayMath.scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('math-display.png') });
});

test('error pages render and the legacy 404 redirects to the archive', async ({ page }, testInfo) => {
  await page.goto('/50x.html');
  await expect(page.getByRole('heading', { name: 'Server depressed' })).toBeVisible();
  await expect(page.locator('main')).toContainText('feeling very depressed');
  await page.screenshot({ path: testInfo.outputPath('50x.png'), fullPage: true });

  await page.goto('/404.html');
  await expect(page.getByRole('heading', { name: '404 Not Found' })).toBeVisible();
  await expect(page.locator('meta[http-equiv="refresh"]')).toHaveAttribute('content', '3; url=/archive/');
  await page.screenshot({ path: testInfo.outputPath('404.png'), fullPage: true });
  await page.waitForURL('**/archive/', { timeout: 5_000 });
  await expect(page.getByRole('heading', { name: 'Archive' })).toBeVisible();
});

test('author image names produce responsive Hugo images', async ({ page, request }, testInfo) => {
  await page.route(/(googletagmanager|googlesyndication|disqus)\./, route => route.abort());
  await page.goto('/internet/2018/01/12/ico-with-parity/');
  const image = page.getByRole('img', { name: 'Parity Apps' });
  await expect(image).toBeVisible();
  await expect(image).toHaveAttribute('src', /\/images\/_fullsize\/apps_hu_[a-f0-9]+\.png/);
  await expect(image).toHaveAttribute('srcset', /320w.+640w.+960w.+1280w.+\/images\/apps\.png 1920w/);
  expect((await request.get('/images/apps.png')).ok()).toBeTruthy();
  expect((await request.get('/images/apps-630x382-9073fe.png')).status()).toBe(404);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await image.scrollIntoViewIfNeeded();
  await image.evaluate(element => element.decode());
  const box = await image.boundingBox();
  expect(box.width).toBeGreaterThan(0);
  expect(box.height).toBeGreaterThan(0);
  expect(box.width).toBeLessThanOrEqual(page.viewportSize().width);
  await page.screenshot({ path: testInfo.outputPath('responsive-image.png') });
});
