/* Optional integration checks: requires Playwright and a running npm run dev. */
const { chromium } = require('playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const base = 'http://127.0.0.1:4173/';
  fs.mkdirSync('test-results', { recursive: true });
  const files = fs.readdirSync('.').filter(file => file.endsWith('.html') && file !== '404.html');
  for (const width of process.env.INTERACTIONS_ONLY ? [] : [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const file of files) {
      await page.goto(base + file, { waitUntil: 'networkidle' });
      assert.equal(await page.locator('.site-header').count(), 1, `${file} has one shared header`);
      assert.equal(await page.locator('.site-footer').count(), 1, `${file} has one shared footer`);
      const layout = await page.evaluate(() => ({
        width: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        overflow: [...document.querySelectorAll('body *')].filter(el => {
          const r = el.getBoundingClientRect();
          return r.width && r.right > innerWidth + 3 && !el.closest('.marquee-wrap, .image-dialog, svg, .phone, .phone-screen, .wf-wrap, .wf-browser');
        }).slice(0, 8).map(el => `${el.tagName}.${el.className}`)
      }));
      console.log(`${width}px ${file}: ${JSON.stringify(layout)}`);
      assert.ok(layout.scrollWidth <= width + 1, `${file} overflows at ${width}px`);
      if (width !== 320 && ['index.html','about.html','projects.html','curse-of-osiris.html'].includes(file)) {
        // Reveal all sections by scrolling before capturing full-page output.
        await page.evaluate(async () => { for(let y=0;y<document.body.scrollHeight;y+=600){scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,100))} scrollTo({top:0,behavior:'instant'}); });
        await page.locator('img[loading="lazy"]').evaluateAll(async images => {
          await Promise.all(images.map(img => { img.loading='eager'; return img.decode().catch(() => {}); }));
        });
        await page.waitForTimeout(600);
        await page.screenshot({ path: `test-results/${file}-${width}.png`, fullPage: true });
      }
    }
  }
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto(base);
  assert.deepEqual(await page.locator('main>section[id]').evaluateAll(elements => elements.map(el => el.id)), ['home','work','about','experience','contact']);
  assert.equal(await page.locator('.proj-card').count(), 4);
  assert.equal(await page.locator('[data-explorer]').count(), 0);
  assert.deepEqual(await page.locator('.site-links a').allTextContents(), ['Work','About','Experience']);
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.locator('.site-links').getByRole('link', { name: 'About', exact: true }).click();
  assert.ok(page.url().endsWith('/about.html'));
  assert.equal(await page.locator('h1').textContent(), 'About.');
  await page.locator('.site-contact').click();
  await page.waitForURL('**/index.html#contact');
  assert.equal(await page.locator('#contact').isVisible(), true);
  await page.goto(base + 'projects.html');
  await page.getByRole('button', { name: 'Game design' }).click();
  assert.equal(await page.locator('.proj-card:visible').count(), 3);
  assert.ok(page.url().includes('discipline=game'));
  await page.reload();
  assert.equal(await page.locator('.proj-card:visible').count(), 3);
  await page.getByRole('searchbox').fill('Unity');
  assert.equal(await page.locator('.proj-card:visible').count(), 1);
  await page.getByRole('searchbox').fill('no-such-project');
  assert.equal(await page.locator('.proj-card:visible').count(), 0);
  await page.getByRole('button', { name: 'Reset filters' }).click();
  assert.equal(await page.locator('.proj-card:visible').count(), 8);
  await page.getByRole('button', { name: 'UI/UX design' }).click();
  assert.equal(await page.locator('.proj-card:visible').count(), 5);
  await page.goto(base + 'curse-of-osiris.html');
  const thumbnail = page.locator('.image-zoom').first();
  await thumbnail.focus(); await page.keyboard.press('Enter');
  assert.equal(await page.locator('dialog[open]').count(), 1);
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('[data-position]').textContent(), '2 / 3');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('dialog[open]').count(), 0);
  assert.equal(await thumbnail.evaluate(el => el === document.activeElement), true);
  await page.goto(base + 'StAndrews_casestudy_full.html');
  await page.locator('.audit-item>summary').first().focus(); await page.keyboard.press('Enter');
  assert.equal(await page.locator('.audit-item[open]').count(), 1);
  await page.getByRole('button', { name: 'Menu' }).click();
  assert.equal(await page.locator('.site-menu-toggle').getAttribute('aria-expanded'), 'true');
  assert.equal(await page.locator('.site-links').isVisible(), true);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.site-menu-toggle').getAttribute('aria-expanded'), 'false');
  assert.equal(await page.locator('.site-contact').isVisible(), true);
  await page.locator('.section-menu summary').click();
  const section = page.locator('[data-section-link]').nth(2);
  const sectionId = await section.getAttribute('href');
  await section.click();
  await page.waitForFunction(hash => document.querySelector('[data-section-link][aria-current]')?.getAttribute('href') === hash, sectionId);
  assert.equal(await page.locator(`${sectionId}`).evaluate(el => el === document.activeElement), true);
  assert.equal(await page.locator('[data-section-link][aria-current]').getAttribute('href'), sectionId);
  await page.getByRole('button', { name: 'Back to top' }).click();
  await page.waitForFunction(() => scrollY < 5);
  assert.ok(await page.evaluate(() => scrollY < 5));
  await page.goto(base + 'projects.html');
  await page.getByRole('searchbox').fill('Unity');
  await page.getByRole('button', { name: 'Clear search' }).click();
  assert.equal(await page.getByRole('searchbox').inputValue(), '');
  assert.equal(await page.locator('.proj-card:visible').count(), 8);
  await page.route('**/thumbnails/osiris.webp', route => route.abort());
  await page.goto(base + 'projects.html');
  await page.locator('.proj-card').filter({ has: page.locator('img[src*="osiris"]') }).scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  assert.ok(await page.locator('.image-unavailable:visible').count() > 0);
  await page.unroute('**/thumbnails/osiris.webp');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(base);
  assert.equal(await page.locator('.reveal-pending').count(), 0);
  const noScript = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await noScript.newPage();
  await staticPage.goto(base + 'projects.html');
  assert.equal(await staticPage.locator('.proj-card:visible').count(), 8);
  assert.equal(await staticPage.locator('.project-title-link').count(), 8);
  assert.equal(await staticPage.locator('.explorer-toolbar').isVisible(), false);
  assert.deepEqual(errors, []);
  await browser.close();
  console.log('Browser checks passed: responsive routes, filters, URL state, search, reset, keyboard gallery, accordion, reduced motion, and no-JS content.');
})().catch(error => { console.error(error); process.exit(1); });
