# TechX CogniCraft 2026

The event website for 12–13 December 2026 at Rajagiri School of Engineering & Technology and aboard the Kochi Water Metro. The site uses the organisers’ November campaign posters as its visual reference. The blue contact footer retains its original line-drawn waterfront and looping ferry.

[Production site](https://techxcognicraft.vercel.app/) · [GitHub Pages](https://robinfrancis186.github.io/cognicraft/)

## Running locally

Run `python3 -m http.server 4173 --bind 127.0.0.1` and open http://127.0.0.1:4173/. The website is static and has no build step.

Edit the event information and partner credits in `index.html`, the layout in `styles.css`, and menu, keyboard tabs or motion controls in `script.js`. Without JavaScript, the navigation and both programme days are available. The pause controls and operating-system reduced-motion setting apply to the hero harbour scene, artwork window indicator and footer ferry.

## Event sources

The organisers confirmed free admission, one night at Rajagiri and arranged transport to the Water Metro. Times and sessions are planned. The boarding terminal, route and final presentation venue are to be announced. The public contacts come from the event poster. The private proposal stays outside the public repository.

Registration links follow the QR code and printed URL in the 15 November registration poster. The linked Luma listing is titled **Manus Fellow Event | Water Metro Edition** and accepts requests subject to approval. No attendee information is collected on this static site.

## Artwork and typography

The campaign TechX mark, IEEE CS SYP Activities and IEEE marks, and Manus Fellow credit are taken from the supplied posters. The Kerala ATII logo was supplied separately. Other partner marks come from the [IEEE CS SYP website](https://syp.computer.org/), [Rajagiri](https://rajagiritech.ac.in/home/images/logon.png), [FOSS United](https://fossunited.org/) and [IEEE Signal Processing Society](https://signalprocessingsociety.org/our-story/sps-branding-materials). Add only confirmed organisations and describe each logo with alt text.

Jersey 10 and DM Sans are self-hosted under the SIL Open Font License. See `assets/FONT-JERSEY-LICENSE.txt` and `assets/FONT-LICENSE.txt`.

The hero is a line illustration of Kochi with CSS animation. Its static link preview is `assets/kochi-harbour-preview.png`. The host photograph, [RajagiriCampus.jpg by Nairkdgvr](https://commons.wikimedia.org/wiki/File:RajagiriCampus.jpg), is served as `assets/rset-kochi-campus.webp` under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). It has been converted to WebP and is cropped to fit the venue frame.

Both programme images are 3D event concepts. The Day One image, `assets/day-one-workshop.webp`, was made with built-in ImageGen. Day Two shows the buildathon aboard the ferry.

<details><summary>Day One workshop generation prompt</summary>

Use case: stylized-concept. Asset type: professional event website Day One programme illustration, horizontal cinematic panorama, exactly 3:1 aspect ratio, 3072x1024. Create a fresh realistic high-end 3D editorial rendering of a small indoor university makerspace workshop in Kerala, India. One cohesive intimate camera angle at tabletop eye level, medium-wide composition. Three adult Indian engineering students collaborate calmly around one real, believable 3D-printed assistive prototype at the center of a wooden workbench: a cream-white printed adaptive grip for holding an everyday spoon, with clearly visible printed layers, smooth rounded form and a simple purple adjustable strap. A young woman at center carefully holds the prototype; a student to her right leans in and points to its printed mechanism, another to her left studies it. All hands anatomically believable with normal fingers, no confusing overlapping arms. A compact enclosed desktop FDM 3D printer sits beside the team on the workbench with a small reel of filament, tidy tools, calipers and an open unbranded laptop showing simple unlabeled geometric CAD. Soft warm Kerala afternoon light enters through tall windows, out-of-focus palms visible beyond, muted terracotta and cream interior, natural wood, subtle teal and cobalt accents. The central collaborative group and assistive prototype must remain fully legible in a centered mobile crop; keep incidental equipment toward the sides. Beautiful tactile materials, editorial art direction, physically plausible soft shadows, professionally composed, gentle depth of field without losing prototype detail. One workshop scene only, no montage, no sunny outdoor campus scene, no panel discussion, no crowds, no futuristic holograms, no toy-like caricatures. No text, no letters, no numbers, no logos, no UI overlays, no watermark. Clearly an illustrated 3D event concept, not a claim to documentary photography.

</details>

## Checking and publishing

With Playwright and Chromium available, run `SITE_URL=http://127.0.0.1:4173/ node tests/site.spec.mjs`. Use `PLAYWRIGHT_MODULE` and `CHROMIUM_EXECUTABLE_PATH` for local installations or `SCREENSHOT_DIR` to retain screenshots. The suite checks registration links, partner logos, image and font loading, both programme days, FAQs, keyboard navigation, responsive layouts, reduced motion and the footer voyage.

Push to `main` to publish to the linked Vercel project and GitHub Pages. The Pages workflow publishes only the static website and allowed assets.
