const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
      addEventListener('pagereveal', event => { window.hadPageTransition = Boolean(event.viewTransition); });
    });
    await page.goto('http://127.0.0.1:4173/');
    assert.deepEqual(await page.locator('.project-title-link').allTextContents(), ['NovelNest','Curse of Osiris','eCommerce Dashboard','742 Blackwood Lane']);
    await page.locator('.hero-actions .btn-primary').click();
    await page.waitForURL('**/projects.html');
    await page.waitForFunction(() => window.hadPageTransition === true);
    await page.getByRole('button', { name: 'Game design' }).click();
    assert.equal(await page.locator('.proj-card:visible').count(), 3);
    assert.ok(await page.locator('.proj-card:visible').evaluateAll(cards => cards.some(card => card.getAnimations().length > 0)));
    await page.goBack();
    await page.waitForURL('http://127.0.0.1:4173/');
    assert.equal(await page.locator('.project-title-link').count(), 4);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('http://127.0.0.1:4173/projects.html');
    await page.getByRole('button', { name: 'Game design' }).click();
    assert.equal(await page.evaluate(() => document.getAnimations().filter(animation => animation.playState === 'running').length), 0);
    await page.getByRole('button', { name: 'Menu' }).click();
    assert.equal(await page.locator('.site-links').isVisible(), true);
    assert.equal(await page.evaluate(() => document.getAnimations().filter(animation => animation.playState === 'running').length), 0);
    assert.deepEqual(errors, []);
    console.log('Passed: requested featured projects, native page transitions, animated filters, browser Back, reduced motion, and mobile menu.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
