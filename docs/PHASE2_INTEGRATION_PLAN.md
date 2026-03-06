# Phase 2 Integration Plan (Reuse-First)

## Purpose
Define how Phase 2 should extend SteadLog by integrating existing modules instead of recreating them.

## Integration Principles
- Reuse existing domain CRUD modules where they are already functional.
- Make `HomesteadAction` the central event stream for cross-module memory.
- Add adapters and links before adding new tables.
- Avoid parallel feature stacks with overlapping semantics.

## Reuse Matrix
| Existing module/system | Current status | Integration target in Phase 2 | Avoid recreating |
|---|---|---|---|
| `features/animals` + `HealthHub` | Working legacy module | Add animal selector into Quick Log and emit `HomesteadAction` with `animal_id` for key actions | Do not build a second animal registry |
| `features/tasks` + `SeasonalCalendar` | Working legacy module | Map task completion/creation events into timeline via HomesteadAction and optional reminder linkage | Do not create a separate “steadlog tasks” table |
| `features/crops` and rotation planning | Partial but functional with fallback | Use existing crop rotation records as garden context sources for logs/reminders | Do not create duplicate garden planning module without migration plan |
| `features/infrastructure` | Working legacy module | Emit homestead actions for project milestones (planned/in-progress/completed) | Do not duplicate project tracking in SteadLog core |
| `features/inventory` | Functional UI but schema drift risk | Reconcile schema and then publish low-stock and replenishment actions into timeline | Do not create separate inventory timeline model |
| `features/journal` | Working legacy module | Link journal entries into timeline as enriched notes (through adapter) | Do not create new standalone note engine |
| `features/finance` | Working legacy module | Keep isolated from core memory loop initially; optionally emit summary milestones only | Do not merge raw financial transactions into homestead action table |
| Gamification (`xp_events`, achievements) | Working but broad | Keep as secondary engagement layer tied to actions | Do not fork a second scoring system |
| Subscription scaffolding | Partial/unintegrated | Wire entitlement checks to route guards and feature flags | Do not duplicate plan logic in page components |

## Integration Architecture (Recommended)

### 1) Event Adapter Layer
Create a thin adapter layer (planning item) where legacy module events map to `createHomesteadAction`.

Examples:
- task completed -> category `task`, action_type `Completed task: <title>`
- medication applied -> category `animal`, includes `animal_id`
- harvest logged -> category `garden`

This preserves existing modules while feeding one timeline.

### 2) Shared Entity Pickers
Standardize reusable selectors for:
- `animal_id`
- `property_id`
- future `garden_id` context

Use existing tables (`animals`, `properties`, `crop_rotations`) to avoid creating duplicate lookup services.

### 3) Reminder Convergence
Use `praxis_reminders` as canonical reminder store.
- Existing due-date concepts from tasks/health should map into this store.
- Avoid introducing additional reminder tables per module.

### 4) Timeline Federation
Timeline should remain one feed.
- Primary source: `homestead_actions`
- Secondary source: `praxis_milestones`, `praxis_reminders`
- Legacy modules publish to timeline through adapters rather than custom timeline UIs.

## Dependency Order for Phase 2
1. Schema contract reconciliation (generated types vs runtime tables).
2. Event adapter integration for tasks + animals first.
3. Reminder convergence for due-date workflows.
4. Gradual module onboarding (crops, inventory, infrastructure, journal).
5. Entitlement and feature-flag enforcement using existing subscription tables.

## Anti-Patterns to Avoid
- Creating `steadlog_*` duplicates for existing functional tables without migration strategy.
- Building module-specific offline queues separate from core queue.
- Introducing separate timeline implementations in legacy pages.
- Re-implementing entity CRUD already available in legacy modules.

## Phase 2 Start Recommendation
Start with **Animals + Tasks integration into HomesteadAction** because these have the strongest day-to-day logging relevance and existing stable UI surfaces.
