# Frictionless Logging UX

## 1. UX Objective
Everyday homestead logging must be possible in under 5 seconds for common entries.

Design principle:
- minimum taps
- minimum typing
- immediate confirmation

This UX standard is governed by [SteadLog Design Philosophy](./STEADLOG_DESIGN_PHILOSOPHY.md), including mandatory Barn Test validation.
Timeline behavior after logging is defined in [SteadLog Timeline Architecture](./STEADLOG_TIMELINE_ARCHITECTURE.md).

## 1.1 Barn Test Requirements for Logging
The quick-log flow is valid only when all checks pass:
- completion under 5 seconds for common actions
- one-handed operation with thumb-reachable primary actions
- readability in direct sunlight
- successful save while offline

## 2. Quick Log Core Flow
### 2.1 Standard 3-step flow
1. Tap `Log`
2. Choose category (`Animal`, `Garden`, `Task`, `Note`, `Photo`)
3. Save action using defaults or short input

Example:
- Category: Animal
- Action: Vaccinated goats
- Detail: CD&T, 2 ml
- Save

Post-save expectation:
- immediate return to timeline with visible confirmation of the new entry
- no blocking spinner dependency on network availability

### 2.2 Defaulting strategy
To stay below 5 seconds:
- prefill last-used category and subcategory
- remember last-used herd/bed/location
- provide one-tap recent templates
- allow save with minimal required fields, enrich later

## 3. Category Design
Minimal data required per category:
- Animal: action + subject (single animal or group)
- Garden: action + crop/bed
- Task: action + status
- Note: free text short note
- Photo: image + optional caption

Optional metadata can be added later:
- dosage, weather notes, cost, tags, outcomes

## 4. Voice Logging Experience
Voice logging flow:
1. Tap microphone on quick log
2. Speak natural sentence
3. System transcribes and maps into structured draft
4. User confirms with one tap (`Save`) or edits key fields

Voice parsing rules:
- prioritize action, subject, quantity, and date context
- mark uncertain fields with confidence hints
- never block save because of low NLP confidence

## 5. Photo Logging Experience
Photo logging flow:
1. Tap camera from quick log
2. Capture image
3. Auto-detect category suggestion where possible
4. Optional short caption
5. Save immediately

Photo requirements:
- fast local thumbnail generation
- deferred upload when offline
- timeline displays photo even before upload completes

## 6. Offline UX Rules
When offline:
- no blocking errors for logging
- show subtle `Saved offline` status
- queue entries transparently
- background sync when network returns

Failure handling:
- failed sync entries show non-intrusive retry state
- user can force retry from history detail

## 7. Mobile Interaction Standards
- thumb-zone placement for primary actions
- one-hand operation for core log path
- high contrast and legible typography in outdoor light
- large tap targets suitable for gloves or wet conditions

## 8. Accessibility Requirements
- voice and camera are optional, not mandatory
- complete flow available via keyboard/screen reader on supported devices
- concise labels and feedback text
- haptic and visual feedback on successful save

## 9. UX Acceptance Criteria
SteadLog frictionless logging is accepted when:
- median completion time for quick log <= 5 seconds
- p95 quick log completion <= 12 seconds
- offline save success >= 99%
- at least 80% of daily logs use quick log instead of full-form edit
- one-handed completion success >= 95% in usability test runs
- no critical readability failures in high-glare visual QA

## 10. Out-of-Scope for Quick Log
To preserve speed, quick log must avoid:
- multi-screen wizard flows
- mandatory long-form fields
- heavy planning or analytics interactions
- dense configuration screens
- timeline interruptions that prevent immediate next log
