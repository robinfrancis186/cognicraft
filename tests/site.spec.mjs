import assert from "node:assert/strict";
import { mkdir, readFile } from "node:fs/promises";
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
  const backgroundRequests = [];
  page.on("request", (request) => {
    if (/\/kochi-engraved-harbour(?:-mobile)?\.webp$/.test(new URL(request.url()).pathname))
      backgroundRequests.push(request.url());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  const response = await page.goto(site.href, { waitUntil: "networkidle" });
  assert.equal(response.status(), 200, "Homepage should load");
  assert.match(await page.title(), /CogniCraft/i);
  assert.equal(await page.locator("h1").count(), 1, "Use one main heading");
  assert.match(await page.locator("h1").innerText(), /CogniCraft/i, "Poster hero should identify the event");
  assert.match(
    await page.locator("body").innerText(),
    /12.*13.*December|12.*December.*13.*December/is,
  );
  assert.doesNotMatch(
    await page.locator("body").innerText(),
    /membership\s+benefits/i,
    "Programme should omit the membership benefits copy",
  );
  assert.equal(
    (await page.locator("body").textContent()).includes("\u2014"),
    false,
    "Site copy should not contain em dashes",
  );
  assert.match(await page.locator(".hero-copy").innerText(), /solo|individual/i, "Hero should explain solo participation");
  assert.match(await page.locator("#day-1").innerText(), /solo|individual/i, "Day one should describe individual preparation");
  assert.doesNotMatch(await page.locator("body").textContent(), /team[\s-]*formation|your\s+team|form(?:ing)?\s+(?:a\s+)?team/i, "Programme copy should not require forming a team");
  const soloFaq = page.locator("details").filter({ has: page.locator("summary").filter({ hasText: /solo|individual|teams?/i }) });
  assert.equal(await soloFaq.count(), 1, "FAQ should explain how solo participation works");
  await soloFaq.locator("summary").click();
  assert.match(await soloFaq.locator("p").innerText(), /solo|individual/i, "Participation FAQ should confirm individual entry");
  await soloFaq.locator("summary").click();
  assert.equal(await page.locator('img[src="assets/manus-fellow-credit.webp"]').count(), 2, "Both Manus credits should be present");
  const manusLinks = page.locator('a[href="https://manus.im/"]').filter({ has: page.locator('img[src="assets/manus-fellow-credit.webp"]') });
  assert.equal(await manusLinks.count(), 2, "Both Manus credits should link to Manus");
  for (const link of await manusLinks.all()) {
    await link.focus();
    assert.ok(await link.evaluate((element) => element === document.activeElement && element.tabIndex >= 0), "Manus credit link should receive keyboard focus");
    await link.evaluate((element) => {
      window.manusActivation = null;
      element.addEventListener("click", (event) => { event.preventDefault(); window.manusActivation = element.href; }, { once: true });
    });
    await page.keyboard.press("Enter");
    assert.equal(await page.evaluate(() => window.manusActivation), "https://manus.im/", "Enter should activate the Manus credit link");
  }
  const harbour = page.locator(".harbour-window svg.harbour-art");
  assert.equal(await harbour.getAttribute("role"), "img", "Animated harbour should have image semantics");
  const harbourLabel = await harbour.evaluate((svg) => svg.getAttribute("aria-label") || (svg.getAttribute("aria-labelledby") || "").split(/\s+/).map((id) => document.getElementById(id)?.textContent || "").join(" "));
  assert.match(harbourLabel, /Kochi|Water Metro/i, "Animated harbour should have a descriptive accessible label");
  const background = page.locator(".harbour-viewport picture img.harbour-engraved-background");
  await background.evaluate((image) => image.decode());
  assert.ok(
    (await background.evaluate((image) => image.currentSrc)).endsWith(
      "/assets/kochi-engraved-harbour.webp",
    ),
    "Desktop should load the full harbour background",
  );
  assert.equal(
    backgroundRequests.length,
    1,
    "Desktop should request its selected background only once",
  );
  const mobileHero = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const mobileBackgroundRequests = [];
  mobileHero.on("request", (request) => {
    if (/\/kochi-engraved-harbour(?:-mobile)?\.webp$/.test(new URL(request.url()).pathname))
      mobileBackgroundRequests.push(request.url());
  });
  await mobileHero.goto(site.href, { waitUntil: "networkidle" });
  const mobileBackground = mobileHero.locator("picture img.harbour-engraved-background");
  await mobileBackground.evaluate((image) => image.decode());
  assert.ok(
    (await mobileBackground.evaluate((image) => image.currentSrc)).endsWith(
      "/assets/kochi-engraved-harbour-mobile.webp",
    ),
    "Mobile should load its optimized background",
  );
  assert.equal(
    mobileBackgroundRequests.length,
    1,
    "Mobile should request only one background without downloading the desktop fallback",
  );
  assert.ok(mobileBackgroundRequests[0].endsWith("/assets/kochi-engraved-harbour-mobile.webp"));
  await mobileHero.close();
  const sceneImages = harbour.locator("image");
  assert.equal(
    await sceneImages.count(),
    1,
    "Animated SVG should load the ferry above its separate responsive background",
  );
  for (const layer of await sceneImages.all()) {
    await layer.evaluate(async (element) => {
      const image = new Image();
      image.src = element.href.baseVal;
      await image.decode();
    });
  }
  const heroMovement = await harbour.locator(".harbour-ferry-route").evaluate(async (route) => {
    const before = getComputedStyle(route).transform;
    const running = route.getAnimations().some((animation) => animation.playState === "running");
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    return { before, after: getComputedStyle(route).transform, running };
  });
  assert.ok(heroMovement.running, "Hero ferry should travel by default");
  assert.notEqual(heroMovement.after, heroMovement.before, "Hero ferry should visibly move across frames");
  for (const selector of [".harbour-ferry-bob", ".harbour-ripple"]) {
    assert.ok(await harbour.locator(selector).first().evaluate((element) => element.getAnimations().some((animation) => animation.playState === "running")), `Hero ${selector} should animate independently`);
  }
  const tracks = page.locator(".arc-track-grid article");
  assert.equal(await tracks.count(), 2, "Experience should offer two innovation tracks");
  assert.match(
    await tracks.nth(0).getByRole("heading").innerText(),
    /Software-Based\s+Solutions/i,
  );
  assert.match(
    await tracks.nth(1).getByRole("heading").innerText(),
    /Physical-Based\s+Solutions/i,
  );
  for (const track of await tracks.all()) {
    assert.equal(
      await track.locator(".arc-track-example").count(),
      1,
      "Each track should include a concrete solo project example",
    );
    assert.match(await track.locator(".arc-track-example").innerText(), /solo\s+project/i);
  }
  const trackGoal = await page.locator(".arc-track-goal").innerText();
  for (const concept of [/cognitive assistive/i, /affordable/i, /accessible/i, /scalable/i])
    assert.match(
      trackGoal,
      concept,
      "Shared track goal should explain inclusive, practical assistive technology",
    );
  assert.equal(await page.locator(".hero-actions .ticket-link").getAttribute("href"), "https://luma.com/opt4pve5", "Primary registration CTA should open the event on Luma");
  assert.ok(await page.locator('a[href="https://luma.com/opt4pve5"]').count() >= 3, "Registration should be available from the header, hero and attendee information");
  for (const cta of await page
    .locator(".mast-register, .hero-actions .ticket-link, .cog-faq-heading > a")
    .all())
    assert.match(
      (await cta.getAttribute("aria-label")) || (await cta.innerText()),
      /request.*join/i,
      "Registration CTAs should communicate the request-to-join flow",
    );
  assert.match(await page.locator(".fact-strip").innerText(), /Free\s*&\s*residential/i);
  await page.locator("#partners").scrollIntoViewIfNeeded();
  for (const file of ["ieee-cs-syp-activities.webp", "ieee-kerala-atii.jpg", "foss-united.svg", "ieee-sps.png", "ieee-official-poster.webp", "ieee-cs-techx.png", "manus-fellow-credit.webp", "rset-official.png"]) {
    const logo = page.locator(`#partners img[src="assets/${file}"]`);
    assert.equal(await logo.count(), 1, `Partner credits should include ${file}`);
    assert.ok((await logo.getAttribute("alt"))?.trim(), `Partner logo ${file} needs an accessible label`);
    await logo.scrollIntoViewIfNeeded();
    await logo.evaluate((image) => image.decode());
    assert.ok(await logo.evaluate((image) => image.naturalWidth > 0), `Partner logo ${file} should decode`);
  }
  assert.equal(await page.locator(".cog-sponsor-intro, .cog-sponsor-levels").count(), 0, "Sponsorship sales blocks should be absent");
  assert.doesNotMatch(await page.locator("#partners").innerText(), /₹|sponsorship|platinum|silver|gold/i, "Partner section should show credits without sponsorship pricing");
  const campus = page.locator(".cog-campus img");
  assert.equal(await campus.getAttribute("src"), "assets/rset-kochi-campus.webp", "Venue should use the new Kochi campus photograph");
  await campus.scrollIntoViewIfNeeded();
  await campus.evaluate((image) => image.decode());
  assert.ok(await campus.evaluate((image) => image.naturalWidth > 0), "Campus photograph should decode");
  const arrival = page.locator(".cog-arrival");
  await arrival.scrollIntoViewIfNeeded();
  assert.ok(
    await arrival.isVisible(),
    "Arrival guidance should be visible without opening an FAQ",
  );
  const arrivalCopy = await arrival.innerText();
  for (const detail of [
    /12\s+Dec/i,
    /09:00/,
    /10:00/,
    /IST/,
    /one night|overnight/i,
    /transport|transfer/i,
    /laptop/i,
    /charger/i,
    /announced|TBA|confirm/i,
  ])
    assert.match(
      arrivalCopy,
      detail,
      "Arrival guidance should include practical event arrangements and pending details",
    );
  const accessibility = page.locator(".cog-accessibility");
  assert.match(
    await accessibility.innerText(),
    /accessib|sensory/i,
    "Arrival section should explain how to request accessibility support",
  );
  for (const protocol of ["mailto:", "tel:"]) {
    const contact = accessibility.locator(`a[href^="${protocol}"]`).first();
    await contact.focus();
    assert.ok(
      await contact.evaluate((element) => element === document.activeElement),
      "Arrival support contacts should be keyboard accessible",
    );
  }

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
  const pausedHero = await harbour.evaluate(async (svg) => {
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const elements = [...svg.querySelectorAll(".harbour-ferry-route, .harbour-ferry-bob, .harbour-ripple")];
    const before = elements.map((element) => getComputedStyle(element).transform);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    return { before, after: elements.map((element) => getComputedStyle(element).transform), running: svg.getAnimations({ subtree: true }).filter((animation) => animation.playState === "running").length };
  });
  assert.equal(pausedHero.running, 0, "Pause should freeze all harbour animation");
  assert.deepEqual(pausedHero.after, pausedHero.before, "Paused ferry and water should remain still across frames");
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
      await page.locator(`[id="${panelId}"] .arc-journey-art`).isVisible(),
      "Selected day should show its journey artwork",
    );
    const artwork = page.locator(`[id="${panelId}"] .arc-journey-art img`);
    assert.equal(
      await artwork.getAttribute("src"),
      index === 0 ? "assets/day-one-workshop.webp" : "assets/day-two-afloat-3d-v2.webp",
      "Journey artwork should use the current day-specific asset",
    );
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
    const mapLink = page.locator(".cog-campus-map");
    await mapLink.scrollIntoViewIfNeeded();
    const mapTarget = await mapLink.evaluate((link) => {
      const box = link.getBoundingClientRect();
      const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
      return {
        width: box.width,
        height: box.height,
        clickable: hit === link || link.contains(hit),
      };
    });
    assert.ok(
      mapTarget.width >= 44 && mapTarget.height >= 44,
      `Campus map should have a 44px target at ${width}px`,
    );
    assert.ok(mapTarget.clickable, `Campus map should receive pointer hits at ${width}px`);
    if (width === 320) {
      assert.deepEqual(
        await tracks.evaluateAll((elements) =>
          elements
            .filter((element) => element.scrollWidth > element.clientWidth + 1)
            .map((element) => element.className),
        ),
        [],
        "Track content should fit at 320px",
      );
      assert.ok(
        await tracks
          .locator("p")
          .evaluateAll((paragraphs) =>
            paragraphs.every(
              (paragraph) => parseFloat(getComputedStyle(paragraph).fontSize) >= 14,
            ),
          ),
        "Track descriptions and examples should remain readable at 320px",
      );
      for (const cta of await page.locator(".mast-register, .hero-actions .ticket-link").all()) {
        if (!(await cta.isVisible())) continue;
        const box = await cta.boundingBox();
        assert.ok(
          box.x >= 0 && box.x + box.width <= width + 1 && box.height >= 44,
          "Registration CTAs should remain visible and usable at 320px",
        );
      }
    }
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
  assert.equal(await harbour.evaluate((svg) => svg.getAnimations({ subtree: true }).filter((animation) => animation.playState === "running").length), 0, "Reduced motion should stop ferry and water animation");
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
      .locator("main h2, main h3, main h4, .arc-journey-art")
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
    "Event content should remain visible without JavaScript",
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
    if (process.env.FOOTER_BASELINE_DIR) {
      await footerPage.evaluate(() => document.fonts.ready);
      await footerPage.locator("footer img").evaluateAll((images) => Promise.all(images.map((image) => image.decode())));
      await footerPage.locator(".footer-ferry-route").evaluate((route) => {
        for (const animation of route.getAnimations({ subtree: true })) {
          animation.pause();
          animation.currentTime = animation.effect.target === route ? Number(animation.effect.getTiming().duration) * 0.75 : 0;
        }
      });
      const baseline = JSON.parse(await readFile(`${process.env.FOOTER_BASELINE_DIR}/${width}.json`, "utf8"));
      const layout = await footerPage.locator("footer").evaluate((footer) => {
        const top = footer.getBoundingClientRect().top;
        const properties = ["fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "color", "backgroundColor", "display", "position", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "gap", "borderTopWidth", "borderTopColor", "transform"];
        return [footer, ...footer.querySelectorAll("*")].map((element) => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return {
            tag: element.tagName,
            class: element.className.baseVal ?? element.className,
            text: element.children.length ? undefined : element.textContent.trim(),
            rect: [rect.x, rect.y - top, rect.width, rect.height].map((value) => Math.round(value * 100) / 100),
            style: Object.fromEntries(properties.map((property) => [property, style[property]])),
          };
        });
      });
      assert.equal(layout.length, baseline.length, `Footer structure should match HEAD at ${width}px`);
      for (let index = 0; index < layout.length; index++) {
        const current = layout[index];
        const expected = baseline[index];
        const label = `Footer ${current.class || current.tag} at ${width}px`;
        assert.deepEqual([current.tag, current.class, current.text], [expected.tag, expected.class, expected.text], `${label} markup should match HEAD`);
        assert.deepEqual(current.style, expected.style, `${label} computed styles should match HEAD`);
        assert.ok(current.rect.every((value, axis) => Math.abs(value - expected.rect[axis]) <= 0.05), `${label} box should match HEAD: ${current.rect} vs ${expected.rect}`);
      }
    }
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
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
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
          animation.currentTime = animation.effect.target === route
            ? Number(animation.effect.getTiming().duration) * 0.75
            : 0;
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
      tracks: "#about",
      programme: "#programme",
      partners: "#partners",
      visit: "#visit",
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
    await page.locator(".arc-track-grid").screenshot({ path: `${process.env.SCREENSHOT_DIR}/innovation-tracks.png` });
    for (const [device, width, height] of [["desktop", 1440, 1100], ["mobile", 390, 844]]) {
      await page.setViewportSize({ width, height });
      for (let day = 0; day < 2; day++) {
        await tabs.nth(day).click();
        await page.locator("#programme").evaluate((element) => element.scrollIntoView({ block: "start", behavior: "instant" }));
        await page.screenshot({ path: `${process.env.SCREENSHOT_DIR}/programme-day-${day + 1}-${device}.png` });
      }
    }
    await page.setViewportSize({ width: 320, height: 900 });
    await page
      .locator(".arc-track-grid")
      .screenshot({ path: `${process.env.SCREENSHOT_DIR}/tracks-320.png` });
    await page
      .locator(".cog-arrival")
      .screenshot({ path: `${process.env.SCREENSHOT_DIR}/arrival-320.png` });
    await page
      .locator(".cog-campus figcaption")
      .screenshot({ path: `${process.env.SCREENSHOT_DIR}/campus-map-320.png` });
  }
  console.log(
    "PASS: poster hero, tracks, registration, partner logos, assets and fonts, anchors, no-JS fallback, day tabs and artwork, FAQ, mobile menu, responsive widths, footer preservation and voyage, pause/resume, reduced motion, browser errors",
  );
} finally {
  await browser.close();
}
