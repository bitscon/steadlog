# Security Model

## Security Objectives

- Protect credentials and service secrets.
- Enforce user/tenant data boundaries.
- Prevent unsafe deployment and runtime drift.

## Core Controls

- Secrets stored in environment/secret manager, never hardcoded.
- CI secret scanning via gitleaks policy workflow.
- Ownership checks in data mutation/read paths.
- Branch/CI controls before production deployment.

## Key Threat Areas

| Threat | Potential Impact | Primary Control |
| --- | --- | --- |
| Secret exposure | Account compromise | Secret scanning + env-only keys |
| Cross-user access | Privacy/security incident | User scoping + DB policy checks |
| Supply-chain dependency risk | Runtime compromise | Dependency policy and CI checks |

