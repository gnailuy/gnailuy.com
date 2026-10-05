const { test, expect } = require('@playwright/test');

const thirdPartyRequests = /(googletagmanager|googlesyndication|disqus)\./;

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

test('home, archive, and an article are usable', async ({ page }, testInfo) => {
  await page.route(thirdPartyRequests, route => route.abort());
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Blog posts' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
  const latestPost = page.locator('.post-card h2 a').first();
  await expect(latestPost).toBeVisible();
  const title = (await latestPost.innerText()).trim();
  const href = await latestPost.getAttribute('href');
  expect(href).toMatch(/^\/.+\/$/);
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: testInfo.outputPath('home.png'), fullPage: true });

  await page.getByRole('link', { name: 'archive', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Archive' })).toBeVisible();
  const archivedPost = page.locator(`.archive-list a[href="${href}"]`);
  await expect(archivedPost).toHaveText(title);
  await archivedPost.click();
  await expect(page.getByRole('heading', { name: title })).toBeVisible();
  await expect(page.locator('.prose')).not.toBeEmpty();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: testInfo.outputPath('article.png'), fullPage: true });
});

test('math-enabled posts render inline and display LaTeX', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Math rendering is viewport-independent.');
  await page.route(thirdPartyRequests, route => route.abort());
  await page.goto('/mathematics/2026/09/06/asymptotic-notations/');
  await expect(page.locator('script[src*="mathjax@3"]')).toHaveCount(1);
  await expect(page.locator('mjx-container:not([display="true"])').first()).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('mjx-container[display="true"]').first()).toBeVisible();
});

test('error pages render and the legacy 404 redirects to the archive', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Redirect behavior is viewport-independent.');
  await page.goto('/50x.html');
  await expect(page.getByRole('heading', { name: 'Server depressed' })).toBeVisible();

  await page.goto('/404.html');
  await expect(page.getByRole('heading', { name: '404 Not Found' })).toBeVisible();
  await expect(page.locator('meta[http-equiv="refresh"]')).toHaveAttribute('content', '3; url=/archive/');
  await page.waitForURL('**/archive/', { timeout: 5_000 });
  await expect(page.getByRole('heading', { name: 'Archive' })).toBeVisible();
});

test('authored images use responsive Hugo output on mobile', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'The narrow viewport exercises the responsive image constraint.');
  await page.route(thirdPartyRequests, route => route.abort());
  await page.goto('/internet/2018/01/12/ico-with-parity/');
  const image = page.getByRole('img', { name: 'Parity Apps' });
  await expect(image).toBeVisible();
  await expect(image).toHaveAttribute('src', /\/images\/_fullsize\/apps_hu_[a-f0-9]+\.png/);
  await expect(image).toHaveAttribute('srcset', /320w.+640w.+960w.+1280w.+\/images\/apps\.png 1920w/);
  await expectNoHorizontalOverflow(page);
  await image.scrollIntoViewIfNeeded();
  await image.evaluate(element => element.decode());
  const box = await image.boundingBox();
  expect(box.width).toBeGreaterThan(0);
  expect(box.height).toBeGreaterThan(0);
  expect(box.width).toBeLessThanOrEqual(page.viewportSize().width);
});
