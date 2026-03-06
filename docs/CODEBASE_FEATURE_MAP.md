# SteadLog Codebase Feature Map

## Scope and Method
This inventory was produced by auditing `src/`, `supabase/migrations/`, CI workflows, and deployment assets.

Status labels:
- `Implemented`: feature is wired to routes/UI and backend calls.
- `Partial`: feature exists but has known functional or architectural gaps.
- `Legacy`: implemented but misaligned with current SteadLog Phase 1 product focus.

## Feature Inventory
| Feature | Description | Primary files | Integration points | Status |
|---|---|---|---|---|
| Authentication and session gating | Supabase auth with protected routes and profile loading | `src/contexts/AuthContext.tsx`, `src/components/ProtectedRoute.tsx`, `src/pages/auth/Login.tsx`, `src/pages/auth/Register.tsx` | Used by `App.tsx`, all protected pages, `Sidebar` | Implemented |
| SteadLog Quick Log | Barn-first action logging UI with category-first flow | `src/pages/SteadLogLog.tsx`, `src/features/praxis/QuickLogPanel.tsx` | Writes via `createHomesteadAction`; invalidates timeline/reminder queries | Implemented |
| HomesteadAction persistence | Append-first action model with client idempotency keys | `src/features/praxis/api.ts`, `supabase/migrations/20260306090000_praxis_phase1_core_logging.sql` | `homestead_actions` table; consumed by log/timeline pages | Implemented |
| Timeline feed | Unified reverse-chronological timeline for actions, reminders, milestones, queued offline actions | `src/pages/SteadLogTimeline.tsx`, `src/features/praxis/TimelineFeed.tsx`, `src/features/praxis/api.ts` | Pulls from `homestead_actions`, `praxis_reminders`, `praxis_milestones`, local queue | Implemented |
| Offline queue and sync | Local action queue with periodic and online-event sync | `src/features/praxis/offlineQueue.ts`, `src/features/praxis/useSyncQueue.ts`, `src/features/praxis/SteadLogBackgroundServices.tsx` | Mounted in `ProtectedLayout`; also mounted in `SteadLogLog` for controls | Partial (duplicate hook mounting can cause overlapping sync loops) |
| Reminder engine | Due reminder polling, toast/browser notification, status transitions | `src/features/praxis/useReminderEngine.ts`, `src/features/praxis/api.ts` | Mounted globally in protected shell | Implemented |
| Photo attachments | Uploads photos to Supabase Storage and links media rows to actions | `src/features/praxis/QuickLogPanel.tsx`, `src/features/praxis/api.ts` | `homestead_action_media`, storage bucket `homestead-action-media` | Partial (offline queue does not persist binary files; offline photos are deferred/lost until reattach online) |
| Milestone generation | Auto-creates first-category milestones from action inserts | `supabase/migrations/20260306090000_praxis_phase1_core_logging.sql` | DB trigger `create_category_milestone_on_action`, surfaced in timeline | Implemented |
| Dashboard and gamification | XP/level, achievements, leaderboard, dashboard stats | `src/pages/Dashboard.tsx`, `src/game/gameEngine.ts`, `src/game/achievements.ts`, `src/game/leaderboardApi.ts`, `src/pages/Achievements.tsx` | Uses `xp_events`, `user_stats`, `user_achievements`, `user_privacy_settings` | Partial (legacy gamification scope beyond Phase 1, plus schema provenance drift) |
| Animal and health hub | Animal records, medications, grooming schedules and records, dosage calculator | `src/pages/HealthHub.tsx`, `src/features/animals/api.ts`, `src/features/health/*` | Integrates `animals`, `medications`, `grooming_schedules`, `grooming_records`, `properties` | Legacy (rich module not yet integrated into HomesteadAction memory loop) |
| Task tracking and seasonal calendar | Task CRUD and calendar views | `src/pages/SeasonalCalendar.tsx`, `src/features/tasks/*` | Uses `tasks` and `properties`; awards XP | Legacy |
| Journal | Journal entry CRUD with tags/images | `src/pages/HomesteadJournal.tsx`, `src/features/journal/*` | Uses `journal_entries`; awards XP | Legacy |
| Finance (Homestead Balance) | Category and transaction management with dashboarding | `src/pages/HomesteadBalance.tsx`, `src/features/finance/*` | Uses `financial_categories`, `transactions`, `properties`; awards XP | Legacy |
| Inventory management | Inventory CRUD plus low-stock logic | `src/pages/InventoryManagement.tsx`, `src/features/inventory/*` | Uses `inventory_items`; awards XP | Legacy/Partial (field naming drift risk vs generated DB types) |
| Property management | Property CRUD and assignment source for other modules | `src/pages/PropertyAssessment.tsx`, `src/features/properties/*` | Used by tasks, animals, finance, crops, health | Legacy/Partial (field naming drift risk vs generated DB types) |
| Infrastructure planner | Infrastructure project lifecycle and analytics widgets | `src/pages/Infrastructure.tsx`, `src/features/infrastructure/*` | Uses `infrastructure`; awards XP | Legacy |
| Breeding tracker | Breeding event logging and dashboard with fallback strategy | `src/pages/BreedingTracker.tsx`, `src/features/breeding/api.ts` | Uses `breeding_events`; fallback reads `xp_events` if table missing | Partial (fallback indicates uncertain schema readiness) |
| Crop planner and rotations | Crop options and crop rotation planning | `src/pages/CropPlanner.tsx`, `src/features/crops/*` | Uses `crops`, `crop_rotations`; awards XP | Legacy/Partial (fallback default crop list when DB not present) |
| User profile and account preferences | Profile editing, avatar upload, subscription summary placeholders | `src/pages/UserProfile.tsx` | Uses `profiles`, storage `avatars`, subscription fields | Partial (delete account and subscription refresh are TODO stubs) |
| Billing/subscription scaffolding | Subscription and entitlement model helpers | `src/lib/subscription.ts`, `supabase/migrations/20251228_stripe_subscriptions.sql` | Reads `user_subscriptions`, `user_entitlements` | Partial/Unintegrated (helpers exist but not wired into route-level access control) |
| CI/CD and policy checks | Lint/type-check/build and policy workflow with gitleaks | `.github/workflows/ci.yml`, `.github/workflows/policy-checks.yml`, `scripts/policy-checks.sh` | Enforced on `main` pushes and PRs | Implemented |
| Deployment automation | Docker/GHCR and SSH-based deploy workflows; website deploy pipeline | `.github/workflows/deploy.yml`, `.github/workflows/deploy-website.yml`, `scripts/setup-deployment.sh` | References legacy Homestead Architect infra paths and naming | Partial (operationally present, branding and topology drift) |
| Marketing website subproject | Separate landing site with Stripe checkout/webhook API | `websites/homestead-architect-website/*` | Independent package and deploy workflow | Legacy/Partial (separate product identity, duplicated deployment surface) |

## Key Observations
- Phase 1 SteadLog memory-loop systems are present and connected.
- The repository still contains a broad legacy product surface that is not yet harmonized with SteadLog’s narrowed product philosophy.
- Multiple modules depend on tables that are not represented in tracked `supabase/migrations`, creating deployment reproducibility risk.
