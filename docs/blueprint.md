# Optimolds Website Blueprint

The original plan this site was built from. Kept for reference. It was written for no-code builders (Framer, Webflow, Wix Studio or Squarespace), and everything in it is implemented as plain HTML in [`/site`](../site).

## 1. Sitemap

```
Home
├── Services
│   ├── FEA & Layup
│   ├── Mold Design
│   └── Mold & Jig Manufacturing
├── Process
├── Projects
│   └── [Project page ×3-4, same template]
├── Free Feasibility Check   ← main CTA, form
├── About
├── Contact / Request a Quote
├── Thank-you page (after any form)
└── Legal: Privacy Policy, Cookie Policy, Terms
```

**Header nav:** Services · Process · Projects · About · Contact, plus a highlighted button **"Free Feasibility Check"**.
**Footer:** logo, tagline, nav links, email, LinkedIn, Fiverr link, legal links, company details (P.IVA / registered name).

## 2. Page-by-page content

### Home

| Section | Content |
|---|---|
| **Hero** | Headline: *"From CAD to composite part: engineering and tooling, done right."* Subline: *"FEA & layup, mold design and mold manufacturing for small composite producers."* Two buttons: **Free Feasibility Check** (primary) and **See our projects** (secondary). Background: your mold render or a short loop of render → mold → part. |
| **Trust strip** | Logo row or badges: "4.8★ on Fiverr", "Reply within 1 hour", "Files in STEP / STL / 3MF / PDF", "Italy-based, serving Europe + worldwide" |
| **Three offers** | Three cards (FEA & Layup, Mold Design, Mold & Jig Manufacturing), each with an icon, one line, 3 bullets and a "Learn more" link |
| **How it works** | Compact 4-step version of the process with a link to the full page |
| **Featured project** | One hero case study with a big image, one-line result and "View project" button |
| **Why Optimolds** | 3-4 points: manufacturability checked before you spend on tooling; one team from analysis to finished mold; clear deliverables and approval gate before manufacturing; industrial-grade resins and fibers |
| **Free feasibility CTA band** | *"Send us your CAD. Get a risk report in 48 hours. Free."* + button |
| **Reviews** | 2-3 Fiverr quotes (the bene2111 review is your strongest) with a link to your Fiverr profile |
| **Footer** | As above |

### Services overview

Short intro, then the three offers as large alternating blocks (image left/right), plus a line explaining that offers work standalone or as a pipeline, with a **bundle** note. Button on each block goes to its detail page.

### Service pages (one template, three versions)

Use this section order for each:

1. **Hero:** service name, one-sentence promise, CTA ("Request a quote")
2. **Who it's for:** 2-3 bullets (e.g. "You have a part design and want to know if it will perform")
3. **What you get (deliverables):** checklist
4. **What we need from you:** CAD, load cases, material preferences, quantities
5. **How it works:** 3-4 steps specific to this service
6. **Turnaround and starting price:** a "from €…" figure or "quoted per project" with typical timeline
7. **Example project:** link to a relevant case study
8. **FAQ:** 4-6 questions
9. **CTA:** Request a quote / Free feasibility check

**Content drafts for each service**

| | FEA & Layup | Mold Design | Mold & Jig Manufacturing |
|---|---|---|---|
| **Promise** | Know your part will perform before you build it | Tooling designed for clean demolding and repeatable parts | Production-ready molds and jigs, built and shipped |
| **Deliverables** | Structural analysis report; ply schedule and orientation; layup recommendations; weight/stiffness trade-offs | Mold CAD; parting and demolding design; alignment features; optimization analysis; STEP / STL / 3MF / PDF drawings | Mold and jigs (3D-printed, CNC or composite tooling per project); inspection photos; shipping |
| **Needs from you** | CAD, load cases, material targets | Validated part CAD, process (infusion, prepreg, wet layup), quantities | Approved mold design (ours or yours), material and tolerance requirements |
| **Notes** | Add what software and methods you use, once confirmed | Mention the free review of your geometry | State the temperature/pressure limits of your tooling (your Fiverr page says "low temperature and pressure autoclave-ready") |

### Process page

Use the 7 steps from your handwritten roadmap as a vertical or horizontal diagram, with an icon, short text and the output for each:

1. **Project Intake:** form + geometry, materials, tools, constraints
2. **Feasibility Audit:** free, with risk detection (manufacturability, lamination, demolding)
3. **FEA & Layup:** optional, validates performance
4. **Optimization & Mold Design:** suggested modifications and technical direction, then mold CAD
5. **Review & Approval:** pre-delivery checklist; **you sign off here**
6. **Manufacturing:** mold and jigs built
7. **Delivery & Priority Support:** files, guidance, chat assistance

Highlight the **approval gate** as a visual marker. It's a trust point, so don't bury it.

### Projects page

