# ConveGenius O2O to O2C Portal Prototype

A complete runnable React + TypeScript + Tailwind UI prototype for the revised O2O to O2C Farming Governance platform.

## What is included

- Vite React TypeScript app
- Tailwind setup
- Lucide icons
- Complete `src/App.tsx` with reusable UI components
- Mock data for opportunities, O2C projects, PABs, pod capacity, audit events, and RBAC
- Screens for:
  - Executive Home
  - O2O Pipeline
  - Opportunity Detail
  - O2C Projects
  - PAB Governance
  - Finance and CM2
  - Pod Capacity
  - Audit Log
  - Admin / RBAC

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Recommended Codex prompt

Ask Codex to:

1. Split `src/App.tsx` into folders: `components`, `data`, `types`, `pages`, `layout`.
2. Add React Router.
3. Convert mock data into API service functions.
4. Add create/edit drawers for opportunities, PABs, milestones, proofs, invoices, and collections.
5. Add role-based action visibility.
6. Add form validation for source rules:
   - O2C starts only after signed MOU upload.
   - CFO sign-off blocks bid submission.
   - Won requires Award Communication evidence.
   - Revenue Capture Pod remains accountable until 100 percent collection.
