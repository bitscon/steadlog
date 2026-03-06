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

## Phase 2A Implementation: Animal Profiles

### Completed Integration
- Reused the existing `animals` domain module and schema (no duplicate animal registry introduced).
- Added dedicated animal profile surfaces:
  - `Animals` page for create/list.
  - `Animal Profile` page for focused notes editing and action history.
- Connected animal selection into Quick Log for `animal` category actions.
- Added inline quick-create in Quick Log when no animal exists (or when user needs a new profile immediately).
- Persisted `animal_id` on `homestead_actions` so action ownership stays linked to specific animals.
- Added timeline title enrichment so animal actions render with names when available (example: `Vaccinated Daisy`).

### Data Flow
1. User selects `Animal` category in Quick Log.
2. User selects existing animal or creates one inline.
3. Action is saved to `homestead_actions` with `animal_id`.
4. Timeline resolver joins animal names and renders contextual action titles.
5. Offline queued actions preserve metadata and resolve to the same display behavior after sync.

### Guardrails
- Scope remains intentionally simple: no herd management, breeding logic, or production analytics.
- `HomesteadAction` remains the central memory stream; animals provide context, not a separate event system.

## Phase 2B Implementation: Quick Presets + Shareable Log Cards

### Completed Integration
- Reused the existing `log_presets` entity and API surface (`presetsApi`) rather than creating parallel quick-action tables.
- Seeded default presets (`Collect Eggs`, `Feed Animals`, `Water Garden`, `Harvest`, `Vaccinate Animal`, `Plant Seeds`) automatically when a user has no presets.
- Integrated one-tap preset buttons into Quick Log to prefill `action_type` and category while preserving optional animal selection for animal actions.
- Added in-panel preset management for edit/remove/add operations so users can evolve presets without leaving Quick Log.
- Added timeline share controls only for synced `HomesteadAction` entries (no special storage model, no social graph additions).
- Added share-card generation and export options:
  - native share dialog (with image file when supported)
  - copy action link (`/timeline?action=<id>`)
  - download card image (PNG)

### Data Flow: Quick Preset to Action
1. User taps a preset in Quick Log.
2. UI pre-fills action text/category and opens normal logging input state.
3. User optionally selects an animal profile.
4. Save writes canonical `homestead_actions` row (plus optional reminder/media), identical to custom logs.

### Data Flow: Share Card
1. User taps `Share` on a timeline action entry.
2. UI derives card payload from existing timeline entry fields (`title`, `subtitle`, `timestamp`, `action.id`).
3. Client renders a lightweight share card image and offers native share/copy/download.
4. Shared action remains a standard `HomesteadAction`; no additional persistence required.

### Guardrails
- Sharing is informational only; no comments, likes, follows, or feed mechanics.
- Reminders and milestones remain non-shareable in this phase to keep behavior explicit and simple.
