# Gamification Model

## 1. Intent
Praxis uses behavioral reinforcement to support consistent logging and long-term memory building.

This is not a game layer. It is a motivation layer tied to real homestead activity.
Reinforcement should be primarily delivered through timeline context and milestones defined in [Praxis Timeline Architecture](./PRAXIS_TIMELINE_ARCHITECTURE.md), and must satisfy the Barn Test in [Praxis Design Philosophy](./PRAXIS_DESIGN_PHILOSOPHY.md).

## 2. Design Principles
1. Real action first: points come from logged homestead actions, not app-only interactions.
2. Quiet reinforcement: rewards should be subtle and useful, not noisy.
3. No childish mechanics: avoid gimmicks, loot-box style randomness, or manipulative loops.
4. Personal progress over competition: trend against personal baseline, not public rank pressure.

## 3. Praxis Score
Praxis Score is a composite indicator of consistency and breadth.

Proposed weighted components:
- Logging consistency (40%)
- Category coverage across modules (20%)
- Completion of planned tasks/reminders (20%)
- Reflection quality signals (notes/outcome follow-up) (20%)

Score rules:
- capped daily contribution to avoid spam logging
- decays slowly with inactivity to encourage return without punishment
- visible as trend over time, not as a single vanity number

## 4. Logging Streaks
Streak design:
- daily streak based on meaningful log count threshold
- grace window for occasional missed day (configurable)
- streak recovery mechanic through renewed activity

Streak messaging:
- supportive and practical
- avoids shaming language

## 5. Seasonal Progress
Seasonal progress reflects real agricultural cycles.

Example progress dimensions:
- spring setup completeness
- summer maintenance consistency
- harvest season completion and notes
- winter prep and retrospective logging

Output:
- seasonal summary cards
- season-over-season comparison for same user/homestead

## 6. Homestead Milestones
Milestones represent meaningful real-world outcomes.

Examples:
- First Harvest
- First Egg
- First Goat Kid
- First Jar of Preserves

Milestone requirements:
- grounded in logged evidence
- timestamped and visible in memory timeline
- attachable photos/notes for context

## 7. Reward Surfaces
Allowed surfaces:
- timeline highlights and contextual callbacks
- weekly progress recap
- seasonal summary
- personal milestone gallery

Disallowed surfaces:
- aggressive pop-up interruptions
- public shaming or forced social sharing
- gambling-like random rewards

## 8. Anti-Abuse and Integrity
- duplicate log suppression for score calculation
- category-specific minimum detail thresholds
- anomaly checks for unrealistic action bursts
- internal audit log for score changes and recalculations

## 9. Telemetry and Evaluation
Measure engagement quality, not raw clicks:
- weekly active loggers
- median logs per active day
- streak retention after 30/60/90 days
- ratio of quick logs to edited logs
- milestone attainment over seasonal windows

## 10. Transition from Existing XP System
Current XP/achievement structures can be reused as implementation scaffolding.
Transition plan:
- map XP events to Praxis Score factors
- replace leaderboard-first framing with personal progress framing
- reword achievements as practical milestones and learning markers
