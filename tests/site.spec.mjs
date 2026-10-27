import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const playwrightModule = process.env.PLAYWRIGHT_MODULE;
const playwright = await import(
  playwrightModule ? pathToFileURL(playwrightModule).href : "playwright"
);
const { chromium } = playwright.default || playwright;
const site = new URL(process.env.SITE_URL || "http://127.0.0.1:4173/");
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROMIUM_EXECUTABLE_PATH,
});
const errors = [];

try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  page.on("pageerror", (error) => errors.push(error.message));
  const response = await page.goto(site.href, { waitUntil: "networkidle" });
  assert.equal(response.status(), 200, "Homepage should load");
  assert.match(await page.title(), /CogniCraft/i);
  assert.equal(await page.locator("h1").count(), 1, "Use one main heading");
  assert.match(
    await page.locator("body").innerText(),
    /12.*13.*December|12.*December.*13.*December/is,
  );

  const links = await page
    .locator("a[href], img[src], script[src], link[href]")
    .evaluateAll((elements) =>
      elements.map((element) => ({
        tag: element.tagName,
        url: element.href || element.src,
      })),
    );
  for (const { url } of links) {
    const target = new URL(url, site);
    if (target.origin !== site.origin || !/^https?:$/.test(target.protocol))
      continue;
    if (target.pathname === site.pathname && target.hash) {
      assert.ok(
        await page.evaluate(
          (id) => Boolean(document.getElementById(id)),
          decodeURIComponent(target.hash.slice(1)),
        ),
        `Missing anchor ${target.hash}`,
      );
    } else {
      const asset = await page.request.get(target.href);
      assert.ok(
        asset.ok(),
        `Local asset/link failed: ${target.pathname} (${asset.status()})`,
      );
    }
  }
  const stylesheets = await page
    .locator('link[rel="stylesheet"]')
    .evaluateAll((elements) => elements.map((element) => element.href));
  for (const stylesheet of stylesheets) {
    const css = await (await page.request.get(stylesheet)).text();
    for (const match of css.matchAll(/url\(\s*['"]?([^'"\s)]+)['"]?\s*\)/g)) {
      const target = new URL(match[1], stylesheet);
      if (target.origin !== site.origin) continue;
      const asset = await page.request.get(target.href);
      assert.ok(
        asset.ok(),
        `Stylesheet asset failed: ${target.pathname} (${asset.status()})`,
      );
    }
  }
  assert.equal(
    await page
      .locator("img")
      .evaluateAll(
        (images) =>
          images.filter(
            (image) =>
              image.loading !== "lazy" &&
              (!image.complete || image.naturalWidth === 0),
          ).length,
      ),
    0,
    "Eager images should render",
  );

  const motion = page.locator("#motion-toggle");
  await motion.click();
  assert.equal(await motion.getAttribute("aria-pressed"), "true");
  assert.ok(
    await page
      .locator("body")
      .evaluate((element) => element.classList.contains("motion-paused")),
    "Pause should stop animation",
  );
  await motion.click();
  assert.equal(await motion.getAttribute("aria-pressed"), "false");
  assert.equal(
    await page
      .locator("body")
      .evaluate((element) => element.classList.contains("motion-paused")),
    false,
    "Resume should restore animation",
  );

  const tabs = page.getByRole("tab");
  assert.equal(await tabs.count(), 2, "Programme should have two day tabs");
  for (let index = 0; index < 2; index++) {
    const tab = tabs.nth(index);
    await tab.click();
    assert.equal(await tab.getAttribute("aria-selected"), "true");
    const panelId = await tab.getAttribute("aria-controls");
    assert.ok(panelId, "Day tab should identify its panel");
    assert.ok(
      await page.locator(`[id="${panelId}"]`).isVisible(),
      "Selected day should be visible",
    );
  }
  await tabs.nth(0).focus();
  await page.keyboard.press("ArrowRight");
  assert.equal(
    await tabs.nth(1).getAttribute("aria-selected"),
    "true",
    "Day tabs should support keyboard navigation",
  );

  const firstQuestion = page.locator("details").first();
  assert.ok(await firstQuestion.count(), "FAQ should exist");
  await firstQuestion.locator("summary").click();
  assert.ok(
    await firstQuestion.evaluate((element) => element.open),
    "FAQ should expand",
  );
  await firstQuestion.locator("summary").click();
  assert.equal(
    await firstQuestion.evaluate((element) => element.open),
    false,
    "FAQ should collapse",
  );

  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
      `Horizontal overflow at ${width}px`,
    );
  }

  await page.setViewportSize({ width: 390, height: 844 });
  const menu = page.getByRole("button", { name: /menu/i }).first();
  assert.ok(await menu.isVisible(), "Mobile menu should be available");
  await menu.click();
  assert.equal(await menu.getAttribute("aria-expanded"), "true");
  await page.keyboard.press("Escape");
  assert.equal(
    await menu.getAttribute("aria-expanded"),
    "false",
    "Escape should close mobile menu",
  );
  await menu.click();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Programme" })
    .click();
  assert.equal(
    await menu.getAttribute("aria-expanded"),
    "false",
    "Navigation selection should close mobile menu",
  );

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForFunction(
    () => document.querySelector("#motion-toggle").disabled,
  );
  assert.ok(
    await motion.isDisabled(),
    "Reduced motion control should be disabled",
  );
  assert.match(await motion.innerText(), /Reduced motion enabled/);
  const moving = await page.locator("body *").evaluateAll((elements) =>
    elements
      .filter((element) => {
        const style = getComputedStyle(element);
        return (
          style.animationName !== "none" &&
          style.animationPlayState !== "paused" &&
          style.animationDuration
            .split(",")
            .some((value) => parseFloat(value) > 0.01)
        );
      })
      .map((element) => element.className),
  );
  assert.deepEqual(
    moving,
    [],
    "Reduced motion should stop decorative animation",
  );
  assert.deepEqual(errors, [], "No uncaught browser errors");

  if (process.env.SCREENSHOT_DIR) {
    await mkdir(process.env.SCREENSHOT_DIR, { recursive: true });
    await page.screenshot({
      path: `${process.env.SCREENSHOT_DIR}/mobile.png`,
      fullPage: true,
    });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: `${process.env.SCREENSHOT_DIR}/mobile-hero.png`,
    });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await tabs.nth(0).click();
    await page.screenshot({
      path: `${process.env.SCREENSHOT_DIR}/desktop.png`,
      fullPage: true,
    });
    for (const [name, selector] of Object.entries({
      hero: "#home",
      programme: "#programme",
      partners: "#partners",
      footer: "footer",
    })) {
      if (name === "hero") await page.evaluate(() => window.scrollTo(0, 0));
      else
        await page
          .locator(selector)
          .evaluate((element) =>
            element.scrollIntoView({ block: "start", behavior: "instant" }),
          );
      await page.screenshot({
        path: `${process.env.SCREENSHOT_DIR}/${name}.png`,
      });
    }
  }
  console.log(
    "PASS: content, local assets and fonts, anchors, day tabs, FAQ, mobile menu, responsive widths, pause/resume, reduced motion, browser errors",
  );
} finally {
  await browser.close();
}
