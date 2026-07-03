# LinxIn website

A static marketing + docs site for LinxIn. Zero build step — just HTML, CSS, and a little
vanilla JS. Design is inspired by the structure of [career-ops.org](https://career-ops.org) but
with its own identity: Space Grotesk display type, a blue → violet → cyan palette on near-black,
and its own animations (aurora glow, scroll-reveal, animated score rings, a self-drawing
underline).

```
site/
├── index.html      # landing page
├── docs.html       # docs (quick start, three-score model, skills, privacy)
├── styles.css      # design system + animations
├── script.js       # scroll reveal + animated score rings
└── assets/         # logo + dashboard screenshot
```

## Preview locally

Any static server works (root-relative paths like `/styles.css` need a server, not `file://`):

```bash
cd site
npx serve .            # or: python3 -m http.server 8000
```

Then open the printed URL.

## Deploy

It's a pure static site, so it deploys anywhere with no configuration.

**Vercel** (recommended)
```bash
cd site
npx vercel            # preview
npx vercel --prod     # production
```
Or import the repo in the Vercel dashboard and set the project's root/output directory to `site`.

**Netlify**
```bash
cd site
npx netlify deploy --dir . --prod
```
Or drag the `site/` folder onto app.netlify.com/drop.

**GitHub Pages**
Push the repo and enable Pages, pointing it at the `site/` folder (or copy `site/`'s contents to
a `docs/` folder / `gh-pages` branch).

## Notes

- Update the GitHub/LinkedIn links if your handles change (search the HTML for `hassanm57`).
- `assets/dashboard.png` is a screenshot of the real LinxIn dashboard; regenerate it any time by
  running the dashboard and taking a fresh capture.
