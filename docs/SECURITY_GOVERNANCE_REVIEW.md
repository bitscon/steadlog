# Security Governance Review

## Framework Used
Source template:
- `/home/billyb/workspaces/pro-ai-assist-gov/templates/security-review-checklist.md`

## Evidence Sources
- Application code under `src/`
- Supabase migrations under `supabase/migrations/`
- CI workflows (`.github/workflows/policy-checks.yml`)
- Dependency scan (`npm audit --omit=dev --json`)

Status legend:
- `Pass`: control implemented and verifiable
- `Partial`: control exists with gaps
- `Gap`: missing or not verifiable

## Checklist Results

### Threat and Attack Surface
| Checklist item | Status | Evidence | Notes |
|---|---|---|---|
| Threat model is current | Gap | No threat-model doc specific to current SteadLog implementation | Security model template exists, but no living threat model update found |
| Public and internal attack surfaces are cataloged | Partial | Web app + Supabase + storage + deployment workflows identifiable | Attack surface is implicit, not formally cataloged |
| Abuse scenarios are considered | Gap | No explicit abuse-case docs (spam logging, notification abuse, storage abuse) | Needed before Phase 2 expansion |

### Identity and Access
| Checklist item | Status | Evidence | Notes |
|---|---|---|---|
| Authentication controls are verified | Pass | Supabase auth session checks in `AuthContext` and route guard in `ProtectedRoute` | Protected routes are enforced client-side |
| Authorization checks are enforced server-side | Partial | RLS policies are present for SteadLog Phase 1 tables in migration `20260306090000_*` | Legacy modules rely on table filters in client code; RLS for those tables not fully verifiable from tracked migrations |
| Least privilege is applied to services and users | Partial | Frontend uses anon key only; service-role not exposed in client code | Tracked `.env` files increase accidental privilege-leak risk if populated later |

### Data Protection
| Checklist item | Status | Evidence | Notes |
|---|---|---|---|
| Encryption in transit and at rest is configured | Partial | Supabase platform defaults likely provide TLS/encryption | Repository does not explicitly assert or test these controls |
| Sensitive data is minimized and classified | Gap | No data classification matrix found | Profile and media data handling lacks documented classification |
| Retention and deletion policies are implemented | Gap | `UserProfile` delete-account flow is TODO placeholder | No retention/deletion operational policy documented |

### Application Security
| Checklist item | Status | Evidence | Notes |
|---|---|---|---|
| Input validation and output encoding are enforced | Partial | Zod validation in `UserProfile`; React output escaping by default | Validation is not consistently centralized across all forms/APIs |
| Dependency vulnerability scans are clean or risk accepted | Gap | `npm audit` reports 5 prod vulnerabilities (4 high, 1 moderate), including `react-router-dom` advisory chain | No risk-acceptance record or mitigation plan in repo |
| Security headers and CORS policy are correct | Gap | No explicit app-level security headers/CORS config for deployed frontend/API in current app code | Deployment docs/scripts exist but do not provide enforceable header policy artifact |

### Operations Security
| Checklist item | Status | Evidence | Notes |
|---|---|---|---|
| Secrets are managed via approved secret store | Partial | GitHub Actions secrets used in workflows; gitleaks in CI | `.env` and nested website `.env` are tracked files (currently placeholder values), which is a governance risk |
| Audit logging and monitoring are active | Partial | Dev logger exists for local diagnostics | No production security audit logging/monitoring pipeline evident |
| Incident response runbook is available | Gap | No explicit incident response runbook found | Deployment runbooks are not incident response procedures |

## Specific Security Risks Identified
1. **Authorization consistency risk**: several legacy mutations depend on client-side query filters and do not consistently include user checks in every update path.
2. **Schema governance risk**: incomplete migration source of truth makes RLS verification unreliable for legacy tables.
3. **Dependency risk**: unresolved high-severity advisories in production dependencies.
4. **Secret hygiene risk**: tracked `.env` files create latent risk despite currently placeholder values.

## Recommended Alignment Actions (Pre-Phase 2)
1. Document and approve a current threat model and abuse cases for SteadLog core workflows.
2. Verify and document RLS policies for every actively queried table; backfill missing migrations.
3. Patch vulnerable dependencies (priority: `react-router-dom` chain) and record accepted exceptions if any.
4. Enforce `.env` handling policy: keep only `.env.example` variants tracked.
5. Add an incident response runbook and minimum security telemetry requirements.

## Overall Security Governance Posture
- **Current posture**: `Partial`
- **Phase 2 readiness**: requires remediation of authorization verification, migration/RLS completeness, and dependency vulnerabilities.
