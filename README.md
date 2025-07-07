# Front‑End Application

## Overview

This repository contains the source code for a **TypeScript + React** single‑page application (SPA).  The UI is built with modern React components, Tailwind CSS utility classes for styling, and a small set of focused libraries to handle routing, data visualisation, and form management.

Key characteristics:

* **Framework‑agnostic React** – no heavy boilerplate, just functional components and hooks.
* **Type safety** – TypeScript keeps the codebase maintainable and self‑documenting.
* **Responsive design** – Tailwind CSS makes it easy to target different break‑points.
* **Data visualisation** – Recharts provides accessible, responsive charts.
* **Zero‑config tooling** – Vite handles lightning‑fast local development and optimised production builds.

---

## Table of Contents

1. [Demo](#demo)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Quick Start](#quick-start)
5. [Scripts](#scripts)
6. [Environment Variables](#environment-variables)
7. [Project Structure](#project-structure)
8. [How It Works](#how-it-works)
9. [Testing & Quality Assurance](#testing--quality-assurance)
10. [Deployment](#deployment)
11. [Troubleshooting](#troubleshooting)
12. [Contributing](#contributing)
13. [License](#license)

---

## Demo

Once the development server is running, open [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal) in your browser.  Any saved file changes trigger instant hot‑module replacement without losing component state.

---

## Tech Stack

| Purpose      | Library / Tool                          |
| ------------ | --------------------------------------- |
| Core UI      | **React** 18 + **TypeScript**           |
| Build tool   | **Vite**                                |
| Styling      | **Tailwind CSS** + PostCSS              |
| Charts       | **Recharts**                            |
| Forms        | React Hook Form                         |
| HTTP client  | Axios                                   |
| Code quality | ESLint + Prettier + Husky (pre‑commit)  |
| Tests        | Vitest (unit) + Testing Library / JSDOM |

---

## Prerequisites

* **Node.js** ≥ 18 LTS
  (Check with `node -v`)
* **npm** ≥ 10 **or** **yarn** ≥ 3

> **Tip:** Use **nvm** to manage multiple Node versions.

---

## Quick Start

```bash
# 1 – Clone the repository
$ git clone https://github.com/<your‑org>/<your‑repo>.git
$ cd <your‑repo>

# 2 – Install dependencies
$ npm ci         # or: yarn install --immutable

# 3 – Start the dev server
$ npm run dev    # or: yarn dev

# 4 – Build a production bundle
$ npm run build  # or: yarn build

# 5 – Preview a production build locally
$ npm run preview
```

### Common Tasks

| Script    | Purpose                                              |
| --------- | ---------------------------------------------------- |
| `dev`     | Launch Vite with Hot‑Module Replacement.             |
| `build`   | Generate an optimised bundle in `dist/`.             |
| `preview` | Serve the bundle locally at `http://localhost:4173`. |
| `lint`    | Run ESLint over `src/`.                              |
| `format`  | Run Prettier in write mode.                          |
| `test`    | Execute unit tests via Vitest.                       |
| `prepare` | Husky hook – executed automatically on install.      |

---

## Environment Variables

Create a copy of `.env.example` → `.env` and adjust the values:

```env
# API
VITE_API_BASE_URL=https://api.example.com

# Feature toggles
VITE_ENABLE_EXPERIMENTAL=false
```

* All variables **must** be prefixed with `VITE_` to be exposed in the client at build time.

---

## Project Structure

```
├── public/              # Static assets copied verbatim
├── src/
│   ├── assets/          # Images, icons, fonts
│   ├── components/      # Reusable UI building blocks
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Route‑level components (React Router)
│   ├── services/        # API clients and data mappers
│   ├── store/           # Global state (Zustand / Context / Redux)
│   ├── styles/          # Tailwind CSS config & global styles
│   ├── tests/           # Vitest unit tests
│   └── main.tsx         # App entry point
├── .env.example         # Sample environment variables
├── vite.config.ts       # Vite configuration
└── tsconfig.json        # TypeScript compiler options
```

---

## How It Works

1. **Bootstrapping**
   `main.tsx` mounts the root `<App />` component into the DOM.  React Router configures top‑level routes that lazy‑load page components via `React.lazy`, dramatically reducing initial bundle size.

2. **State Management & Side‑Effects**
   A lightweight store (Zustand by default) encapsulates global state.  Side‑effects such as HTTP requests are triggered inside React Query hooks, providing caching, retry logic, and background re‑validation.

3. **Data Flow**

   * UI components request data through the **service layer** in `src/services/`, which wraps Axios and automatically attaches authentication tokens retrieved from local storage.
   * Responses are normalised into plain TypeScript models before hitting the UI, ensuring prop types remain tight.

4. **Styling System**
   Tailwind CSS classes are composed within the component JSX.  A dedicated `clsx` utility helps conditionally toggle classes.  Dark‑mode is enabled by default (class strategy), and can be toggled via context.

5. **Visualisation**
   Charts are rendered with Recharts.  A set of small wrapper components in `src/components/charts/` standardises theme tokens and accessibility labels.

6. **Build Pipeline**
   Vite uses `esbuild` during dev for near‑instant HMR, then switches to `rollup` for production, applying **tree‑shaking**, **code‑splitting**, and **asset hashing**.  The output is written to `dist/`.

---

## Testing & Quality Assurance

* **Unit Tests** – Vitest + Testing Library simulate hooks and DOM interactions.
* **Static Analysis** – ESLint rules cover recommended React, TypeScript, and accessibility best‑practices.
* **Formatting** – Prettier enforces consistent code style.  A pre‑commit Husky hook prevents pushes that fail lint or tests.

Run all checks with a single command:

```bash
npm run ci   # or: yarn ci
```

---

## Deployment

1. Build the project:

   ```bash
   npm run build
   ```
2. Upload the contents of **`dist/`** to your static host of choice (Netlify, Vercel, Cloudflare Pages, Firebase Hosting, etc.).  The build is completely static and does not require a Node server.
3. If you rely on client‑side routing, configure a fallback (e.g., `_redirects` file or 404 rewrite rule) that serves `index.html` for unknown paths.

---

## Troubleshooting

| Symptom                             | Fix                                                                        |
| ----------------------------------- | -------------------------------------------------------------------------- |
| **Command not found: tailwindcss**  | Ensure `node_modules/.bin` is on your PATH or use `npx tailwindcss`.       |
| **\[vite] Dep optimisation failed** | Delete `node_modules` and `vite‑dep‑cache/`, then re‑install dependencies. |
| **White screen after deploy**       | Check that the server rewrites all paths to `index.html`.                  |

If you get stuck, run `npm run doctor` (community script) to analyse common environment issues.

---

## Contributing

1. Fork the repository and create a new branch: `git checkout -b feat/my‑feature`.
2. Follow the commit‑message convention `type(scope): subject` (e.g., `feat(auth): add JWT refresh`).
3. Push your branch and open a Pull Request.  GitHub Actions will run the full CI suite.
4. Once approved, the branch can be squash‑merged by maintainers.

---

## License

MIT — see **LICENSE**.

