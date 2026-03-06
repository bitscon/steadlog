# SteadLog Design Philosophy

## 1. Barn-First Mental Model
SteadLog is designed for use in real homestead conditions, not ideal office conditions.

Assume the user is:
- in the barn, garden, or field
- using one hand
- wearing gloves or handling tools
- in bright sunlight
- on unreliable or no connectivity

Every interface decision must prioritize speed, clarity, and resilience under these constraints.

## 2. The Barn Test
Every feature and interaction must pass this test:
1. Can this be completed in under 5 seconds?
2. Can this be completed with one hand?
3. Is the content readable in bright sunlight?
4. Does this still work when offline?

If any answer is `no`, the design is not production-ready and must be redesigned.

## 3. Primary Product Behavior
The primary action in SteadLog is always:

`Log Action`

Product hierarchy:
- first priority: capture real-world action quickly
- second priority: preserve and sync durable memory
- third priority: support later review and planning

## 4. Mobile Interaction Standards
Required mobile UX characteristics:
- large touch targets with generous spacing
- minimal typing and default-first inputs
- quick category selection and recent templates
- built-in voice input path
- offline-first local persistence and deferred sync

Design anti-patterns to avoid:
- long form-driven workflows
- hidden primary actions below scroll depth
- tiny touch targets requiring precision taps
- interaction flows that block on network calls

## 5. Visual and Environmental Readability
Outdoor readability requirements:
- high contrast foreground/background combinations
- clear hierarchy with strong typography weights
- avoid low-contrast grays for essential information
- visible focus and pressed states in bright light

Accessibility requirements:
- support single-thumb operation for core tasks
- preserve functionality with voice, touch, or keyboard alternatives
- keep copy concise and action-oriented

## 6. Offline-First Product Behavior
Offline is a default operating mode, not an error case.

System behavior expectations:
- local save must succeed without internet
- user receives immediate confirmation
- sync state is visible but non-disruptive
- queued entries reconcile automatically when online

## 7. Desktop Role
Desktop/web is secondary and optimized for:
- reviewing historical logs and media
- planning seasonal work
- analyzing trends and outcomes

Desktop should not drive complexity into the mobile quick-log path.

## 8. Barn-First Design Review Checklist
Use this checklist before shipping a new feature:
- `Time`: median completion time under 5 seconds for primary flow
- `Handedness`: one-handed operation validated on common screen sizes
- `Readability`: tested in bright-light/high-glare scenarios
- `Connectivity`: offline creation and recovery tested
- `Priority`: `Log Action` remains visually and behaviorally primary

Any failed check blocks release until corrected.

## 9. Governance
This document is a normative standard for SteadLog product and UX decisions.

Related documents:
- [SteadLog Philosophy](./STEADLOG_PHILOSOPHY.md)
- [Mobile-First Architecture](./MOBILE_FIRST_ARCHITECTURE.md)
- [Frictionless Logging UX](./FRICTIONLESS_LOGGING_UX.md)
- [SteadLog Timeline Architecture](./STEADLOG_TIMELINE_ARCHITECTURE.md)
