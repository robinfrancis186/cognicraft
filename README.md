# TechX CogniCraft 2026

The event website for 12–13 December 2026 at Rajagiri School of Engineering & Technology and aboard the Kochi Water Metro. The site uses the organisers’ November campaign posters as its visual reference. The blue contact footer retains its original line-drawn waterfront and looping ferry.

[Production site](https://techxcognicraft.vercel.app/) · [GitHub Pages](https://robinfrancis186.github.io/cognicraft/)

## Running locally

Run `python3 -m http.server 4173 --bind 127.0.0.1` and open http://127.0.0.1:4173/. The website is static and has no build step.

Edit the event information and partner credits in `index.html`, the layout in `styles.css`, and menu, keyboard tabs or motion controls in `script.js`. Without JavaScript, the navigation and both programme days are available. The pause controls and operating-system reduced-motion setting apply to the footer ferry and artwork window indicator.

## Event sources

The organisers confirmed free admission, one night at Rajagiri and arranged transport to the Water Metro. Times and sessions are planned. The boarding terminal, route and final presentation venue are to be announced. The approved sponsorship tiers and public contacts come from the event poster. The private proposal stays outside the public repository.

Registration links follow the QR code and printed URL in the 15 November registration poster. The linked Luma listing is titled **Manus Fellow Event | Water Metro Edition** and accepts requests subject to approval. No attendee information is collected on this static site.

## Artwork and typography

The campaign TechX mark, IEEE CS SYP Activities and IEEE marks, Manus Fellow credit and RSET campus photograph are taken from the supplied posters. The Kerala ATII logo was supplied separately. Other partner marks come from the [IEEE CS SYP website](https://syp.computer.org/), [Rajagiri](https://rajagiritech.ac.in/home/images/logon.png), [FOSS United](https://fossunited.org/) and [IEEE Signal Processing Society](https://signalprocessingsociety.org/our-story/sps-branding-materials). Add only confirmed organisations and describe each logo with alt text.

Jersey 10 and DM Sans are self-hosted under the SIL Open Font License. See `assets/FONT-JERSEY-LICENSE.txt` and `assets/FONT-LICENSE.txt`.

The pixel-art harbour illustration is `assets/kochi-pixel-harbour.webp`, generated with built-in ImageGen. The two programme illustrations are the previous text-free 3D concept renders of the campus workshop and buildathon afloat. The public artwork illustrates the event and does not specify a ferry route.

<details><summary>Harbour art generation prompt</summary>

Use case: stylized-concept. Asset type: production website hero artwork, wide landscape 3:2 aspect ratio, 1536x1024. Create an extraordinarily beautiful, detailed 16-bit pixel-art panorama of Kochi waterfront in Kerala, India. Bright clean cyan summer sky with a few cream pixel clouds, distant modern Kochi waterfront buildings and port silhouettes, tropical coconut palms framing the scene at the sides, lush greenery, calm brilliant turquoise backwaters with sharply patterned pixel reflections and sunlit ripples. Main focal point: an authentic-looking modern Kochi Water Metro electric passenger catamaran ferry traveling from left to right across the middle of the water, three-quarter side view, white body, dark navy windows, blue roof and bright violet lower hull with cyan wave graphics, a crisp small wake behind it. In the left foreground on a waterfront promenade table, an open slim laptop angled toward the water, visible unlettered dark screen with small cyan pixel patterns, suggesting a creative technology buildathon. Compose like an exceptional hand-crafted 1990s adventure-game landscape: deliberate square pixels, layered parallax depth, fine architectural and foliage details, luminous reflected light, charming polished craft. Keep the ferry fully visible near center-right and the laptop small enough to support the landscape. Full-bleed illustration only. No lettering, no numbers, no typography, no logos, no UI, no borders, no watermark. No painterly blur or smooth 3D renders; retain visibly intentional pixel art everywhere.

</details>

## Checking and publishing

With Playwright and Chromium available, run `SITE_URL=http://127.0.0.1:4173/ node tests/site.spec.mjs`. Use `PLAYWRIGHT_MODULE` and `CHROMIUM_EXECUTABLE_PATH` for local installations or `SCREENSHOT_DIR` to retain screenshots. The suite checks registration links, partner logos, image and font loading, both programme days, FAQs, keyboard navigation, responsive layouts, reduced motion and the footer voyage.

Push to `main` to publish to the linked Vercel project and GitHub Pages. The Pages workflow publishes only the static website and allowed assets.
