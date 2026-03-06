# Domain Model

## Ubiquitous Language

| Term | Definition |
| --- | --- |
| Homestead | The operator's managed property context |
| Task | A planned or active unit of work |
| Goal | A measurable objective with target state/date |
| Property | A mapped area associated with records and work |
| Transaction | Income/expense record tied to category/date |
| Animal | Tracked livestock entity with health/breeding data |

## Bounded Contexts

| Context | Responsibility | Owner |
| --- | --- | --- |
| Planning | Tasks, calendar, strategic planning | Application team |
| Operations | Animals, inventory, infrastructure | Application team |
| Finance | Transactions and budgeting views | Application team |
| Identity/Access | Authentication, session, profile | Platform/Auth |

## Key Invariants

- User-scoped data operations must enforce ownership boundaries.
- Status transitions should align with canonical domain enums.
- Persistent schema changes must flow through migration artifacts.

