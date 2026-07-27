const { test, expect } = require('@playwright/test');

const appPath = '/examples/apartment-dimensions/';
const viewports = [
  { width: 320, height: 568 },
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 412, height: 915 },
  { width: 768, height: 1024 },
  { width: 844, height: 390 }
];

async function openApp(page, viewport = viewports[2]) {
  await page.setViewportSize(viewport);
  await page.goto(appPath);
  await expect(page.locator('#viewport')).toBeVisible();
  await expect(page.locator('.marker').first()).toBeVisible();
}

function intersects(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

test('main dimension flow persists after reload', async ({ page }) => {
  await openApp(page);
  await page.locator('.marker').first().click();
  await expect(page.locator('#editor')).toBeVisible();
  await page.locator('#value').fill('1234');
  await page.locator('#editorForm button[type="submit"]').click();
  await expect(page.locator('.marker').first().locator('text')).toHaveText('1234');
  await page.reload();
  await expect(page.locator('.marker').first().locator('text')).toHaveText('1234');
});

test('visible interactive controls do not overlap on required viewports', async ({ page }) => {
  for (const viewport of viewports) {
    await openApp(page, viewport);
    const controls = page.locator('button:visible, input:visible, label[for]:visible, [role="button"]:visible');
    const count = await controls.count();
    const boxes = [];
    for (let i = 0; i < count; i++) {
      const box = await controls.nth(i).boundingBox();
      if (box) boxes.push({ index: i, box });
    }
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        expect(intersects(boxes[i].box, boxes[j].box), `controls ${boxes[i].index} and ${boxes[j].index} overlap at ${viewport.width}x${viewport.height}`).toBeFalsy();
      }
    }
  }
});

test('editor stays inside the visual viewport', async ({ page }) => {
  for (const viewport of viewports) {
    await openApp(page, viewport);
    await page.locator('.marker').first().click();
    const box = await page.locator('#editor').boundingBox();
    expect(box).not.toBeNull();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);
    await page.keyboard.press('Escape');
  }
});

test('exported SVG covers placeholders with opaque backgrounds', async ({ page }) => {
  await openApp(page);
  await page.locator('.marker').first().click();
  await page.locator('#value').fill('987');
  await page.locator('#editorForm button[type="submit"]').click();

  const downloadPromise = page.waitForEvent('download');
  await page.locator('#exportSvg').click();
  const download = await downloadPromise;
  const path = await download.path();
  const fs = require('node:fs');
  const svg = fs.readFileSync(path, 'utf8');

  expect(svg).toContain('<rect');
  expect(svg).toContain('fill="#ffffff"');
  expect(svg).toContain('>987</text>');
  expect(svg).not.toMatch(/>\?<\/text>/);
});

test('main flow has no uncaught errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await openApp(page);
  await page.locator('.marker').first().click();
  await page.locator('#value').fill('500');
  await page.locator('#editorForm button[type="submit"]').click();
  await page.locator('#fit').click();
  expect(errors).toEqual([]);
});
