# Documentation Flow

Use this order for Pi/doc-style updates:

1. Start at `docs/index.md`.
2. Check current state in `docs/project-overview.md`.
3. Confirm terms in `docs/glossary.md`.
4. Record architectural choices in `docs/decisions.md`.
5. Update feature docs, especially `docs/backend-api.md` and `docs/people-data.md` for People/API work.
6. Update `docs/testing-debug-guide.md` with validation.
7. Update `docs/deployment.md` for setup, runbooks, and hosting changes.
8. Add implementation history to `docs/implementation-log.md`.

## Change map

- People schema/API changes: `backend-api.md`, `people-data.md`, both glossaries, `decisions.md`, and `Documentation/Reference/Prototype Limits.md`.
- Persistence changes: `decisions.md`, `deployment.md`, `testing-debug-guide.md`, and relevant in-app docs.
- UI behavior changes: relevant `Documentation/*` page plus `testing-debug-guide.md`.
- Terminology changes: `docs/glossary.md`, `Documentation/Reference/Glossary.md`, and any page using the term.
- Imported/generated data changes: `people-data.md`, `backend-api.md` count expectations, implementation log, and People in-app documentation.
