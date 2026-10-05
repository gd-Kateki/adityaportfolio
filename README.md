# Aditya Nair — Design Portfolio

A static portfolio for UI/UX and game design, built with HTML, CSS, JavaScript, and a dependency-free Node.js build.

## Start locally

Requires Node.js 20 or newer. No package installation is needed for the website.

```sh
npm run dev
```

Open http://127.0.0.1:4173. After editing source files, run `npm run build` and refresh.

## Folder guide

| Folder | Purpose |
| --- | --- |
| `src/pages/` | Editable pages and case-study templates |
| `src/partials/` | Shared navigation and footer |
| `src/data/` | Project catalogue and featured selection |
| `assets/css/` | Shared styles and case-study themes |
| `assets/js/` | Interactions and animation |
| `assets/images/` | Images used by the website |
| `assets/documents/` | Downloadable résumé PDF |
| `public/` | Files copied unchanged to the website root |
| `scripts/` | Build, validation, and preview commands |
| `scripts/lib/` | Shared build helpers and path configuration |
| `tests/browser/` | Optional browser checks |
| `docs/` | Maintenance and publishing instructions |
| `design/originals/` | Original assets, excluded from the website build |
| `dist/` | Generated website; do not edit |
| `test-results/` | Local verification screenshots, ignored by Git |

## Common edits

- **Page content:** edit `src/pages/`.
- **Project titles, thumbnails, and featured selection:** edit `src/data/projects.json`.
- **Navigation or footer:** edit `src/partials/`.
- **Visual design:** edit `assets/css/`; see the stylesheet guide in [maintenance notes](docs/maintenance.md).
- **Résumé:** replace `assets/documents/aditya-nair-resume.pdf` and rebuild.

Keep existing case-study filenames so shared links remain valid. The build regenerates `dist/` and never copies the original design archive into it.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Build and start the preview |
| `npm run build` | Recreate `dist/` from source |
| `npm run check` | Validate the current build |
| `npm test` | Build and validate pages, assets, links, and scripts |
| `npm run test:browser` | Optional browser checks; requires Playwright, Chrome, and a running preview |
| `npm run test:motion` | Optional animation checks with the same prerequisites |

## Publishing

Publish the **contents of `dist/`**, after `npm test` passes. Use `npm run build` as the hosting build command and `dist` as the output directory. This replaces the previous arrangement where generated pages lived in the repository root. Public page URLs are unchanged.

No remote hosting settings have been changed and nothing has been published. See [publishing instructions](docs/publishing.md) and [maintenance notes](docs/maintenance.md).
