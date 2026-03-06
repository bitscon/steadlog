# Praxis Philosophy

## 1. Product Meaning
Praxis means knowledge gained through action. In homesteading, meaningful knowledge comes from repeated real-world work: planting, feeding, treating, harvesting, observing, and adapting.

Praxis is a homestead memory system that captures those actions over time so users can answer:
- What did I do?
- When did I do it?
- What worked?
- What failed?

## 2. Product Boundaries
Praxis is intentionally narrow and human-centered.

Praxis is:
- a companion for small homesteaders
- a daily action log and memory system
- a lightweight decision aid based on personal history

Praxis is not:
- enterprise farm operations software
- heavy accounting and ERP tooling
- land design and property optimization software

## 3. Target Users
Primary users:
- backyard chicken keepers
- small gardeners
- part-time homesteaders
- hobby livestock keepers

Design implications:
- low setup burden
- plain language
- mobile-first interactions in field conditions
- useful with poor or no connectivity

## 4. Praxis Product Principles
1. Action over administration: logging must be faster than note-taking in a paper notebook.
2. Memory over management: historical recall is more valuable than complex planning screens.
3. Mobile-first by default: the primary interface is used in barn/garden/field conditions.
4. Honest reinforcement: engagement systems must reflect real progress, not artificial game loops.
5. Progressive depth: new users get immediate value, advanced users can explore deeper analytics later.

Barn-first execution standard:
- All product and UX decisions must follow [Praxis Design Philosophy](./PRAXIS_DESIGN_PHILOSOPHY.md) and pass the Barn Test.

Timeline doctrine:
- The emotional center of Praxis is the timeline; all core modules should strengthen the living history model defined in [Praxis Timeline Architecture](./PRAXIS_TIMELINE_ARCHITECTURE.md).

## 5. Feature Audit of Current Codebase
Audit source references include route and module definitions in `src/App.tsx`, `src/pages/*`, and `src/features/*`.

| Current capability | Evidence in codebase | Praxis alignment | Action |
|---|---|---|---|
| Journal entries and timeline memory | `src/pages/HomesteadJournal.tsx`, `src/features/journal/*` | Aligned | Keep as a core module and evolve into Quick Log + memory timeline |
| Task tracking by seasonal calendar | `src/pages/SeasonalCalendar.tsx`, `src/features/tasks/*` | Aligned | Keep, simplify for mobile-first quick capture and reminders |
| Animal health and records | `src/pages/HealthHub.tsx`, `src/features/animals/*`, `src/features/health/*` | Aligned | Keep and merge into unified Animal Records experience |
| Inventory and supplies | `src/pages/InventoryManagement.tsx`, `src/features/inventory/*` | Partially aligned | Keep lightweight inventory signals only (low-stock + usage notes) |
| Crop planning and rotations | `src/pages/CropPlanner.tsx`, `src/features/crops/*` | Partially aligned | Reduce planning complexity; focus on logged outcomes by season/bed |
| Goals module | `src/pages/HomesteadGoals.tsx`, `src/features/goals/*` | Partially aligned | Reframe as seasonal intentions linked to logged outcomes |
| Gamification (XP, achievements) | `src/game/*`, `src/pages/Achievements.tsx`, `src/components/game/*` | Partially aligned | Retain reinforcement backbone; rename/reframe as Praxis Score + milestones |
| Community leaderboard | `src/components/game/Leaderboard.tsx` | Misaligned risk | De-emphasize competitive ranking; replace with personal trend progress |
| Finance hub and transaction management | `src/pages/HomesteadBalance.tsx`, `src/features/finance/*` | Misaligned to core | Move out of core navigation; keep optional lightweight cost notes only |
| Property assessment and infrastructure planning | `src/pages/PropertyAssessment.tsx`, `src/pages/Infrastructure.tsx`, `src/features/properties/*`, `src/features/infrastructure/*` | Misaligned to core | Reduce to optional context metadata; remove from primary daily workflow |
| Breeding tracker | `src/pages/BreedingTracker.tsx`, `src/features/breeding/*` | Partially aligned | Keep as specialized animal event logging, not a separate planning silo |

## 6. Simplification Directives
To align with Praxis philosophy before adding new logic:
- center navigation on Log, Animals, Garden, Tasks, Calendar, History
- reduce screen-level complexity that slows 5-second logging
- remove competitive framing from engagement surfaces
- treat finance/property/infrastructure as optional secondary contexts

## 7. Success Criteria for Product Direction
Praxis direction is succeeding when:
- median log time is under 5 seconds for common actions
- users can confidently reconstruct past actions by date, category, and media
- weekly logging consistency increases without aggressive notifications
- users report better memory and decision confidence across seasons
- timeline revisits generate reflection and improved seasonal decisions
