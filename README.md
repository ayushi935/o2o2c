# ConveGenius O2O → O2C Governance Platform (UI Prototype v1)

Frontend-only prototype using **Vite + React + TypeScript + Tailwind CSS + lucide-react** with **mock JSON data only**.

## Local setup

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite (typically `http://localhost:5173`).

### Recommended local environment

- Node.js 18+ (or 20+)
- npm 9+

## Folder structure

- `src/components` reusable components
- `src/data` mock JSON data
- `src/layout` app shell, sidebar, header
- `src/pages` screen compositions
- `src/types` domain types
- `src/utils` helper constants/rules

## Screens implemented

1. Executive Home
2. O2O Pipeline
3. Opportunity Detail
4. PAB Governance
5. Financial Approval Queue
6. RFP & Bid Management
7. MOU Workspace
8. O2C Projects
9. O2C Project Detail
10. Milestone-to-Cash Tracker
11. Finance & CM2 Dashboard
12. Pod Capacity Dashboard
13. Audit Log
14. Admin / RBAC

## Governance rules reflected in UI

- O2C starts only after signed MOU upload.
- CFO sign-off blocks bid submission.
- Won requires award communication evidence.
- Orders Won is evidence-led, not Kanban-column derived.
- Revenue Capture Pod remains accountable until 100% collection.
- Pre-Bid PAB decisions use: Go, Conditional Go, Hold, No-Go.
- Mid-Project PAB triggers include timeline/margin and delivery risk events.
- Soft-deleted records remain visible in audit.
