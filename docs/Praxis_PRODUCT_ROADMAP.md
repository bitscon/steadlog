# Praxis Product Roadmap

## 1. Roadmap Intent
This roadmap defines a controlled transition from the current broad homestead management product into Praxis: a mobile-first homestead memory system.

## 2. Phase Plan

## Phase 1 - Core Logging Foundation
Objective:
- deliver reliable, fast, mobile-first logging

Scope:
- quick log UI for Animal/Garden/Task/Note/Photo
- local-first storage and offline queue
- sync service with idempotent writes
- basic timeline/history

Exit criteria:
- median log completion <= 5 seconds
- offline logging operational with successful resync
- data integrity validated for duplicate/retry scenarios

## Phase 2 - Structured Homestead Memory
Objective:
- make historical logs useful for decisions

Scope:
- normalized domain model for actions, animals, gardens, media
- filterable timeline and search
- action outcome tagging (worked/partial/failed)
- seasonal calendar views linked to logs

Exit criteria:
- users can retrieve and compare past actions quickly
- milestones can be backed by stored evidence

## Phase 3 - Engagement and Habit Reinforcement
Objective:
- improve retention through meaningful reinforcement

Scope:
- Praxis Score
- streaks and seasonal progress
- milestone tracking and summaries
- supportive reminders based on user behavior

Exit criteria:
- sustained increase in weekly logging consistency
- positive user sentiment on motivation features

## Phase 4 - Community Knowledge Sharing
Objective:
- enable optional, privacy-safe community learning

Scope:
- anonymized pattern sharing
- optional template libraries (care schedules, seasonal checklists)
- user-controlled sharing settings

Exit criteria:
- sharing is opt-in and privacy compliant
- no degradation of core personal memory workflow

## 3. SaaS Strategy

## 3.1 Free tier (high utility)
Free users should always receive real value:
- quick logging and history timeline
- core modules (animals, garden, tasks, notes, photos)
- offline capture and delayed sync
- basic milestone and streak visibility

## 3.2 Paid tier (deeper insight)
Paid capabilities:
- advanced seasonal analytics and trend comparisons
- richer reminder automation and recurring care templates
- expanded media storage and historical retention
- multi-user household collaboration
- premium export/reporting options

Packaging principles:
- no paywall around fundamental data ownership
- paid tier enhances insight and coordination, not basic memory capture

## 4. Current Feature Simplification Path
Based on current codebase, prioritize:
1. Keep and elevate: Journal, tasks/calendar, animals, core history.
2. Simplify: goals, crop planning, inventory to lightweight operational context.
3. De-emphasize from core navigation: finance, property assessment, infrastructure planning.
4. Reframe: XP/achievements into Praxis Score and meaningful milestones.

## 5. Delivery Governance
- each phase requires documented architecture decisions and acceptance metrics
- no major UX expansion without preserving <= 5 second log path
- release gates include offline reliability checks and telemetry validation
- all phases must pass Barn Test validation defined in [Praxis Design Philosophy](./PRAXIS_DESIGN_PHILOSOPHY.md)

## 6. Indicative Milestones
- M1: quick log MVP on mobile with offline queue
- M2: canonical domain model and memory timeline
- M3: engagement model rollout and tuning
- M4: optional community layer with privacy controls
