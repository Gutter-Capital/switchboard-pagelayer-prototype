# Switchboard PageLayer Prototype

Standalone interaction prototype for task-driven commercial insurance workflows in Switchboard. It explores how a broker can move from a dense task queue into contextual side rails and dedicated workspaces without losing their place.

## Live prototype

https://switchboard-pagelayer-prototype.vincelinyc.chatgpt.site/tasks

## What to review

- **Task queue and task rail:** select the Coterie information request or the Accident Fund quote-review task.
- **Agent entry point:** use `Ask Agent` on the information-request card to see the contextual agent treatment.
- **Account overview:** open Bob Smith Construction to review the overview, opportunity, intake, and activity states.
- **Opportunity table:** select quote-option rows to reveal the sticky action bar.
- **Quote comparison:** compare selected rows in a PageLayer and close it to restore selection and scroll position.
- **Quote detail:** open a quote from the comparison matrix to see extracted values alongside the source document.
- **Dedicated task workspace:** use `Review new quote` to review material differences and choose a next step.

## Key routes

| Route | Purpose |
| --- | --- |
| `/tasks` | Main task queue and contextual task rail |
| `/tasks/task-bob-property-options/workspace` | Dedicated workspace for a returned property quote |
| `/accounts/acct-bob-smith-construction` | Account overview and opportunities tab |
| `/accounts/acct-bob-smith-construction/compare` | Selected quote-option comparison PageLayer |
| `/accounts/acct-bob-smith-construction/opportunities/opp-bob-renovation/quote-requests/qr-bob-accident-fund-property` | Quote detail with split source-document view |
| `/task-rail-concepts` | Earlier task-rail design explorations retained for reference |

## Run locally

Requirements: Node.js 20 or newer and npm.

```bash
npm install
npm run dev -- --port 5178
```

Open `http://127.0.0.1:5178/tasks`.

Useful checks:

```bash
npm run lint
npm run build
```

## Project structure

- `src/App.tsx` contains the prototype shell, routes, task views, account views, quote comparison, and workspaces.
- `src/data.ts` contains the fictional account, opportunity, quote, and task fixtures.
- `src/TaskRailConcepts.tsx` contains the retained task-rail concept page.
- `src/components/ui` contains the shadcn-based interface primitives.
- `design-qa.md` records the visual review checklist used while refining the prototype.

## Prototype boundaries

- All account, task, opportunity, and quote data is fictional and stored locally in `src/data.ts`.
- Actions update only in-memory interface state; there is no persistence or backend integration.
- Source-document previews are representative UI, not an extraction pipeline.
- Authentication, permissions, notifications, and production error states are outside the prototype scope.
- This is a Vite/React design prototype, not code intended to be merged directly into the Rails application.

## Product direction captured here

The prototype treats the task queue as the broker's operational home. Simple tasks can be completed in the right rail with relevant account and opportunity context. Complex tasks can expand into a dedicated workspace while preserving queue position. Quote comparison begins from selectable opportunity-table rows, and the PageLayer makes differences visible without replacing the underlying account workflow.

When moving this into the production application, preserve the workflow and information hierarchy first. Rebuild the components around Switchboard's Rails architecture, authorization, persistence, and real quote data rather than copying the prototype wholesale.
