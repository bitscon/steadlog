# Praxis Timeline Architecture

## 1. Purpose
The Praxis Timeline is the emotional center of the product.

Praxis means knowledge gained through action. The timeline is where that meaning becomes visible over time:
- action
- reflection
- learning
- improvement

By presenting homestead actions as a living history, the timeline turns daily logging into accumulated homestead wisdom.

## 2. Timeline Role in Product Architecture
Primary timeline responsibilities:
- display recent and historical homestead activity
- provide immediate confirmation after logging
- connect actions to outcomes, reminders, and milestones
- surface seasonal context for reflection

Product position:
- mobile timeline is a primary daily-use surface
- desktop timeline is a richer review and analysis surface

Design governance:
- timeline interactions must pass the Barn Test in [Praxis Design Philosophy](./PRAXIS_DESIGN_PHILOSOPHY.md)

## 3. Timeline Data Structure
The timeline is a unified read model composed of typed entries.

### 3.1 Canonical entry types
- `action`: direct `HomesteadAction` records (animal, garden, task, note, photo)
- `milestone`: derived meaningful progress events
- `reminder`: scheduled or due context items
- `reflection`: outcome updates linked to prior actions
- `system_context`: optional historical prompts (for example, last-year seasonal context)

### 3.2 Timeline entry envelope
All entries should share a common shape:
- `timeline_entry_id`
- `entry_type`
- `user_id`
- `occurred_at`
- `recorded_at`
- `title`
- `summary`
- `media_refs`
- `related_entity_refs` (action/task/animal/garden/milestone IDs)
- `sync_state` (`pending`, `synced`, `failed`)

## 4. Relationship to HomesteadAction
`HomesteadAction` is the canonical write model. The timeline is the user-facing read model.

Relationship rules:
- every user-created log produces one `HomesteadAction`
- each `HomesteadAction` maps to one primary `action` timeline entry
- milestones and reflections may reference one or many `HomesteadAction` records
- reminders may be generated from task and care schedules, then materialized as timeline entries

Architectural intent:
- preserve append-first action history
- support low-latency timeline rendering
- maintain traceability from timeline view back to canonical records

## 5. Timeline UX Behavior
### 5.1 Default behaviors
- after `Log Action`, user is returned to timeline with immediate entry confirmation
- newest entries appear first with clear day grouping
- entries are scannable in bright outdoor light with high-contrast labels

### 5.2 Entry presentation
Each entry should expose:
- what happened
- when it happened
- where relevant context exists (animal, bed, task, reminder, media)
- quick affordance for add-follow-up/edit metadata

### 5.3 Interaction affordances
Primary interactions:
- tap entry for details
- swipe/quick action for follow-up
- filter by category/date/context
- search historical terms

All core interactions must remain one-hand operable on common phone sizes.

## 6. Timeline Interaction Model
### 6.1 Mobile interaction model
1. User logs an action.
2. Timeline updates immediately (optimistic/local-first).
3. Entry shows sync state when offline.
4. User can continue logging without interruption.

### 6.2 Offline interaction model
- timeline includes offline-created entries with visible pending state
- reconnect triggers background synchronization
- failed entries remain visible with retry affordance

### 6.3 Reflection interaction model
- system occasionally surfaces contextual prompts based on history
- prompts remain informational and optional
- examples: "You planted tomatoes this week last year"

## 7. Performance and Readability Requirements
- timeline first render on mobile should prioritize above-the-fold entries
- interactions support glove-friendly touch targets
- no critical timeline operation depends on active internet
- timeline entry creation confirmation should feel immediate after save

## 8. Engagement Integration
The timeline is the primary surface for subtle reinforcement:
- streak continuity context
- milestone acknowledgments
- seasonal progress cues
- reflection prompts linked to prior actions

This ensures engagement is grounded in real homestead activity, not game-like overlays.

## 9. Phase 1 Implementation Readiness Guidance
Minimum Phase 1 timeline capability:
- render action entries from `HomesteadAction`
- support local-first insertion and sync-state indicators
- group entries by day with fast scanning patterns
- support category filters for Animal/Garden/Task/Note/Photo

Phase 1 should avoid:
- heavy social features
- competitive ranking surfaces
- complex timeline customization that slows logging speed
