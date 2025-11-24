# Kenya Hustle Hub — Next.js Demo

This folder contains a minimal Next.js scaffold (pages router) with a clean layout, cards, typography, and simple UI.

Getting started:

1. Open a terminal in `next-app`:

```powershell
cd "e:\\WEB DEVELOPMENT\\kenya hustle hub fixed\\next-app"
npm install
npm run dev
```

2. Open `http://localhost:3000` in your browser.

Notes:
- This is a starter scaffold. You can migrate your existing HTML/CSS into the components.
- To add Tailwind, icons, or a design system, I can extend this scaffold.

CI (GitHub)
----------------
I added a GitHub Actions workflow at `.github/workflows/ci.yml` which will run `npm ci` and `npm run build` when you push to `main` or create a PR. This helps surface build errors even if you can't run `npm` locally yet.

If you want me to inspect CI failures, push your repo to GitHub and share the build logs or grant me access; I'll diagnose and fix any reported errors.
