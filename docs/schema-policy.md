# Schema Policy — Ordo_Vitae

> **Rule:** Every schema object (table, column, enum value) must exist in all three places — or it does not exist.

---

## Three Sources of Truth

| Source | Location | Purpose |
|---|---|---|
| **Design intent** | `docs/schema.sql` | The canonical DDL — defines what we intend to build |
| **Actual database** | Supabase (live) | The working state of the system |
| **Code layer** | `js/config.js` → `SCHEMA` | What code references when reading/writing |

For an object to be considered real, it must appear in all three — with identical names.

---

## Policy

1. **No object exists in fewer than all three sources.**
   - A column in schema.sql but not in Supabase: does not exist
   - A column in Supabase but not in config.js: does not exist
   - A column in config.js but not in schema.sql: does not exist

2. **Before Phase 3 begins, all three sources must be in exact agreement.** This is enforced by Gate 2.6 (Andy review).

3. **Any schema change must update all three sources atomically:**
   - Update schema.sql (design intent)
   - Apply to Supabase (live database)
   - Update SCHEMA config in config.js (code layer)
   - Then the change is done.

4. **Verification is required after any schema change.** Run a read query against Supabase and confirm the actual column names match what schema.sql and config.js say they should be.

5. **Magic strings are banned.** Every column name used in code must come from SCHEMA.* — never a raw string.

---

## Why This Matters

Skeletons with partial columns, or columns that exist in two of three sources, create silent failures — bugs that don't throw errors, they just quietly do the wrong thing. The vision save/load bug was exactly this: column name drift between schema.sql and actual Supabase.

This policy makes that class of bug impossible.

---

*Established: 2026-03-20*
