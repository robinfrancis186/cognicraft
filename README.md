# TechX CogniCraft 2026

The event website for 12–13 December 2026 at Rajagiri School of Engineering & Technology and aboard the Kochi Water Metro. The site uses the organisers’ November campaign posters as its visual reference. The blue contact footer retains its original line-drawn waterfront and looping ferry.

[Production site](https://techxcognicraft.vercel.app/)

## Running locally

Run `python3 -m http.server 4173 --bind 127.0.0.1` and open http://127.0.0.1:4173/. The website is static and has no build step.

Edit the event information and partner credits in `index.html`, the layout in `styles.css`, and menu, keyboard tabs or motion controls in `script.js`. Without JavaScript, the navigation and both programme days are available. The pause controls and operating-system reduced-motion setting apply to the hero harbour scene, artwork window indicator and footer ferry.

## Event sources

The organisers confirmed a solo hackathon with individual projects, free admission, one night at Rajagiri and arranged transport to the Water Metro. Times and sessions are planned. The boarding terminal, route and final presentation venue are to be announced. The public contacts come from the event poster. The private proposal stays outside the public repository.

Registration links follow the QR code and printed URL in the 15 November registration poster. The linked Luma listing is titled **Manus Fellow Event | Water Metro Edition** and accepts requests subject to approval. No attendee information is collected on this static site.

## Artwork and typography

The campaign TechX mark, IEEE CS SYP Activities and IEEE marks, and Manus Fellow credit are taken from the supplied posters. The Kerala ATII logo was supplied separately. Other partner marks come from the [IEEE CS SYP website](https://syp.computer.org/), [Rajagiri](https://rajagiritech.ac.in/home/images/logon.png), [FOSS United](https://fossunited.org/) and [IEEE Signal Processing Society](https://signalprocessingsociety.org/our-story/sps-branding-materials). Add only confirmed organisations and describe each logo with alt text.

Jersey 10 and DM Sans are self-hosted under the SIL Open Font License. See `assets/FONT-JERSEY-LICENSE.txt` and `assets/FONT-LICENSE.txt`.

The hero combines a screen-print illustration of Fort Kochi with an independently animated Water Metro ferry. The waterfront and transparent ferry are local illustrations created with built-in ImageGen, `assets/kochi-engraved-harbour.webp` and `assets/kochi-engraved-water-metro.webp`. The reflected hull is a masked copy of the same moving ferry. Its static link preview is `assets/kochi-harbour-preview.jpg`. The host photograph, [RajagiriCampus.jpg by Nairkdgvr](https://commons.wikimedia.org/wiki/File:RajagiriCampus.jpg), is served as `assets/rset-kochi-campus.webp` under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). It has been converted to WebP and is cropped to fit the venue frame.

Both programme images are 3D event concepts. The Day One image, `assets/day-one-workshop.webp`, was made with built-in ImageGen. Day Two shows the buildathon aboard the ferry.

<details><summary>Fort Kochi background generation prompt</summary>

Use case: stylized-concept. Asset type: production website hero BACKGROUND illustration only, landscape 3:2 full-bleed composition, 1536x1024. Create an exceptional richly detailed pen-and-ink plus screen-print illustration of Kochi Fort shoreline in Kerala, India, as a contemporary illustrated travel poster without lettering. Strong layered panoramic perspective. A distinct recognizable Chinese fishing net occupies the LEFT THIRD, with its tall weathered wooden cantilever beams, ropes, suspended spread net, small timber shoreline pier and richly engraved construction details. Behind it a lively but unoccupied strip of colonial Kochi waterfront buildings, terracotta tiled boatsheds, and detailed tropical coconut palms along the shore. On the far horizon at right a layered pale-blue silhouette of the newer Kochi city. A LARGE warm tangerine low sun hangs in the upper center-right behind the palms, pale cream graphic clouds in the sky. The LOWER FORTY PERCENT must be OPEN CALM RIVER only, with elegant deep cobalt marine ripples, hand-drawn horizontal wave contours and small sparse lime and cream reflected accents; this open foreground water is deliberate unobstructed space reserved for a separately animated ferry overlay. Keep all land architecture and fishing-net structure above that open water foreground, extending only a little into it at the left shoreline. Beautiful hand-engraved fine navy hatching, stippling and etched botanical/architectural texture, confident flowing ink contours and subtle misregistered screen-print grain, not pixel art. Rich intentional flat spot colors: pale warm cream, deep ink navy, electric cobalt, pale powder blue, sunlit orange, restrained touches of fresh lime. High-end editorial illustration, crisply composed, vivid but exquisitely balanced, detailed without clutter, long visual depth, unique handcrafted craft. No text, no lettering, no numbers, no labels, no logos, no watermark, no border. NO boats, NO ferries, NO vessels, NO people. Background landscape only. Do not add a boat silhouette anywhere.

</details>

<details><summary>Water Metro generation prompt</summary>

Use case: stylized-concept. Asset type: isolated transparent-background production website animation sprite. Create one exceptionally beautiful authentic-looking modern Kochi Water Metro electric passenger catamaran ferry, low-slung and elongated, facing RIGHT, in a slightly elevated three-quarter SIDE VIEW. Boat must be closely matched to hand-engraved vintage Kerala travel-poster illustration: exquisite fine dark-navy etched hatch lines, ink stipple, screen-print texture, cobalt-blue and warm-ivory spot colors. The starboard side is the broad visible side, the bow at right, roof and right-facing open bow deck visible. Long white/ivory passenger cabin with deep navy reflective windows, a few tiny dark passenger silhouettes naturally visible through windows, cobalt roof and lower hull, restrained magenta/violet water-metro accent panels and turquoise wave-shaped accent. Believable modern catamaran hull proportions, open bow deck and crisp metal handrails, orange lifebuoy, detailed doors, rooftop air-conditioning equipment, navigation mast, etched hull construction details. Rich precise ink craftsmanship and tactile print texture, not vector-flat, not photorealistic, not cartoon, not pixel art, not a sticker with a white outline. Background fully TRANSPARENT, including all surrounding negative space. Vessel isolated by itself with NO water patch, NO sea, NO waves, NO wake, NO detached shadow, NO ground, NO sky, NO scenery, NO frame, NO labels, NO branding or lettering, NO numbers, NO watermark. No engine smoke. All components including railings and mast fully inside the frame with modest empty padding; boat fills canvas width. Transparent landscape canvas with vessel approximately 3:1 overall silhouette.

</details>

<details><summary>Day One workshop generation prompt</summary>

Use case: stylized-concept. Asset type: professional event website Day One programme illustration, horizontal cinematic panorama, exactly 3:1 aspect ratio, 3072x1024. Create a fresh realistic high-end 3D editorial rendering of a small indoor university makerspace workshop in Kerala, India. One cohesive intimate camera angle at tabletop eye level, medium-wide composition. Three adult Indian engineering students collaborate calmly around one real, believable 3D-printed assistive prototype at the center of a wooden workbench: a cream-white printed adaptive grip for holding an everyday spoon, with clearly visible printed layers, smooth rounded form and a simple purple adjustable strap. A young woman at center carefully holds the prototype; a student to her right leans in and points to its printed mechanism, another to her left studies it. All hands anatomically believable with normal fingers, no confusing overlapping arms. A compact enclosed desktop FDM 3D printer sits beside the team on the workbench with a small reel of filament, tidy tools, calipers and an open unbranded laptop showing simple unlabeled geometric CAD. Soft warm Kerala afternoon light enters through tall windows, out-of-focus palms visible beyond, muted terracotta and cream interior, natural wood, subtle teal and cobalt accents. The central collaborative group and assistive prototype must remain fully legible in a centered mobile crop; keep incidental equipment toward the sides. Beautiful tactile materials, editorial art direction, physically plausible soft shadows, professionally composed, gentle depth of field without losing prototype detail. One workshop scene only, no montage, no sunny outdoor campus scene, no panel discussion, no crowds, no futuristic holograms, no toy-like caricatures. No text, no letters, no numbers, no logos, no UI overlays, no watermark. Clearly an illustrated 3D event concept, not a claim to documentary photography.

</details>

## Checking and publishing

With Playwright and Chromium available, run `SITE_URL=http://127.0.0.1:4173/ node tests/site.spec.mjs`. Use `PLAYWRIGHT_MODULE` and `CHROMIUM_EXECUTABLE_PATH` for local installations or `SCREENSHOT_DIR` to retain screenshots. The suite checks registration links, partner logos, image and font loading, both programme days, FAQs, keyboard navigation, responsive layouts, reduced motion and the footer voyage.

Push to `main` to publish to the linked Vercel project and GitHub Pages. The Pages workflow publishes only the static website and allowed assets.
