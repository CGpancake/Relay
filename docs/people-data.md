# People Data

People data combines core prototype users with imported freelance/contact records.

## Sources

- Core team seed records live in `backend/app/seed.py` and frontend seed data.
- Imported freelance/contact records are generated from `C:/Users/user/Downloads/CM Freelance List 2026.xlsx` into:
  - `src/data/importedFreelancePeople.ts`
  - `backend/app/freelance_people.py`

## Current counts

- 365 unique imported freelance/contact records.
- 371 total seeded People records after including the 6 core team records.

## Import rules

- Duplicate spreadsheet rows were merged by normalized name.
- Imported contacts default to `Artist` permission level.
- Imported contacts default to `available_to_hire` engagement status.
- Spreadsheet details such as contact notes, rates, reels, comments, and source-sheet context are retained in `notes` where no first-class Person field exists.

## Canonical path

When the backend is running, People contacts should be read and written through `/api/people` and the local SQLite database. Frontend seed/import data remains a fallback for prototype use when the API is unavailable.
