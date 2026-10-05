# Publishing the portfolio

1. Run `npm test` from the project root.
2. Preview with `npm run dev` and check the résumé download and project links.
3. Publish the contents of `dist/`, including its `assets/` folder and `404.html`.

For a build-enabled static host, use:

- Build command: `npm run build`
- Output directory: `dist`
- Runtime: Node.js 20 or newer

For GitHub Pages, use a workflow that builds the site and uploads `dist/` as the Pages artifact. A branch configured to publish directly from the repository root will need its publishing configuration updated. No workflow or remote setting is changed by this local cleanup.

Do not publish `src/`, `scripts/`, `tests/`, `docs/`, `design/`, or `test-results/`. They are editing and development materials.

Every existing HTML filename and asset URL is preserved. `public/styles.css` is copied to the output root for compatibility with the original stylesheet URL. The 404 template supports a custom-domain root or GitHub Pages project deployment; adjust its base logic for other subdirectory hosts.

The build recreates `dist/` each time, so edits there will be overwritten. Make changes to source files instead. Generated output is not tracked in Git.
