# Maintaining the portfolio

## Stylesheet guide

Styles load in this order; preserve that order when reorganizing the cascade:

1. `main.css` and case-specific styles: original visual themes.
2. `enhancements.css`: responsive components and accessibility.
3. `site-shell.css`: shared navigation, footer, and reading controls.
4. `hierarchy.css`: page introductions and homepage section layouts.
5. `glass.css`: frosted surfaces and transparency fallbacks.
6. `identity.css`: teal accents, project covers, and hero composition.
7. `motion.css`: transitions and reduced-motion overrides.

Case-study themes and extracted layout rules live under `assets/css/cases/`; shared game layouts use `game-case.css`. Interaction scripts are `assets/js/main.js` and `assets/js/motion.js`.

Run commands from the project root. Build helpers live in `scripts/lib/`; browser checks live in `tests/browser/` and write captures to the ignored `test-results/` directory. The native page-transition assertion has shown inconsistent results in headless Chrome; review its output separately from the static and interaction checks.

## Content and maintenance

- Place the owner's résumé PDF at `assets/documents/aditya-nair-resume.pdf` and rebuild to show the homepage download button. It remains hidden until the real file is available, avoiding a broken download.

- Update titles, summaries, filters, thumbnails, and card order in `src/data/projects.json`.
- Set `featured: true` for homepage previews (currently four, split evenly between disciplines). The complete catalogue and its filters remain on the Work page.
- Add a case-study template in `src/pages/` and its entry in the catalogue; the build generates its page and next-project link.
- Keep case-study claims accurate. Game content and 12 screenshots were imported from the owner's published Personal-Website portfolio on 2026-10-05. Original source pages: `project1.html`, `project2.html`, `project3.html`. Existing external document links are preserved; no new performance claims were invented.
- Both UI/UX and game cards are rendered at build time. Content remains available with JavaScript disabled. JavaScript enhances filtering, URL state, keyboard-accessible galleries, and optional motion.
- Contact uses an honest `mailto:` action and explicit copy-email button. There is no backend or simulated submission success. Add a verified delivery service before reintroducing a contact form.
- Case-study art directions are preserved. Extracted `*-layout.css` files contain legacy one-off styles; consolidate these gradually when revising those pages.
- Original game PNGs are archived in `design/originals/games/`; optimized WebP copies stay in `assets/images/games/`. Pages use approximately 1.8 MB of gallery images rather than the roughly 64 MB originals; project grids use separate small thumbnails. The original favicon is retained, with a 64px copy used by the site.
- The 404 page resolves links for a custom-domain root or GitHub Pages project deployment. For another subdirectory host, update its base URL logic.

## Shared website experience

Primary navigation is Work → About → Experience, with Contact linking to the homepage contact section and the logo returning home. The homepage follows Introduction → Work preview → About preview → Experience preview → Contact. Detailed capabilities and approach live on `about.html`; all original case-study URLs remain unchanged. Homepage `#work`, `#about`, and `#contact` links remain valid.

Every page uses the navigation and footer partials. `site-shell.css` owns the outer website frame with independent `--site-*` tokens so each case study can keep its artwork and theme without changing navigation controls. Case studies receive a breadcrumb and a sticky, keyboard-accessible section menu during the build. Headings keep existing IDs; added IDs follow their document order. Prefer explicit IDs when adding headings to preserve shared links across content edits.

The shared script handles mobile menu disclosure, current-section tracking, back-to-top focus, search clearing, clipboard feedback, image loading/error states, and scrollable diagram guidance. Image viewing uses a native modal dialog. Content and section links remain available without JavaScript; nonfunctional filter controls are hidden in that mode.

The browser suite checks the shared frame at 1440, 390, and 320 CSS pixels, then exercises menus, section navigation, filter restoration, search clearing, broken-image fallback, gallery focus return, reduced motion, and no-JavaScript content. These are browser-emulated sizes, not physical-device or screen-reader certification. Set `INTERACTIONS_ONLY=1` to rerun only the behavior checks after a test-only change.

Page transitions use native cross-document View Transitions when supported, with ordinary navigation elsewhere. No links are intercepted or delayed. `motion.js` adds short staggered entrances with the Web Animations API, and cancels its animations when reduced motion is enabled. Run `npm run test:motion` with Playwright available and the local preview running to verify native transitions, filter animation, browser history, reduced motion, and the selected homepage projects.

## Manual release checks

The homepage combines real project imagery in a responsive hero and alternates featured-card widths on desktop. NovelNest cover PNGs in `assets/images/thumbnails/` were captured from the existing third and fourth `.phone` components in `NovelNest_Project.html`; refresh those captures when the source interface designs change. Floating controls keep their glass finish, while teal accents and a tinted About section provide visual hierarchy.

Optional automated browser checks are in `tests/browser/interactions.cjs`. With Playwright available and Chrome installed, start the preview, then run `npm run test:browser`. Set `BROWSER_CHANNEL` to use another installed Playwright-supported channel. These tests are separate from the dependency-free default checks.

- At narrow and wide viewport sizes, inspect the homepage, catalogue, and each case study.
- Test both filters, search, empty-state reset, and a shared `projects.html?discipline=game` link.
- Navigate with Tab and Enter; open a gallery, change images with arrow keys, and close with Escape. Focus should return to the thumbnail.
- Expand audit details with the keyboard; enable reduced motion and disable JavaScript to verify content remains usable.
- Verify external document access and the email address before publishing. No deployment or email delivery is performed by the build.
