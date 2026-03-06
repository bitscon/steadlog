# System Architecture

## Architecture Summary

The system is a web client with service APIs and managed data services, deployed through GitHub Actions and containerized runtime workflows.

## Major Components

| Component | Responsibility | Interface |
| --- | --- | --- |
| React Frontend | User experience and workflow orchestration | Browser routes/API calls |
| Supabase Integration | Auth, data access, storage | Supabase client + SQL policies |
| Payment API | Checkout and subscription lifecycle handlers | REST-style endpoints |
| CI/CD | Build, quality checks, deployment automation | GitHub Actions |

## Data and Contract Ownership

- Data migrations: `supabase/migrations`
- Client data contracts/types: `src/integrations/supabase/types.ts`
- Governance documents: `docs/`

## Deployment Model

- CI verifies quality gates and build health.
- Deployment workflows publish and roll out application artifacts.

