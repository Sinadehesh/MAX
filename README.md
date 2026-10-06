# Optimolds website

Live at **https://optimolds.com**, hosted on Cloudflare Pages. The Optimolds marketing site, built from [`docs/blueprint.md`](docs/blueprint.md): 18 pages of plain HTML and CSS. There's no framework and nothing to install, and it runs on any static host.

```
site/                 ← the website itself (this folder is what gets published)
  index.html            Home
  services.html         Services overview
  fea-layup.html        Service: FEA & Layup
  mold-design.html      Service: Mold Design
  mold-manufacturing.html  Service: Mold & Jig Manufacturing
  process.html          7-step process with the approval gate
  projects.html         Project index with filters
  project-*.html        3 case studies (same template)
  feasibility-check.html  Free Feasibility Check form (main CTA)
  about.html, contact.html, thank-you.html, 404.html
  privacy.html, cookies.html, terms.html
  assets/css            styles.css (all design), fonts.css (self-hosted fonts)
  assets/js/main.js     mobile menu, cookie banner, project filters, form helpers
  assets/img            illustrations, favicon, social share image
  assets/fonts          self-hosted fonts (no data sent to Google, GDPR-friendly)
partials/             shared <head>, header and footer, copied into every page
scripts/build.mjs     syncs partials, writes sitemap/robots, checks links, lists placeholders
docs/blueprint.md     the original plan
```

## Preview it

```bash
npm run preview          # or: python3 -m http.server 8000 --directory site
```

Then open http://localhost:8000. You can also just double-click `site/index.html`.

## Fill in your content

Anything that needs your real details is **highlighted in yellow** on the page (`<span class="todo">…</span>`), and placeholder links contain `TODO` or `yourdomain.com`. To list every one that's left:

```bash
npm run build            # or: node scripts/build.mjs
```

What's needed (also in the blueprint's "What to prepare" list):

| Where | What |
|---|---|
| Footer (`partials/footer.html`) | Registered business name, P.IVA, address, email, LinkedIn and Fiverr URLs |
| Home | 3 Fiverr review quotes (bene2111 first), featured project result line |
| Service pages | "From €…" prices (or keep "Quoted per project"), typical turnaround, FEA software/methods, tooling temperature/pressure limits |
| Project pages | Real brief, design decisions, results, quick facts and photos. Remove the **Demonstration project** label for paying-client work. |
| About | Your name, background, city, photo, workshop photos |
| Contact | Calendly (or Cal.com) link |
| Legal pages | Dates, providers, retention periods, payment/revision terms. **Have these reviewed by a professional before launch.** |

### The shared header and footer

The header, footer and `<head>` live once in `partials/`. Edit them there and run `npm run build`: the script copies them into every page and marks the current page in the menu. Don't edit the content between `<!-- shared:… -->` markers in a page, because it gets overwritten.

### Images

- **Logo:** the header uses a placeholder mark and wordmark. Swap the `<svg class="brand__mark">` and text in `partials/header.html` / `footer.html` for `<img src="assets/img/logo.svg" alt="Optimolds" height="34">`.
- **Hero:** `index.html` has a comment showing how to swap the illustration for your render or a short video loop.
- **Project images:** the technical illustrations carry a "Placeholder art" badge. When you have real photos, drop them in `site/assets/img/`, change the `src`, and remove `is-placeholder` from the wrapper.
- **Dashed photo frames** (`<div class="ph-frame">`): replace each with `<img src="assets/img/your-photo.jpg" alt="Describe the photo" loading="lazy">`.
- Keep photos under ~300 KB (export JPG/WebP at ~1600 px wide), and always write the `alt` text.

## Forms

Both forms (Feasibility Check and Contact) send visitors to `thank-you.html` after submitting. **Cloudflare Pages only serves files and doesn't receive form posts**, so each form needs a form service. Until one is connected, visitors see a polite "form isn't connected yet" message instead of an error.

1. Create a free account at [Formspree](https://formspree.io) (or similar) and make two forms, "Feasibility check" and "Contact". Turn on email notifications and, if you like, an auto-reply.
2. Paste each form's URL into the matching `data-endpoint="…"` attribute in `site/feasibility-check.html` and `site/contact.html`, for example `data-endpoint="https://formspree.io/f/abcdwxyz"`.
3. Commit and push; Cloudflare redeploys automatically.

Formspree's free plan doesn't accept file uploads, so on that plan visitors should use the "link to your files" field (or remove the upload field). For built-in uploads and auto-replies on a free plan, build the form in [Tally](https://tally.so) and replace the `<form>` with their embed code.

If you ever move the site to **Netlify**, set `NETLIFY_FORMS = true` in `site/assets/js/main.js` and the forms work with no service (uploads up to 8 MB). If your provider's upload limit isn't 8 MB, update `MAX_UPLOAD_MB` and the hint text on the form.

## Analytics and cookies

Put your Google Analytics 4 ID in `GA_MEASUREMENT_ID` at the top of `site/assets/js/main.js`. Analytics loads **only after a visitor clicks "Accept analytics"**. "Essential only" and the × both mean no. Visitors can change their choice via *Cookie settings* in the footer. The Cookie Policy already describes this setup, so update it if you add other tools.

## Deploy (Cloudflare Pages)

The site is a Cloudflare Pages project connected to this GitHub repo, so every push redeploys it automatically. One-time setup:

1. Cloudflare dashboard → **Workers & Pages** → **Create application** → **Pages** tab → **Import an existing Git repository**.
2. Choose GitHub → `Sinadehesh/MAX` → **Begin setup**.
3. Settings:
   - Project name: `optimolds`
   - Production branch: the branch that holds the site (`main` once it's merged there)
   - Framework preset: **None**
   - Build command: `node scripts/build.mjs`
   - Build output directory: `site`
4. **Save and Deploy**. The site appears at `optimolds.pages.dev`.
5. In the project → **Custom domains** → **Set up a custom domain** → `optimolds.com` → **Activate domain**. Because the domain's DNS is on the same Cloudflare account, Cloudflare creates the DNS record automatically. Repeat for `www.optimolds.com`.
6. Optional: send `www` to the bare domain with **Rules** → **Redirect Rules** → template **Redirect from WWW to root**.

`site/_headers` sets security headers and long caching for fonts. Cloudflare serves `site/404.html` for missing pages and `/about` for `about.html` automatically.

After launch, submit `https://optimolds.com/sitemap.xml` in Google Search Console.

## Add a page

Copy a page with the same layout (for example `project-trim-drill-jig.html` for a new case study), change the `<title>`, meta description and content, then run `npm run build`. For a new project, also copy a card in `projects.html` and set its `data-services` (`fea`, `mold-design`, `manufacturing`).

## Before launch

- [ ] `npm run build` shows no problems and no placeholders
- [ ] Both forms tested on phone and desktop: you get the email, the client gets the auto-reply
- [ ] Legal pages reviewed, company details in the footer
- [ ] Real photos in place, each under ~300 KB with alt text
- [ ] Domain email working; LinkedIn, Fiverr and Calendly links correct
- [ ] Analytics ID set; Search Console verified and sitemap submitted
