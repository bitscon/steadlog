# Schema Alignment Report

## Objective
Bring repository-managed migration history in alignment with actively used application schema before Phase 2.

## Inspection Method
1. Reviewed tracked migrations in `supabase/migrations`.
2. Reviewed runtime table usage via application queries (`.from('<table>')` across `src/`).
3. Reviewed generated schema snapshot in `src/integrations/supabase/types.ts`.
4. Attempted direct CLI pull from remote project.

CLI status:
- `supabase db pull` could not run in this workspace because project linking credentials were not available (`Cannot find project ref. Have you run supabase link?`).
- Alignment therefore used the repository's schema snapshot (`types.ts`) + runtime query surface as the authoritative baseline for this pass.

## Baseline Gap
Before this pass, tracked migrations only included:
- `20251228_stripe_subscriptions.sql`
- `20260306090000_praxis_phase1_core_logging.sql`

But runtime code actively depends on additional tables, including:
- `profiles`, `properties`, `animals`, `tasks`, `inventory_items`, `journal_entries`
- `financial_categories`, `transactions`
- `homestead_goals`, `goal_updates`
- `infrastructure`, `medications`, `grooming_schedules`, `grooming_records`
- `crops`, `crop_rotations`, `breeding_events`
- `user_stats`, `xp_events`, `user_achievements`, `user_privacy_settings`

## Migration Added
New migration:
- `supabase/migrations/20260306110000_schema_alignment_phase1_legacy.sql`

This migration adds/aligns:
- Missing legacy domain tables used by active code paths
- Missing compatibility columns for known API/table drift
- RLS policies for user-owned data access
- Updated-at triggers for mutable tables
- Supporting indexes for common query patterns
- Avatar storage bucket and ownership policies

## Governance Outcome
- Repository migration history now contains tracked definitions for the active schema surface used by the app.
- Manual one-off SQL files are no longer the sole source for critical legacy tables.
- Schema governance is materially improved for reproducibility and review.

## Follow-Up Recommendation
After credentials are available, run:
1. `supabase link --project-ref <ref>`
2. `supabase db pull`
3. Compare remote state with new migration to reconcile any remaining environment-specific drift.
