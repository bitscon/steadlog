# Dead Code and Duplication Report

## Method
Signals were collected from:
- import graph scan (`madge --orphans src`)
- unused export scan (`ts-prune`)
- targeted code search for duplicate/legacy implementations

No files were deleted in this audit.

## Findings
| Item | Evidence | Impact | Recommendation |
|---|---|---|---|
| Unused layout/navigation components | `src/components/Topbar.tsx`, `src/components/NavLink.tsx` are import orphans | Increases maintenance surface and confuses navigation ownership | `delete` if no near-term use; otherwise `merge` needed behavior into active shell (`ProtectedLayout` + `Sidebar`) |
| Unused feature list components | `src/features/animals/AnimalList.tsx`, `src/features/goals/GoalList.tsx`, `src/features/inventory/InventoryList.tsx`, `src/features/inventory/LowStockAlert.tsx`, `src/features/properties/PropertyList.tsx` are not referenced by routed pages | Duplicate UI patterns and drift from active page implementations | `merge` useful logic into routed page variants or `delete` redundant components |
| Unused toast stack implementation | `src/hooks/use-toast.ts` and `src/components/ui/sonner.tsx` are orphaned; no `<Toaster />` mount detected in app shell | High UX risk: toast calls may not render reliably; two competing toast paradigms | `merge` to a single notification system and `refactor` app root to mount one toaster provider |
| Unused subscription helper layer | `src/lib/subscription.ts` exports largely unused and not connected to route guards/features | Billing code path appears incomplete and can mislead future work | `keep` but mark as `partial`; integrate or archive behind a feature flag |
| Legacy module namespace under SteadLog | Core SteadLog lives in `src/features/praxis/*` and query keys/storage keys use `praxis.*` | Branding and domain-language drift; future contributors may create duplicate modules | `refactor` module path and query key naming in a dedicated non-functional rename pass |
| Duplicate sync loop mounting | `useSyncQueue` is called in both `SteadLogBackgroundServices` and `SteadLogLog` | Can trigger overlapping intervals and duplicate sync attempts/toasts | `refactor` to single shared sync service, expose UI state via context/store |
| Manual SQL outside migration source of truth | `gamification_tables.sql`, `infrastructure_table.sql`, `scripts/init-db.sql` duplicate schema definitions outside `supabase/migrations` | Schema drift and non-reproducible environments | `merge` into reviewed migrations; keep manual SQL only as archived reference |
| Committed binary deployment artifacts | `homestead-deployment.tar.gz`, `homestead-manual-deployment.tar.gz`, `websites/homestead-architect-website/homestead-architect-website-v1.0.1.zip` | Repository bloat and unclear provenance/versioning | `delete` from VCS, move release artifacts to package registry or release assets |
| Legacy brand and deployment remnants | Workflows/scripts/docs still reference `homestead-architect-game` and Homestead Architect naming | Operational confusion and potential misdeployment | `refactor` deployment docs/workflows after remote rename is finalized |
| Partially implemented fallback behavior in breeding | `src/features/breeding/api.ts` falls back to `xp_events` when `breeding_events` table missing | Implies abandoned/uncertain schema path and mixed semantics | `refactor` by choosing one canonical schema and migration path |
| Placeholder docs/state files | `PROJECT_STATE.md` is empty; numerous legacy deployment docs overlap | Documentation noise, slower onboarding | `merge` active docs, `archive` historical notes, `delete` empty placeholders |

## Orphan Module Snapshot (from `madge`)
Primary non-UI orphan candidates:
- `src/components/Topbar.tsx`
- `src/components/NavLink.tsx`
- `src/features/animals/AnimalList.tsx`
- `src/features/goals/GoalList.tsx`
- `src/features/inventory/InventoryList.tsx`
- `src/features/inventory/LowStockAlert.tsx`
- `src/features/properties/PropertyList.tsx`
- `src/hooks/use-toast.ts`
- `src/lib/subscription.ts`

UI primitive orphans are mostly shadcn-generated components; these are generally `keep` unless bundle-size optimization is prioritized.

## Recommendation Summary
- Immediate cleanup candidates (`delete`): clearly unused components and committed binary artifacts.
- Consolidation candidates (`merge`/`refactor`): toast stack, sync service ownership, and schema SQL sources.
- Preserve with explicit roadmap (`keep`): subscription scaffolding and reusable UI primitives.