- **Index:** grid of cards (image, title, tags such as "Hydrofoil · Mold design · Carbon fiber") with filters by service
- **Project page template:**
  1. Title and one-line summary
  2. Hero image or video
  3. Quick facts box: industry, service(s) used, material, process, timeline
  4. **The challenge**
  5. **What we did** (analysis, design decisions, images of each stage)
  6. **The result** (finished part, mold photos, numbers if you have them)
  7. CTA: "Have a similar part? Get a free feasibility check"
- **Start with 3 projects:** your hydrofoil-wing mold, one FEA & layup demonstration, and one manufacturing example. If a project is on your own geometry rather than a client's, label it **"Demonstration project"**.

### Free Feasibility Check (the form page)

Short intro (*"Tell us about your part. We review it and send a risk report within 48 hours. No cost, no obligation."*), then the form:

| Field | Type |
|---|---|
| Name, email, company | Text |
| What is the part? | Short text |
| Industry | Dropdown (watersports, drones/UAV, automotive/motorsport, marine, aerospace, bicycles/e-bikes, other) |
| CAD upload or link | File upload + link field (STEP/STL, plus a Drive/WeTransfer link for large files) |
| Material / process | Dropdown (carbon prepreg, infusion, wet layup, not sure) |
| Quantity | Dropdown (1-prototype, 2-10, 10-100, 100+) |
| Which service interests you? | Checkboxes (FEA & Layup, Mold Design, Mold & Jig Manufacturing, Not sure) |
| Notes and deadline | Long text |
| Consent | Checkbox (privacy policy) |

Add a short **confidentiality note** under the upload: *"Your files are confidential and used only for your project. NDA available on request."* Clients sending CAD care about this a lot.

### About

Who's behind Optimolds, the engineering background, what you specialize in, languages (Italian, English, Russian), and location. Add a team photo or workshop photos if you have them, since photos make a big trust difference. Keep it honest: describe real experience and don't inflate it.

### Contact / Request a Quote

A simpler form (name, email, project description, service, optional file link), email address, LinkedIn, and a booking link (Calendly or similar) for a 20-minute call. State the response time ("we usually reply within 1 hour").

### Thank-you page

Confirms what happens next (*"We'll review your files and reply within 48 hours"*) and links to Projects while they wait.

## 3. Behind the scenes

**Tools (all have free tiers)**

| Need | Option |
|---|---|
| Website builder | Framer, Wix Studio or Squarespace |
| Forms | The builder's own, or Tally / Jotform if you need bigger file uploads |
| Notifications and storage | Form → email notification + Google Sheet or Notion |
| Lead tracking | Notion or HubSpot free CRM, with stages: New → Feasibility sent → Quote sent → Won/Lost |
| Booking | Calendly or Cal.com |
| Analytics | Google Analytics + Search Console |
| Email | Domain-based address (info@yourdomain), not Gmail |

**Automations (set up once)**
- Instant auto-reply on every form: "Received, reply within 48h"
- Internal alert to your email/phone on each new lead
- Follow-up reminder 3 days after you send a feasibility report

## 4. Design basics

- **Look:** match the logo: teal/cyan plus dark navy, white backgrounds, a bold condensed headline font (similar to the logo), clean sans-serif for body text
- **Imagery:** renders and real photos of molds and parts; avoid generic stock photos
- **Mobile first:** most visitors from LinkedIn will arrive on a phone
- **Languages:** build English first; add Italian as a second language once the site is live

## 5. SEO and legal basics

- **Page titles** like "Composite Mold Design | Optimolds" and "Carbon Fiber FEA & Layup | Optimolds", each with a short meta description
- **Target keywords:** composite mold design, carbon fiber mold manufacturing, composite FEA layup, DFM composites
- **Alt text** on every image
- **GDPR (Italy/EU):** privacy policy, cookie banner with consent, consent checkbox on forms
- **Company details** in the footer: legal name, P.IVA, address, email
- **Terms:** a short page covering file confidentiality, IP ownership of deliverables, revisions and payment terms

## 6. Build order

1. **Week 1:** set up domain and builder; build Home, Free Feasibility form and Thank-you page
2. **Week 2:** three service pages and Process page
3. **Week 3:** Projects (3 case studies), About, Contact, legal pages
4. **Week 4:** SEO basics, analytics, automations; test every form on phone and desktop; launch
5. **After launch:** start outreach, using the feasibility check as the hook

## 7. Launch checklist

- [ ] All forms deliver to your email and trigger the auto-reply
- [ ] Mobile layout checked on every page
- [ ] Every image optimized (under ~300 KB) so pages load fast
- [ ] Cookie banner and privacy policy live
- [ ] Fiverr link and LinkedIn linked in the footer
- [ ] Analytics and Search Console connected
- [ ] Domain email working

## What to prepare before building

- 3 project folders (images, 2-3 sentences each on challenge/solution/result)
- Logo files (PNG + SVG)
- 2-3 review quotes
- Your confirmed "from" prices and typical turnaround for each service
- One photo of you or the team/workshop
