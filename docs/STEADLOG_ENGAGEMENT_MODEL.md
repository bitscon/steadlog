# SteadLog Engagement Model

## 1. Core Loop
SteadLog reinforces one behavior loop:
1. Perform homestead action
2. Log action quickly
3. See meaningful progress
4. Build long-term memory
5. Use memory to improve next action

This loop is the product engine.
The timeline is the primary interface where this loop becomes visible to the user, as defined in [SteadLog Timeline Architecture](./STEADLOG_TIMELINE_ARCHITECTURE.md).
All engagement surfaces must remain Barn Test compliant under [SteadLog Design Philosophy](./STEADLOG_DESIGN_PHILOSOPHY.md).

## 2. Engagement Objectives
- increase consistency of logging without increasing cognitive burden
- turn raw logs into confidence-building memory
- encourage reflection and improvement across seasons

## 3. Engagement Layers
### 3.1 Immediate feedback (seconds)
- save confirmation
- timeline insertion at top of feed
- small score increment

### 3.2 Short-cycle feedback (daily/weekly)
- streak status
- weekly logging summary
- reminders for unresolved follow-up tasks

### 3.3 Long-cycle feedback (seasonal/annual)
- seasonal progress summary
- milestone timeline
- year-over-year memory comparisons

## 4. Trigger Strategy
Allowed triggers:
- context-aware reminders tied to existing tasks and patterns
- reconnect prompts after offline backlog sync
- seasonal prompts based on user history

Avoid:
- generic spam notifications
- daily pressure prompts with no context
- attention hacking patterns

## 5. Reflection System
Each action can optionally be revisited with outcome tags:
- worked
- partial
- failed
- needs retry

Reflection benefit:
- converts activity into practical knowledge
- improves future recommendations and reminders

## 6. Milestone Narrative
Milestones should be displayed as a personal journey:
- date achieved
- associated photos/notes
- linked actions that prove milestone
- visible placement in timeline chronology

Examples:
- first successful seedling transplant
- first egg collection week
- first preserved harvest batch

## 7. Engagement Guardrails
- never block core logging behind rewards
- no dark patterns for retention
- user can mute non-critical prompts
- all score changes should be explainable

## 8. Measurement Framework
North-star metric:
- active weeks with meaningful logging per user

Supporting metrics:
- quick-log completion rate
- median logs per active week
- streak continuity distribution
- ratio of actions with follow-up outcomes
- milestone conversion rates

## 9. Alignment to Existing System
Current XP and achievements can be repurposed:
- XP events -> SteadLog Score factors
- achievements -> milestone and seasonal markers
- leaderboard elements -> optional private progress comparisons
