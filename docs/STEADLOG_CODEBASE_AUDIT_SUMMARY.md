# SteadLog Codebase Audit Summary

## Executive Summary
SteadLog Phase 1 core systems are present and operational in the codebase:
- Quick Log
- Timeline
- Reminder engine
- Offline queue and background sync
- Photo attachment support

Repository health is **functional but structurally mixed**. The current implementation combines a solid SteadLog core with a large legacy feature surface and schema governance drift.

## Overall Repository Health
- **Runtime stability**: good (`type-check`, `lint`, and `build` complete in this environment).
- **Architecture clarity**: moderate-to-low (mixed legacy and SteadLog boundaries).
- **Data governance**: high concern (active tables exceed tracked migration source-of-truth).
- **Security governance**: partial (auth present, but authorization/migration verification gaps and dependency vulnerabilities remain).

## Major Risks
1. **Schema drift risk**
   - Many active tables are used at runtime but are not represented in tracked migration history.
2. **Boundary drift risk**
   - SteadLog core exists inside `features/praxis`, while legacy modules remain first-class routes.
3. **Duplicate system risk**
   - Sync queue mounted in two places.
   - Multiple toast systems with no clearly mounted global toaster.
   - Manual SQL files duplicate migration responsibilities.
4. **Operational drift risk**
   - Deployment workflows/scripts/docs still carry legacy naming and topology.
5. **Security risk**
   - High-severity dependency advisories remain unresolved.

## Duplicate Systems and Unused Modules
Primary duplication/unused findings:
- Unused components: `Topbar`, `NavLink`, multiple list components not routed/imported.
- Unused helper layer: subscription helper functions not connected to enforcement paths.
- Duplicate infra definitions: manual SQL files vs migration files.
- Archived/binary artifacts committed in repo root and website subproject.

See:
- `docs/DEAD_CODE_REPORT.md`
- `docs/ARCHITECTURE_REVIEW.md`
- `docs/SECURITY_GOVERNANCE_REVIEW.md`

## Recommended Cleanup Task Set (No New Features)
1. Establish migration source-of-truth and reconcile generated types with live schema.
2. Perform a non-functional naming/structure normalization (`praxis` -> `steadlog` module namespace).
3. Consolidate notification and background sync ownership.
4. Remove/relocate dead binaries and archive stale deployment docs/scripts.
5. Resolve production dependency vulnerabilities and record security acceptance decisions where needed.
6. Add ADRs and ownership metadata for core domains.

## Recommended Phase 2 Starting Point
Begin with **integration of existing Animals and Tasks workflows into the HomesteadAction memory loop** via adapter-based event publishing.

Rationale:
- highest daily user value,
- existing UI/data models already present,
- directly reinforces SteadLog’s core behavior loop without duplicating modules.

## Audit Package Contents
- `docs/CODEBASE_FEATURE_MAP.md`
- `docs/DEAD_CODE_REPORT.md`
- `docs/DATA_MODEL_AUDIT.md`
- `docs/ARCHITECTURE_REVIEW.md`
- `docs/PHASE2_INTEGRATION_PLAN.md`
- `docs/ARCHITECTURE_GOVERNANCE_REVIEW.md`
- `docs/SECURITY_GOVERNANCE_REVIEW.md`
- `docs/STEADLOG_CODEBASE_AUDIT_SUMMARY.md`
