-- Run this BEFORE starting the backend after pulling these changes.
--
-- Why this is needed: the Company entity now has a `status` column
-- (CompanyStatus: PENDING/APPROVED/REJECTED) that is NOT NULL. Hibernate's
-- `ddl-auto=update` will try to add this column automatically, but Postgres
-- refuses to add a NOT NULL column with no default to a table that already
-- has rows. Since your `companies` table already has data, letting Hibernate
-- do this on its own will crash the backend on startup with something like:
--   ERROR: column "status" of relation "companies" contains null values
--
-- This script adds the column safely with a default, backfills existing rows
-- as APPROVED (so nothing you already created/tested with suddenly disappears
-- from public listings), and only then makes it NOT NULL. After this has been
-- run once, Hibernate's ddl-auto=update will see the column already matches
-- and won't try to touch it again.
--
-- Usage:
--   docker exec -i jobboard-postgres psql -U postgres -d jobboard_db < migration.sql
-- or paste the statements below directly into your psql session.

ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS status VARCHAR(20);

UPDATE companies
    SET status = 'APPROVED'
    WHERE status IS NULL;

ALTER TABLE companies
    ALTER COLUMN status SET NOT NULL;

ALTER TABLE companies
    ADD CONSTRAINT companies_status_check
    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'));
