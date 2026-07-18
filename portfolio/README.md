# Yash Wadbude — Pentester Portfolio

A personal portfolio site for an ethical hacker / penetration tester: a small Express
backend serving a dynamic, config-driven frontend, styled as a security-console /
recon terminal.

## Run it

```bash
npm install
npm start
```

Then open **http://localhost:3000**

## Edit your content — no code required

Everything on the page (name, bio, skills, certifications, education, GitHub
username, resume/photo file paths) lives in one file:

```
data/config.json
```

Open it and replace anything starting with `EDIT_ME`. To add or remove a skill,
certificate, or education entry, just add/remove an object in the matching array
— the page re-renders itself from whatever is in that file. No HTML/CSS/JS edits
needed.

### Fields to fill in
- `profile.bio`, `profile.location`, `profile.email`, `profile.linkedin`
- `skills[]` — each item is `{ "name": "...", "level": "critical|high|medium|low" }`
  (`level` controls the severity color/bar, like a CVSS rating)
- `certifications[]` — `{ "name", "issuer", "year", "credentialUrl" }`
- `education[]` — `{ "degree", "institution", "duration", "details" }`
- `projectsFallback[]` — only shown if the live GitHub API call fails; keep it
  roughly in sync with your pinned repos

## Projects section

Projects are pulled **live** from `https://api.github.com/users/<githubUsername>/repos`
in the browser — pin repos on your GitHub profile and they'll show up automatically,
sorted by stars. If the GitHub API is unreachable (rate-limited, offline), the page
falls back to `projectsFallback` in `config.json`.

## Resume button

The nav's "resume" button opens `public/assets/resume.pdf` in an in-page preview
modal, with a Download link. **Replace `public/assets/resume.pdf` with your real
resume**, keeping the same filename — or point `profile.resumeFile` in
`config.json` at a different path.

## Profile photo

Replace `public/assets/profile.jpg` with your real photo (any image works, just
keep the filename or update `profile.profileImage` in `config.json`).

## Feedback form

Submissions POST to `/api/feedback` and are stored in `data/feedback.json`
(view them anytime at `http://localhost:3000/api/feedback`, or open the file
directly). This is intentionally simple — no email is wired up yet since no
email/SMTP credentials were provided.

**To get an email whenever someone submits the form:**
1. `npm install nodemailer` (already in `package.json`)
2. In `server.js`, inside the `/api/feedback` handler, after saving the entry,
   send yourself an email with `nodemailer` using your SMTP credentials (e.g.
   Gmail app password, SendGrid, Resend, etc.) — happy to wire this up for you
   once you tell me which email provider you want to use.

## Deploying

This is a plain Node/Express app — it runs as-is on Render, Railway, Fly.io,
a VPS, etc. Run `npm install && npm start`, and set `PORT` via the platform's
environment variable if needed.

## Project structure

```
server.js              backend: serves the frontend, /api/config, /api/feedback
data/config.json        all editable site content
data/feedback.json       stored form submissions (auto-created)
public/index.html        page structure
public/css/style.css     styling (design tokens at the top)
public/js/app.js         renders everything from config.json, GitHub fetch, form logic
public/assets/           profile.jpg, resume.pdf — replace with your real files
```
