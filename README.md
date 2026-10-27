# TechX CogniCraft 2026

A responsive, build-free event website for 12–13 December 2026 in Kochi. Includes an animated Water Metro, accessible two-day programme tabs, organisers, partnership levels, venue information and FAQs.

**Website:** https://robinfrancis186.github.io/cognicraft/

## Run locally

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open http://127.0.0.1:4173/. No dependencies or build step are needed.

## Update the website

- `index.html`: event copy, dates, schedule, contacts, sponsorship levels and partner logos.
- `styles.css`: colours, responsive layout, typography and motion.
- `script.js`: mobile menu, keyboard-accessible programme tabs and motion control.
- `assets/`: self-hosted fonts, supplied chapter logo, generated waterfront and ferry imagery, and native skyline illustration.

Add confirmed partner logo images inside `#partner-logos`, with meaningful alt text. Remove the invitation placeholder when logos are available. Do not list proposed industry representation as confirmed sponsors.

The design uses ice `#eef5ff`, cobalt `#234cf5`, ink `#071a46` and mint `#b6f0f0`, with DM Sans typography. The waterfront is an artistic illustration of Kochi; it does not establish the actual cruise route or terminal.

The supplied follow-up references inform newly generated 3D-rendered campus and ferry artwork, and provide the TechX blueprint wordmark and paper-cut Kochi waterfront. The two programme renders use realistic adult figures without embedded labels. These are rendered visual concepts, not interactive 3D models. The inclusion card uses an editable dimensional ribbon sculpture SVG. The programme combines them with a subtle blueprint grid; the venue artwork includes gently moving wave layers. Scroll reveals, day-switch artwork transitions and the rotating hero star respect both the pause control and operating-system reduced-motion preferences. Reveal content remains visible without JavaScript; both programme days are available in that fallback.

## Source and publication notes

The supplied event poster is the source for 12–13 December 2026, the public telephone contacts and sponsorship tiers. The proposal is the source for the planned programme, tracks and organisers. Programme timings and sessions remain subject to organiser confirmation. The organiser has confirmed that the event is free and residential, with one night at Rajagiri and transport to the Kochi Water Metro arranged by the organising team. Registrations are not open yet and will be available on this website when they open. The cruise terminal, route and final presentation venue remain to be announced.

The original proposal is deliberately excluded because it contains IEEE member IDs and internal budget information. Partner marks must be added only after confirmation. No participant data is collected by this site.

The source assets were supplied by the organiser. DM Sans is distributed under the SIL Open Font License in `assets/FONT-LICENSE.txt`. Waterfront and transparent ferry imagery were made with the built-in image-generation tool. Prompts: an atmospheric Kochi waterfront with bridge and palms, no text or boats; and a transparent three-quarter Kochi Water Metro ferry in white, blue, magenta and purple. The skyline and footer ferry are editable SVG line drawings. The footer ferry travels fully off-screen at both ends of its continuous loop, with an independent gentle bob; the footer and hero pause controls stay synchronised. Reduced motion presents a stationary ferry.

Design references: [Northlight editorial event concept](https://dribbble.com/shots/27744710-Editorial-Event-Website), [Smnr conference concept](https://dribbble.com/shots/27423640-Smnr-Design-Conference-Landing-Page), and [/nk.studio Awwwards Amsterdam](https://www.nk.studio/work/awwwards-conf-amsterdam). The website uses original implementation and imagery.

## Deploy

Push to `main`. `.github/workflows/pages.yml` publishes an allowlisted static artifact through GitHub Pages. Repository Settings → Pages must use **GitHub Actions**. The workflow includes only website files and assets, keeping tests and documentation out of the deployed artifact.

## Browser smoke check

With Playwright and a compatible Chromium installed:

```sh
SITE_URL=http://127.0.0.1:4173/ node tests/site.spec.mjs
```

`PLAYWRIGHT_MODULE` can point to an existing `playwright/index.js`; `CHROMIUM_EXECUTABLE_PATH` can select an installed Chromium executable. `SCREENSHOT_DIR` optionally saves browser screenshots. Checks cover assets, anchors, dates, programme tabs and keyboard controls, FAQs, mobile menu, reduced motion, 320–1440px overflow and browser errors.

Programme-art prompt set (built-in image generation): a text-free architectural 3D campus innovation scene with realistic adult collaborators, a wheelchair user, 3D prototyping and an outdoor panel; and a matching text-free 3D passenger ferry scene with realistic adult teams working on board at golden hour. Both use the supplied images as composition references, with freshly rendered people, materials and lighting. Final assets: `assets/day-one-campus-3d-v2.webp` and `assets/day-two-afloat-3d-v2.webp`.
