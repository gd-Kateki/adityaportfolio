# Publishing the portfolio

1. Run `npm test` from the project root.
2. Preview with `npm run dev` and check the résumé download and project links.
3. Publish the contents of `dist/`, including its `assets/` folder and `404.html`.

For a build-enabled static host, use:

- Build command: `npm run build`
- Output directory: `dist`
- Runtime: Node.js 20 or newer

## GitHub Pages setup

The repository includes `.github/workflows/pages.yml`. It tests the site, builds `dist/`, and deploys that folder after pushes to `main`. Pull requests run checks without deploying. You can also start it from the Actions tab with **Run workflow** on `main`.

1. Commit and push the project files, including `.github/workflows/pages.yml`, `src/`, `assets/`, `public/`, `scripts/`, and `tests/`. Do not commit `dist/`.
2. Open the repository's **Settings → Pages → Build and deployment**.
3. Select **GitHub Actions** as the source.
4. Run the **Build and deploy portfolio** workflow, or push the next change to `main`.
5. Use the deployment URL shown by the successful workflow.

For `gd-Kateki/uiux_website`, the expected default address is `https://gd-kateki.github.io/uiux_website/`. A configured custom domain changes that address. Remote settings have not been modified by this setup, and the workflow has not yet been run on GitHub.

The workflow follows [GitHub's custom Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). Only the deployment job receives Pages write and identity-token permissions; no personal access token is needed.

## Base paths and validation

Run `npm run test:pages` to check both root hosting and `/uiux_website/` hosting, including exact filename case and recovery links from a nested 404 URL. This catches Windows paths that would fail on GitHub's case-sensitive hosting. The test restores the normal preview build afterward.

Normal pages use relative URLs. The 404 page receives a static base URL at build time, so it also works without JavaScript. The workflow gets `SITE_BASE_PATH` from GitHub's `configure-pages` action; it supports both project paths and custom-domain roots. For a manual project-path build in PowerShell:

```powershell
$env:SITE_BASE_PATH = '/uiux_website/'
npm test
Remove-Item Env:SITE_BASE_PATH
```

Run `npm run build` afterward to restore a root-based local preview. `public/.nojekyll` is included in the output.

Do not publish `src/`, `scripts/`, `tests/`, `docs/`, `design/`, or `test-results/`. They are editing and development materials.

Every existing HTML filename and asset URL is preserved. `public/styles.css` is copied to the output root for compatibility with the original stylesheet URL. Set `SITE_BASE_PATH` for other subdirectory hosts as needed.

The build recreates `dist/` each time, so edits there will be overwritten. Make changes to source files instead. Generated output is not tracked in Git.
