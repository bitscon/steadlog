# Architecture and Folder Structure Review

## Review Scope
This review evaluates repository structure, module boundaries, and long-term maintainability for SteadLog Phase 2 readiness.

## Current Structure Summary
Observed top-level layout (abridged):
- `src/` active web application
- `supabase/migrations/` limited migration history
- `scripts/` deployment and policy scripts
- `websites/homestead-architect-website/` separate landing/Stripe subproject
- large set of root deployment docs/scripts/artifacts

## Key Structural Findings

### 1) Mixed product identity and bounded contexts
- Core SteadLog features are implemented under `src/features/praxis/*` while pages/components are renamed to SteadLog.
- Legacy product modules remain first-class routes (`finance`, `journal`, `infrastructure`, `strategic-planning`, etc.) even though current product direction is SteadLog memory-first.

Impact:
- Increases cognitive load and makes ownership unclear.
- Encourages duplicate implementations (new SteadLog modules vs existing legacy modules).

### 2) Page-heavy modules with high coupling
- Multiple pages are very large and own both orchestration and domain logic (examples: `Infrastructure.tsx`, `CropPlanner.tsx`, `UserProfile.tsx`, `HealthHub.tsx`).
- Domain modules call cross-cutting services directly (for example, many legacy modules call `awardXP` directly).

Impact:
- Harder testing and lower reusability.
- Increased regression risk when changing shared behavior.

### 3) Schema governance split across multiple sources
- Runtime tables exceed migration-backed tables.
- Manual SQL files outside migrations (`infrastructure_table.sql`, `gamification_tables.sql`, `scripts/init-db.sql`) suggest alternative schema paths.

Impact:
- Environment drift and fragile deployment reproducibility.

### 4) Operational/deployment clutter at repository root
- Root includes multiple historic deployment docs, shell scripts, and binary archives.
- Workflow and script naming still references legacy Homestead Architect topology.

Impact:
- Harder operational handoff and higher chance of running outdated procedures.

### 5) Secondary website app is embedded but not isolated by workspace conventions
- `websites/homestead-architect-website` has its own package, API scripts, and env files.
- Cross-domain naming/ownership with SteadLog app is unclear.

Impact:
- Blurred ownership and release processes; increases chance of accidental coupling.

## Recommended Long-Term SteadLog Structure

```text
steadlog/
├── src/
│   ├── app/                        # App shell, providers, router, global services
│   ├── modules/
│   │   ├── steadlog/               # Core memory loop
│   │   │   ├── log/
│   │   │   ├── timeline/
│   │   │   ├── reminders/
│   │   │   ├── sync/
│   │   │   └── media/
│   │   ├── animals/
│   │   ├── garden/
│   │   ├── tasks/
│   │   └── profile/
│   ├── shared/                     # UI primitives, hooks, utils
│   ├── integrations/               # Supabase client, API adapters
│   └── contracts/                  # Typed domain/API contracts
├── supabase/
│   ├── migrations/                 # Single schema source of truth
│   └── seeds/
├── docs/
│   ├── architecture/
│   ├── governance/
│   ├── audits/
│   └── operations/
├── scripts/
│   ├── quality/
│   └── deploy/
└── websites/                       # Optional separated workspace with clear ownership
```

## Immediate Structural Corrections (No Logic Change)
1. Normalize naming: move `src/features/praxis` to `src/modules/steadlog` in a dedicated rename pass.
2. Establish one schema authority: migrate manual SQL into reviewed migration files.
3. Separate archive material: move historical deployment docs/artifacts into `docs/archive/` and remove binaries from git.
4. Introduce module ownership map: assign maintainers by domain (`steadlog-core`, `animals`, `finance`, etc.).
5. Add route-to-module matrix in docs to prevent duplicate page/module creation.

## Architecture Risk Rating
- Current state: **Medium-High risk** for Phase 2 due to mixed domains and schema governance drift.
- With structural normalization above: **Medium-Low** and suitable for disciplined incremental development.
