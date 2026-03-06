# Data Model Audit

## Scope
This audit cross-references:
- Supabase generated types: `src/integrations/supabase/types.ts`
- Tracked DB migrations: `supabase/migrations/*.sql`
- Runtime table usage via `.from('<table>')` queries in `src/`

## Global Findings
- Tracked migration history includes only two migrations (`stripe_subscriptions`, `phase1_core_logging`) while runtime code uses many additional tables.
- Several feature APIs use field names that do not align with generated type definitions, indicating schema contract drift.
- SteadLog core entities (`homestead_actions`, `homestead_action_media`, `praxis_reminders`, `praxis_milestones`) are the most coherent and migration-backed domain group.

## Entity Inventory
| Entity (table) | Purpose | Key fields observed in code | Relationships | Current usage |
|---|---|---|---|---|
| `profiles` | User profile and app settings | `id`, `first_name`, `last_name`, `display_name`, `role`, `avatar_url`, subscription-related fields | 1:1 with `auth.users` via `id` | Active (`AuthContext`, `UserProfile`) |
| `homestead_actions` | Core SteadLog append-first memory records | `id`, `user_id`, `client_id`, `category`, `action_type`, `notes`, `action_timestamp`, `sync_state`, `media_ids`, `metadata` | 1:N to `homestead_action_media`; 1:N to `praxis_reminders`; optional 1:N to `praxis_milestones` | Active (Phase 1 core) |
| `homestead_action_media` | Media attachments for actions | `id`, `action_id`, `user_id`, `storage_path`, `public_url`, `mime_type`, `size_bytes`, `metadata` | N:1 to `homestead_actions` | Active (online uploads only) |
| `praxis_reminders` | Follow-up reminders tied to actions or standalone | `id`, `user_id`, `action_id`, `client_id`, `title`, `category`, `due_at`, `status`, `notified_at` | N:1 to `homestead_actions` via `action_id` | Active |
| `praxis_milestones` | Milestone records surfaced in timeline | `id`, `user_id`, `action_id`, `milestone_type`, `title`, `description`, `achieved_at` | Optional N:1 to `homestead_actions` | Active |
| `animals` | Animal records and metadata | `id`, `user_id`, `name`, `type`, `breed`, `birth_date`, `property_id` | Optional N:1 to `properties` | Active (legacy module) |
| `medications` | Medication catalog for animal health | `id`, `user_id`, `name`, dosage/withdrawal metadata | Used by health workflows; no explicit foreign key in code | Active (legacy module) |
| `grooming_schedules` | Repeating grooming plans | `id`, `user_id`, `animal_id`, `grooming_type`, `frequency_days`, `is_active` | N:1 to `animals` | Active (legacy module) |
| `grooming_records` | Completed grooming events | `id`, `user_id`, `animal_id`, `grooming_type`, `date` | N:1 to `animals` | Active (legacy module) |
| `tasks` | Seasonal and operational tasks | `id`, `user_id`, `title`, `status`, `due_date`, `property_id` | Optional N:1 to `properties` | Active (legacy module) |
| `journal_entries` | Journal notes/history | `id`, `user_id`, date/content fields | Independent; optional property association in API | Active (legacy module) |
| `properties` | Property/homestead units used for filtering and assignment | `id`, `user_id`, `name`, `size_acres`, `location` and extended attributes | Referenced by animals, tasks, finance, crop rotation, health | Active (legacy module) |
| `financial_categories` | Transaction categorization | `id`, `user_id`, `name`, `color` | 1:N with `transactions` via `category_id` | Active (legacy module) |
| `transactions` | Financial records | `id`, `user_id`, `amount`, `type`, `category_id`, `date`, `property_id` | N:1 with `financial_categories`; optional N:1 to `properties` | Active (legacy module) |
| `homestead_goals` | Goal planning records | `id`, `user_id`, `title`, `category`, `priority/status`, target dates | 1:N with `goal_updates` via `goal_id` | Active (legacy module) |
| `goal_updates` | Goal progress checkpoints | `id`, `goal_id`, `user_id`, progress fields | N:1 to `homestead_goals` | Active (legacy module) |
| `infrastructure` | Infrastructure planning projects | `id`, `user_id`, `name`, `type`, `status`, `priority`, costs/dates | Independent | Active (legacy module) |
| `inventory_items` | Inventory stock records | `id`, `user_id`, item fields, quantity thresholds | Independent | Active (legacy module; schema drift risk) |
| `crop_rotations` | Crop rotation planning | `id`, `user_id`, plot/season/year/crop fields | Optional N:1 to `properties` | Active (legacy module) |
| `crops` | Crop catalog list | `id`, `name` | Used by planner as lookup/fallback | Active (fallback tolerant) |
| `breeding_events` | Breeding lifecycle events | IDs, event dates/status and parent refs | N:1 to animals conceptually | Partial (fallback to `xp_events` indicates uncertain canonical source) |
| `xp_events` | XP action ledger | `id`, `user_id`, `action`, `xp`, `metadata`, `created_at` | Feeds stats, achievements, leaderboard, breeding fallback | Active |
| `user_stats` | XP aggregates | `user_id`, `total_xp`, `level` | Derived from `xp_events` | Active |
| `user_achievements` | Achievement unlocks | `user_id`, `achievement_id`, `unlocked_at` | Driven by achievement engine | Active |
| `user_privacy_settings` | Leaderboard visibility preferences | `user_id`, `show_on_leaderboard`, `display_name` | Joined with `user_stats` for leaderboard | Active |
| `user_subscriptions` | Billing subscription state | `user_id`, plan/status/period fields, Stripe IDs | Drives entitlement derivation | Partial (model exists, app integration limited) |
| `user_entitlements` | Feature limits and access flags | `user_id`, access booleans and resource caps | Intended for feature gating | Partial (helper exists, route-level enforcement absent) |
| `stripe_events` | Webhook idempotency ledger | `event_id`, `type`, `payload` | Billing backend concern | Unused by frontend runtime |

