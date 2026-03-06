# Mobile-First Architecture

## 1. Architecture Objective
Praxis architecture must prioritize in-field, low-friction mobile logging while preserving reliable long-term homestead memory.

Primary outcome:
- fast capture now
- durable sync later
- clear historical retrieval always

## 2. System Topology
Primary architecture:
- Mobile App (primary client; React Native + Expo or equivalent)
- Web App (secondary client for review/planning)
- Backend API (auth, domain services, sync endpoints)
- Relational Database (system of record)
- Object Storage (photos and media assets)
- Observability stack (logs, traces, product telemetry)

## 3. Interaction Model
### 3.1 Mobile-first request path (online)
1. User submits quick log from mobile.
2. Client validates minimal required fields.
3. API accepts action and returns canonical record + server timestamp.
4. Client updates timeline and engagement counters.

### 3.2 Offline-first request path (disconnected)
1. User submits quick log locally.
2. Client writes to local store with `sync_status = pending`.
3. Client immediately shows entry in timeline.
4. Background sync pushes queued records when network is available.
5. Server returns canonical IDs/timestamps and conflict results.

## 4. Client Architecture
Mobile app layers:
- Presentation: quick log UI, timeline, record detail, reminder views
- Application: use-case orchestration (create action, attach photo, parse voice)
- Local persistence: SQLite/embedded store for actions, queue, media metadata
- Sync engine: retries, batching, idempotency handling, conflict resolution

Web app layers:
- memory review timeline
- planning and seasonal analysis
- account/admin settings

## 5. Data and Sync Strategy
### 5.1 Sync envelope requirements
Each locally created record includes:
- `client_generated_id` (UUID)
- `device_id`
- `created_at_device`
- `last_modified_at_device`
- `sync_version`

### 5.2 Idempotency
API write endpoints require idempotency key support to prevent duplicate logs after retries.

### 5.3 Conflict policy
Default strategy:
- append-only for `HomesteadAction` records
- last-write-wins for editable metadata fields
- explicit conflict flags for ambiguous merges

### 5.4 Connectivity handling
- exponential backoff retries
- manual retry action in UI
- sync indicator: pending / syncing / synced / failed

## 6. Media and Voice Pipeline
Photo flow:
- capture locally
- store compressed preview + original reference
- upload via resumable transfer
- attach media URL to canonical action record

Voice flow:
- short voice capture on device
- speech-to-text conversion
- lightweight intent extraction into structured fields
- user confirms before final save when confidence is low

## 7. Security Architecture
- strong session/auth token controls
- per-user tenant scoping for all records
- encrypted transport (TLS)
- encrypted local storage for sensitive cached data
- signed URLs and access controls for media

## 8. Reliability and Performance Targets
Core targets:
- quick log interaction completion: < 5 seconds
- local save latency: < 300 ms on median mobile device
- sync success after reconnect: > 99% of queued entries within 5 minutes
- data loss tolerance for accepted local writes: zero

## 9. Deployment Architecture Guidance
Environment model:
- `dev`: rapid iteration and test datasets
- `staging`: production-like sync and mobile QA validation
- `prod`: autoscaled API + managed DB + managed storage + monitoring

Release strategy:
- backend can deploy independently
- mobile releases use phased rollout
- compatibility window maintained for older app versions (minimum one prior version)

## 10. Architecture Decisions to Lock Early
1. offline local database technology and migration strategy
2. sync protocol contract (batch size, retries, idempotency headers)
3. media storage conventions and retention policy
4. event taxonomy for analytics and engagement metrics
