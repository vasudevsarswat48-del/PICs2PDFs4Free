# Pics2PDFs4Free – Free Image to PDF Converter (static site)

Pure HTML/CSS/JS. No build step, no backend, no dependencies. Images are converted **in the visitor's browser** (nothing is uploaded), which keeps your Privacy Policy simple and makes AdSense review easier.

## 1. Placeholders (already done)
Site name: **Pics2PDFs4Free**. Domain used everywhere: `https://pics2pdfs4free.vercel.app`. Contact email: `vasudevsarswat48@gmail.com`.
If you later buy a custom domain, use Find & Replace in VS Code (Ctrl+Shift+H) to change `pics2pdfs4free.vercel.app` to your domain in all files.

## 2. Deploy on Vercel
1. Push this folder to a GitHub repo (or run `npx vercel` inside it).
2. Vercel → *Add New Project* → import the repo. Framework preset: **Other**. Build command: *(empty)*. Output directory: *(empty / `.`)*.
3. Add your custom domain in *Settings → Domains*. `vercel.json` already enables clean URLs (`/privacy-policy`) and security headers.

## 3. Google Search setup
1. Add the domain in **Google Search Console** and verify it.
2. Submit `https://mydomain.com/sitemap.xml`.
3. Use *URL Inspection → Request indexing* for the home page and 3 tool pages.

## 4. Google AdSense checklist
- [ ] Custom domain (not `*.vercel.app`) live with HTTPS
- [ ] Privacy Policy, Terms, Cookie Policy, Disclaimer, About, Contact pages are linked in the footer (already done)
- [ ] Real contact email that works
- [ ] 15-20+ days of normal site life, and add more original guides under `/guides` (AdSense wants substantial original content; 8-15 good articles helps a lot)
- [ ] Apply in AdSense → Sites. Paste the AdSense `<script>` in the `<head>` (commented block present in every page; easiest: find/replace the comment in all `.html` files)
- [ ] Put your publisher ID in `ads.txt` (uncomment the line)
- [ ] After approval, paste `<ins class="adsbygoogle">` units into the `<div class="ad-slot">` blocks
- [ ] For visitors in the EEA/UK/Switzerland, enable Google's certified consent message in AdSense → Privacy & messaging (the built-in banner is a simple notice only)

## 5. Themes
Light (default), Ocean, Sunset, Forest, Lavender, Rose, Dark. Dark is **never** applied automatically; it is only used if the visitor picks it. Add a theme by copying a `:root[data-theme="..."]` block in `css/style.css` and an `<option>` in the header select.

## 6. SEO text (copy-paste)

**Site title (home):**
`Image to PDF Converter – Free Online JPG, PNG to PDF | Pics2PDFs4Free`

**Meta description (home, ~155 chars):**
`Convert images to PDF online for free. Combine JPG, PNG and WebP photos into one PDF in seconds. No upload, no sign-up, no watermark — works in your browser.`

**Short description (for social profiles / Search Console / Vercel):**
`Pics2PDFs4Free is a free online image to PDF converter. Combine multiple JPG, PNG, WebP, GIF or BMP pictures into one PDF, reorder and rotate pages, choose A4/Letter size, margins and quality — all privately in your browser with no uploads or sign-up.`

**Keywords to target (already used naturally in the pages):** image to pdf, jpg to pdf, png to pdf, webp to pdf, photo to pdf, convert picture to pdf, combine images into one pdf, merge images to pdf, free image to pdf converter, jpeg to pdf online.

**Tips to rank:** publish a new guide every week (see `generate`-style pages in `/guides`), get a few backlinks (Product Hunt, Reddit r/InternetIsBeautiful, tool directories), keep pages fast (already ~no JS dependencies), and share on Pinterest/Quora with helpful answers.

## File map
```
index.html, jpg-to-pdf.html, png-to-pdf.html, webp-to-pdf.html   tool pages
guides.html + guides/*.html                                       articles (add more!)
about, contact, privacy-policy, terms, cookie-policy, disclaimer  AdSense-required pages
404.html, robots.txt, sitemap.xml, ads.txt, site.webmanifest, vercel.json
css/style.css  js/main.js (themes+cookie notice)  js/app.js (UI)  js/pdf-writer.js (PDF builder)
```
When you add a page, add its URL to `sitemap.xml` and link it from the footer or guides page.