## Relationship Map (High Level)
- `auth.users` -> `profiles` (1:1)
- `auth.users` -> `homestead_actions` (1:N)
- `homestead_actions` -> `homestead_action_media` (1:N)
- `homestead_actions` -> `praxis_reminders` (1:N)
- `homestead_actions` -> `praxis_milestones` (1:N optional)
- `homestead_goals` -> `goal_updates` (1:N)
- `financial_categories` -> `transactions` (1:N)
- `properties` -> `animals/tasks/transactions/crop_rotations` (1:N optional)
- `auth.users` -> `xp_events/user_stats/user_achievements/user_privacy_settings` (1:N or 1:1 as defined)
- `auth.users` -> `user_subscriptions/user_entitlements` (1:1 intended)

## Field Contract Drift (Critical)
Detected mismatches between generated Supabase types and feature-layer expectations:
- `tasks`: API uses `category`; generated type uses `priority`.
- `inventory_items`: API uses `current_stock`/`reorder_point`; generated type uses `quantity`/`minimum_quantity`.
- `journal_entries`: API uses `date`, `image_urls`, `property_id`; generated type uses `entry_date`, `mood`, `weather`.
- `properties`: API includes `climate_zone`, `soil_type`, `soil_ph`, `sun_exposure`, `water_sources`; generated type defines different shape (`description`, `property_type`, `purchase_*`).

This indicates either:
1. generated types are stale, or
2. runtime code and DB schema are diverged.

## Data Integrity and Governance Risk
- Source-of-truth issue: many active entities are not represented in tracked migration history.
- Reproducibility issue: some schema setup still relies on manual SQL artifacts outside migration governance.
- Security implication: authorization and RLS posture for legacy tables cannot be verified end-to-end from migration history alone.

## Audit Recommendation
Before Phase 2 feature work:
1. Reconcile and regenerate typed schema contracts from the actual production schema.
2. Move any authoritative manual SQL into reviewed `supabase/migrations`.
3. Mark deprecated entities explicitly (if retained) and publish ownership for each domain table.
