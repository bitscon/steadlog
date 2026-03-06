# Project Overview

## Project

- Name: Homestead Architect
- Type: AI-assisted SaaS web application
- Primary Stack: React + TypeScript + Supabase
- Repository Owner: Engineering Team

## Summary

Homestead Architect is a homestead management platform for planning and tracking operations across tasks, finances, animal care, inventory, goals, and strategic planning.

## Scope

### In Scope

- front-end application in `src/`
- API/payment integration under `websites/homestead-architect-website/api`
- database migrations in `supabase/migrations`
- deployment and release workflows in `.github/workflows`

### Out of Scope

- external infrastructure not represented as code in this repository
- third-party service internal implementation

## Success Metrics

| Objective | Metric | Baseline | Target |
| --- | --- | --- | --- |
| Build reliability | CI success rate | TBD | >= 95% |
| Code quality | Lint/type-check pass rate | TBD | 100% on main |
| Security hygiene | Secret scan findings on main | TBD | 0 open critical |

