# Scoro Metadata Intake

Use Scoro API v2 or a CSV export for project metadata review. Do not scrape an authenticated account session, and do not commit API credentials or account exports.

## Local Fixture Workflow

1. Export projects from Scoro or save an API response locally outside source control.
2. Run:

```sh
node scripts/scoro-metadata.mjs --input ./local/scoro-projects.csv --fixture ./local/scoro-projects.fixture.json --report ./local/scoro-project-gap-report.json
```

3. Review the generated fixture and gap report before changing Relay's `Project` schema.

The importer normalizes fields such as `project_id`, `no`, `project_name`, `description`, company, status, manager, dates, budget, tags, custom fields, deleted state, and source sync timestamp. Recommended Relay additions are Scoro project ID/number, client/company, status, manager, dates, finance/account fields, tags, custom fields, deleted/source state, and sync timestamps.
