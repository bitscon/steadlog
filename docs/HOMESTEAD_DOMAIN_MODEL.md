# Homestead Domain Model

## 1. Domain Purpose
The domain model captures homestead work as durable, queryable memory. The foundational event is a logged action with optional structured context.

Barn-first constraint:
- data capture requirements must support one-handed, under-5-second logging as defined in [Praxis Design Philosophy](./PRAXIS_DESIGN_PHILOSOPHY.md).

## 2. Bounded Contexts
- Identity and Access: users, authentication, preferences
- Logging: homestead actions, notes, media, voice transcripts
- Animals: animal records, care events, health actions
- Garden: crop/bed records, planting/harvest events
- Tasks and Calendar: planned work, reminders, completion events
- Engagement: Praxis Score, streaks, milestones, seasonal progress

## 3. Core Entities

### 3.1 User
Represents an authenticated person using Praxis.

Key fields:
- `id`
- `email`
- `display_name`
- `timezone`
- `settings`

### 3.2 HomesteadAction
Canonical append-only record of a real-world action.

Key fields:
- `id`
- `user_id`
- `action_type` (animal, garden, task, note, photo)
- `action_subtype` (vaccination, watering, harvest, etc.)
- `occurred_at`
- `recorded_at`
- `location_context`
- `summary`
- `details`
- `source` (manual, voice, photo)
- `sync_status`

### 3.3 AnimalRecord
Represents tracked livestock or poultry context.

Key fields:
- `id`
- `user_id`
- `name_or_tag`
- `species`
- `breed`
- `sex`
- `birth_or_acquisition_date`
- `status`

### 3.4 GardenRecord
Represents tracked garden unit (bed, plot, container, zone).

Key fields:
- `id`
- `user_id`
- `name`
- `zone`
- `soil_context`
- `active_season`

### 3.5 Task
Represents actionable planned work and reminders.

Key fields:
- `id`
- `user_id`
- `title`
- `category`
- `due_at`
- `status`
- `related_action_id`

### 3.6 Reminder
Notification schedule associated with tasks or recurring care.

Key fields:
- `id`
- `user_id`
- `task_id`
- `schedule_rule`
- `next_trigger_at`
- `is_active`

### 3.7 SeasonEvent
Captures seasonal milestones and aggregate progress windows.

Key fields:
- `id`
- `user_id`
- `season`
- `year`
- `event_type`
- `event_date`
- `notes`

### 3.8 Milestone
Represents meaningful achievement backed by logs.

Key fields:
- `id`
- `user_id`
- `milestone_type`
- `achieved_at`
- `evidence_action_ids`
- `media_ids`

### 3.9 MediaAttachment
Photo or audio artifact associated with a log.

Key fields:
- `id`
- `user_id`
- `action_id`
- `media_type`
- `storage_uri`
- `thumbnail_uri`
- `captured_at`

### 3.10 SyncEnvelope
Tracks client-originated write state for offline reliability.

Key fields:
- `id`
- `client_generated_id`
- `device_id`
- `payload_hash`
- `sync_version`
- `server_ack_at`

## 4. Relationships
- `User` 1..* `HomesteadAction`
- `User` 1..* `AnimalRecord`
- `User` 1..* `GardenRecord`
- `HomesteadAction` 0..1 `AnimalRecord` (context reference)
- `HomesteadAction` 0..1 `GardenRecord` (context reference)
- `Task` 0..1 `HomesteadAction` (completion evidence)
- `HomesteadAction` 0..* `MediaAttachment`
- `Milestone` 1..* `HomesteadAction` (evidence)
- `Reminder` 1..1 `Task`

## 5. Domain Invariants
1. Every `HomesteadAction` must belong to exactly one `User`.
2. `occurred_at` may differ from `recorded_at`; both are retained.
3. Actions are append-first; destructive edits should be avoided.
4. Milestones require verifiable evidence records.
5. Engagement metrics are derived from domain events, not manually edited totals.

## 6. Event Taxonomy
Proposed starter event types:
- `animal.care.logged`
- `animal.health.logged`
- `garden.planted`
- `garden.harvested`
- `task.completed`
- `note.logged`
- `photo.logged`
- `milestone.achieved`

## 7. Query Priorities
Primary query shapes:
- timeline by date range and category
- actions by animal or garden context
- seasonal summaries by module
- streak and consistency trend windows

## 8. Privacy and Multi-Tenancy
- strict per-user row-level scoping
- signed media access by owner
- no cross-user data leakage in analytics
- explicit consent gates before any sharing surfaces
