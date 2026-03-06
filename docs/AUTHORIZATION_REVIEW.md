# Authorization Review

## Scope
Review and hardening of data-access paths to ensure user isolation for SteadLog and legacy modules.

## Method
- Reviewed Supabase query/mutation calls across `src/features`, `src/pages`, `src/game`, and `src/lib`.
- Verified `user_id` scoping in select/update/delete paths.
- Hardened missing ownership checks.

## High-Risk Findings Addressed

### 1) Goals update/delete ownership enforcement
Previous issue:
- Goal update and delete APIs could be called by `id` without explicit `user_id` filter in the API layer.

Fix:
- Updated goal APIs to require `userId` and enforce `.eq('user_id', userId)` in mutating paths.
- Updated call sites in `HomesteadGoals` accordingly.

Files changed:
- `src/features/goals/api.ts`
- `src/pages/HomesteadGoals.tsx`

### 2) Medication ownership enforcement
Previous issue:
- `updateMedication` did not enforce user ownership in query filter.
- `getMedication` did not scope reads to owner/shared rows.

Fix:
- `updateMedication(id, userId, ...)` now enforces `.eq('user_id', userId)`.
- `getMedication(id, userId)` now scopes to owner or shared (`user_id is null`).
- Updated call site in `HealthHub`.

Files changed:
- `src/features/health/medicationsApi.ts`
- `src/pages/HealthHub.tsx`

## RLS and Policy Posture
- Phase 1 core tables (`homestead_actions`, `homestead_action_media`, `praxis_reminders`, `praxis_milestones`) already have explicit RLS in tracked migrations.
- This stabilization pass also adds tracked migration coverage for legacy tables and user-owned policy templates in:
  - `supabase/migrations/20260306110000_schema_alignment_phase1_legacy.sql`

## Remaining Considerations
- Some features intentionally read cross-user data under privacy constraints (leaderboard). Those paths require corresponding RLS policies (included in schema alignment migration).
- Route-level auth is enforced via `ProtectedRoute`; authorization remains table-policy-driven at database level.

## Result
Critical authorization gaps identified in the audit have been remediated in the application layer and reinforced in migration-governed RLS policy definitions.
