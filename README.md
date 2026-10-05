# Aditya Nair — UI/UX & Game Design

A single, responsive portfolio for interface design, game systems, level design, and narrative work. Keeps the original warm light palette, rounded cards, serif accents, and floating navigation.

## Local development

Requires Node.js 20 or newer. No dependencies need installing.

```sh
npm run dev
```

Open http://127.0.0.1:4173. After editing source pages, run `npm run build` and refresh. The preview server is local only.

```sh
npm test
```

Builds pages and checks local assets, fragment links, project routes, unique IDs, semantic landmarks, and JavaScript syntax.

## Structure

```text
src/
  data/projects.json       Project catalogue (one source for both grids)
  pages/                   Editable page templates and case-study content
  partials/                Shared navigation and footer
assets/
  css/main.css             Original portfolio theme and tokens
  css/enhancements.css     Responsive components and accessibility
  css/site-shell.css       Shared navigation, footer, spacing and interaction states
  css/hierarchy.css        Homepage previews and consistent interior-page introductions
  css/game-case.css        Unified game case-study layouts
  css/cases/               Existing case-study themes and extracted layout rules
  js/main.js               Filters, search, reveals, clipboard, image dialog
  images/ui/               Original UI project screenshots
  images/games/            Imported game project screenshots
scripts/
  build.mjs                Dependency-free static page generator
  page-shell.mjs           Case-study section anchors, reading menu and image sizing
  check.mjs                Repository validation
  serve.mjs                Local preview server
*.html                     Generated, deployable pages; do not edit directly
styles.css                 Compatibility entry point for the old stylesheet URL
```

Root HTML files are deliberately committed as generated output so existing static hosting and case-study URLs continue working without a hosting migration. Edit `src/pages/`, then run `npm run build`. Commit sources, assets, and generated pages together. A future build pipeline can publish the generated HTML and `assets/` directory.

## Content and maintenance

- Update titles, summaries, filters, thumbnails, and card order in `src/data/projects.json`.
- Set `featured: true` for homepage previews (currently four, split evenly between disciplines). The complete catalogue and its filters remain on the Work page.
- Add a case-study template in `src/pages/` and its entry in the catalogue; the build generates its page and next-project link.
- Keep case-study claims accurate. Game content and 12 screenshots were imported from the owner's published Personal-Website portfolio on 2026-10-05. Original source pages: `project1.html`, `project2.html`, `project3.html`. Existing external document links are preserved; no new performance claims were invented.
- Both UI/UX and game cards are rendered at build time. Content remains available with JavaScript disabled. JavaScript enhances filtering, URL state, keyboard-accessible galleries, and optional motion.
- Contact uses an honest `mailto:` action and explicit copy-email button. There is no backend or simulated submission success. Add a verified delivery service before reintroducing a contact form.
- Case-study art directions are preserved. Extracted `*-layout.css` files contain legacy one-off styles; consolidate these gradually when revising those pages.
- Original game PNGs are retained alongside optimized WebP copies. Pages use approximately 1.8 MB of gallery images rather than the roughly 64 MB originals; project grids use separate small thumbnails. The original favicon is retained, with a 64px copy used by the site.
- The 404 page resolves links for a custom-domain root or GitHub Pages project deployment. For another subdirectory host, update its base URL logic.

## Shared website experience

Primary navigation is Work → About → Experience, with Contact linking to the homepage contact section and the logo returning home. The homepage follows Introduction → Work preview → About preview → Experience preview → Contact. Detailed capabilities and approach live on `about.html`; all original case-study URLs remain unchanged. Homepage `#work`, `#about`, and `#contact` links remain valid.

Every page uses the navigation and footer partials. `site-shell.css` owns the outer website frame with independent `--site-*` tokens so each case study can keep its artwork and theme without changing navigation controls. Case studies receive a breadcrumb and a sticky, keyboard-accessible section menu during the build. Headings keep existing IDs; added IDs follow their document order. Prefer explicit IDs when adding headings to preserve shared links across content edits.

The shared script handles mobile menu disclosure, current-section tracking, back-to-top focus, search clearing, clipboard feedback, image loading/error states, and scrollable diagram guidance. Image viewing uses a native modal dialog. Content and section links remain available without JavaScript; nonfunctional filter controls are hidden in that mode.

The browser suite checks the shared frame at 1440, 390, and 320 CSS pixels, then exercises menus, section navigation, filter restoration, search clearing, broken-image fallback, gallery focus return, reduced motion, and no-JavaScript content. These are browser-emulated sizes, not physical-device or screen-reader certification. Set `INTERACTIONS_ONLY=1` to rerun only the behavior checks after a test-only change.

## Manual release checks

Optional automated browser checks are in `scripts/browser-check.cjs`. With Playwright available and Chrome installed, start the preview, then run `node scripts/browser-check.cjs`. Set `BROWSER_CHANNEL` to use another installed Playwright-supported channel. These tests are separate from the dependency-free default checks.

- At narrow and wide viewport sizes, inspect the homepage, catalogue, and each case study.
- Test both filters, search, empty-state reset, and a shared `projects.html?discipline=game` link.
- Navigate with Tab and Enter; open a gallery, change images with arrow keys, and close with Escape. Focus should return to the thumbnail.
- Expand audit details with the keyboard; enable reduced motion and disable JavaScript to verify content remains usable.
- Verify external document access and the email address before publishing. No deployment or email delivery is performed by the build.
