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

  const reveals = page.locator(".reveal");
  assert.ok(await reveals.count(), "Page should include scroll reveals");
  for (const reveal of await reveals.all()) {
    if (!(await reveal.isVisible())) continue;
    await reveal.evaluate((element) =>
      element.scrollIntoView({ block: "center", behavior: "instant" }),
    );
    await page.waitForFunction(
      (element) => Number(getComputedStyle(element).opacity) >= 0.99,
      await reveal.elementHandle(),
    );
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));

  const motion = page.locator("#motion-toggle");
  await motion.click();
  assert.equal(await motion.getAttribute("aria-pressed"), "true");
  assert.ok(
    await page
      .locator("body")
      .evaluate((element) => element.classList.contains("motion-paused")),
    "Pause should stop animation",
  );
  await page
    .locator("#partners")
    .evaluate((element) =>
      element.scrollIntoView({ block: "start", behavior: "instant" }),
    );
  assert.deepEqual(
    await page.evaluate(() =>
      document
        .getAnimations()
        .filter((animation) => animation.playState === "running")
        .map((animation) => animation.constructor.name),
    ),
    [],
    "Paused motion should prevent animation when scrolling",
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
    assert.ok(
      await page.locator(`[id="${panelId}"] .journey-art`).isVisible(),
      "Selected day should show its journey artwork",
    );
    const artwork = page.locator(`[id="${panelId}"] .journey-art img`);
    await artwork.scrollIntoViewIfNeeded();
    await artwork.evaluate((image) => image.decode());
    assert.ok(
      await artwork.evaluate((image) => image.naturalWidth > 0),
      "Journey artwork should finish loading",
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
    .getByRole("navigation", { name: "Main navigation" })
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
  await page
    .locator("#partners")
    .evaluate((element) =>
      element.scrollIntoView({ block: "start", behavior: "instant" }),
    );
  assert.deepEqual(
    await page.evaluate(() =>
      document
        .getAnimations()
        .filter((animation) => animation.playState === "running")
        .map((animation) => animation.constructor.name),
    ),
    [],
    "Reduced motion should prevent animation when scrolling",
  );
  assert.deepEqual(errors, [], "No uncaught browser errors");

  for (const mode of ["paused", "reduced"]) {
    const fresh = await browser.newPage({
      reducedMotion: mode === "reduced" ? "reduce" : "no-preference",
    });
    await fresh.goto(site.href, { waitUntil: "networkidle" });
    if (mode === "paused") await fresh.locator("#motion-toggle").click();
    await fresh
      .locator("#partners")
      .evaluate((element) =>
        element.scrollIntoView({ block: "start", behavior: "instant" }),
      );
    await fresh.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    );
    assert.deepEqual(
      await fresh.evaluate(() =>
        document
          .getAnimations()
          .filter((animation) => animation.playState === "running")
          .map((animation) => animation.constructor.name),
      ),
      [],
      `Fresh ${mode} page should not start new motion when reaching unrevealed content`,
    );
    await fresh.close();
  }

  const noScript = await browser.newPage({ javaScriptEnabled: false });
  await noScript.goto(site.href, { waitUntil: "networkidle" });
  assert.deepEqual(
    await noScript
      .locator("main h2, main h3, .journey-art")
      .evaluateAll((elements) =>
        elements
          .filter(
            (element) =>
              !element.checkVisibility({
                opacityProperty: true,
                visibilityProperty: true,
              }),
          )
          .map((element) => element.id || element.textContent.trim()),
      ),
    [],
    "Scroll-reveal content should remain visible without JavaScript",
  );
  assert.ok(
    await noScript.locator("#day-1").isVisible(),
    "Day one should be readable without JavaScript",
  );
  assert.ok(
    await noScript.locator("#day-2").isVisible(),
    "Day two should be readable without JavaScript",
  );
  await noScript.close();

  const footerPage = await browser.newPage();
  await footerPage.goto(site.href, { waitUntil: "networkidle" });
  const footerMotion = footerPage.locator("footer [data-motion-toggle]");
  assert.match(
    await footerPage.locator(".footer-ferry").getAttribute("src"),
    /drawn-water-metro\.svg$/,
    "Footer ferry should use the drawn artwork",
  );
  for (const width of [1440, 390]) {
    await footerPage.setViewportSize({ width, height: 900 });
    await footerPage.locator("footer").scrollIntoViewIfNeeded();
    const voyage = await footerPage
      .locator(".footer-ferry-route")
      .evaluate((route) => {
        const animation = route
          .getAnimations()
          .find((item) => item.effect.target === route);
        if (!animation) throw new Error("Footer route has no CSS animation");
        const bob = route.querySelector(".footer-ferry-bob");
        if (!bob?.getAnimations().some((item) => item.effect.target === bob))
          throw new Error("Footer bob should animate independently");
        const scene = route.closest(".footer-water").getBoundingClientRect();
        const duration = Number(animation.effect.getTiming().duration);
        const previousTime = animation.currentTime;
        const positions = [];
        animation.pause();
        for (const progress of [0, 0.5, 0.999999]) {
          animation.currentTime = duration * progress;
          const ferry = route
            .querySelector(".footer-ferry")
            .getBoundingClientRect();
          positions.push({
            left: ferry.left,
            right: ferry.right,
            centre: (ferry.left + ferry.right) / 2,
          });
        }
        animation.currentTime = previousTime;
        animation.play();
        return {
          positions,
          scene: { left: scene.left, right: scene.right, width: scene.width },
        };
      });
    assert.ok(
      voyage.positions[0].right <= voyage.scene.left + 1,
      `Footer ferry should start fully off-left at ${width}px`,
    );
    assert.ok(
      Math.abs(
        voyage.positions[1].centre -
          (voyage.scene.left + voyage.scene.width / 2),
      ) <=
        voyage.scene.width * 0.1,
      `Footer ferry should cross the scene centre at ${width}px`,
    );
    assert.ok(
      voyage.positions[2].left >= voyage.scene.right - 1,
      `Footer ferry should finish fully off-right at ${width}px`,
    );
  }
  await footerPage.reload({ waitUntil: "networkidle" });
  await footerMotion.click();
  assert.equal(
    await footerPage.locator("#motion-toggle").getAttribute("aria-pressed"),
    "true",
    "Footer pause should sync the hero control",
  );
  assert.equal(await footerMotion.getAttribute("aria-pressed"), "true");
  const pausedVoyage = await footerPage
    .locator(".footer-ferry-route")
    .evaluate(async (route) => {
      const before = route
        .querySelector(".footer-ferry")
        .getBoundingClientRect()
        .toJSON();
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );
      const after = route
        .querySelector(".footer-ferry")
        .getBoundingClientRect()
        .toJSON();
      return {
        before,
        after,
        running: route
          .getAnimations({ subtree: true })
          .filter((animation) => animation.playState === "running").length,
      };
    });
  assert.equal(
    pausedVoyage.running,
    0,
    "Pause should freeze footer travel and bobbing",
  );
  assert.deepEqual(
    pausedVoyage.after,
    pausedVoyage.before,
    "Paused footer should remain still across frames",
  );
  await footerMotion.click();
  assert.equal(
    await footerPage.locator("#motion-toggle").getAttribute("aria-pressed"),
    "false",
    "Footer resume should sync the hero control",
  );
  await footerPage.emulateMedia({ reducedMotion: "reduce" });
  await footerPage.waitForFunction(
    () => document.querySelector("footer [data-motion-toggle]").disabled,
  );
  assert.match(await footerMotion.innerText(), /Reduced motion enabled/);
  assert.deepEqual(
    await footerPage.locator(".footer-ferry-route").evaluate((route) =>
      route
        .getAnimations({ subtree: true })
        .filter((animation) => animation.playState === "running")
        .map((animation) => animation.constructor.name),
    ),
    [],
    "Reduced motion should freeze footer travel and bobbing",
  );
  if (process.env.SCREENSHOT_DIR) {
    await mkdir(process.env.SCREENSHOT_DIR, { recursive: true });
    await footerPage.emulateMedia({ reducedMotion: "no-preference" });
    await footerPage.waitForFunction(
      () => !document.querySelector("footer [data-motion-toggle]").disabled,
    );
    for (const [name, width] of [
      ["desktop-footer", 1440],
      ["mobile-footer", 390],
    ]) {
      await footerPage.setViewportSize({ width, height: 900 });
      await footerPage.locator(".footer-ferry-route").evaluate((route) => {
        for (const animation of route.getAnimations({ subtree: true })) {
          animation.pause();
          if (animation.effect.target === route)
            animation.currentTime =
              Number(animation.effect.getTiming().duration) * 0.75;
        }
      });
      await footerPage
        .locator("footer")
        .screenshot({ path: `${process.env.SCREENSHOT_DIR}/${name}.png` });
    }
  }
  await footerPage.close();

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
    "PASS: content, local assets and fonts, anchors, reveals, no-JS fallback, day tabs and artwork, FAQ, mobile menu, responsive widths, footer voyage, pause/resume, reduced motion, browser errors",
  );
} finally {
  await browser.close();
}
