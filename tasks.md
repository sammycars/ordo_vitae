# Ordo_Vitae — Project Tasks

> Phoenix rebuilt right. See `/projects/websites/design-principles.md` for the governing principles.
> **Current Version:** v0.4

---

## Phase 1: Foundation

- [x] **1.1** Create GitHub repository for Ordo_Vitae
- [x] **1.2** Clone repo to VPS/local and set up basic folder structure
- [x] **1.3** Create `README.md` with project overview and architecture summary
- [x] **1.4** Set up Supabase project
- [x] **1.5** Apply design principles: JetBrains Mono font, text-based buttons, minimalist aesthetic

## Phase 2: Data Schema

- [x] **2.1** Design database schema following Section 5 principles (`USER_*`, `GOAL_*` naming)
- [x] **2.2** Create migrations for core tables (users, goals, tasks, etc.)
- [x] **2.3** Enable RLS (Row Level Security) on all tables
- [x] **2.4** Document schema in `docs/schema.md` and `docs/schema.sql`
- [x] **2.5** Declare all variables up front — no magic strings in code. Every column name is listed in a config/data layer (e.g. `data/schema-columns.js`) with a comment linking it back to `docs/schema.sql`.
- [x] **2.6** Verify schema agreement — confirm `docs/schema.sql`, actual Supabase tables, and the code config layer are in exact agreement. **Andy's gate:** Andybot reviews and signs off before Phase 3 begins. ✅ PASSED 2026-03-20
- [x] **2.7** Apply schema.sql DDL to Supabase — create all missing columns in actual Supabase so all tables match schema.sql in full. All three sources must then agree. Re-verify with Andy after applying.

## Phase 3: Core UI

- [x] **3.1** Build login page (Supabase Auth)
- [x] **3.2** Build main dashboard layout (navigation, header, content area)
- [x] **3.3** Implement dark mode / theming with CSS variables
- [x] **3.4** Create reusable components (buttons, cards, inputs) per design principles
- [x] **3.5** Retroactive schema gate — Andy verifies all Phase 3 items (3.1–3.4) against actual Supabase and config.js. ✅ PASSED 2026-03-20

## Phase 4: Features

> **⚠️ Schema Drift Gate — applies to every feature below**
>
> Every feature in Phase 4 touches the database. Before writing any code for a feature:
>
> 1. **Verify schema exists** — query Supabase directly and confirm the tables and columns the feature needs actually exist, with the expected names.
> 2. **Compare against `docs/schema.sql`** — if a column is in schema.sql but missing or named differently in Supabase, the **code must be corrected to match Supabase** (schema.sql describes the intended design; if reality diverges, the code is what gets fixed).
> 3. **After any schema change** — update `docs/schema.sql` to reflect the actual Supabase schema. Treat them as the same artifact.
> 4. **Ghost variable rule** — All variables/columns used in code must be documented in `docs/schema.sql`. No variable in code that isn't in the schema, and no schema object that isn't used in code. Magic strings are not allowed; every column reference is declared up front.
>
> A feature that touches the database is **not done** if its code references a column that doesn't match what actually exists in Supabase.

- [x] **4.1** Implement visions (3-Year, Fear, 1-Year) with Save/Edit workflow
  - ☐ Schema verified against Supabase before build — no drift between `docs/schema.sql` and actual columns
- [x] **4.2** Implement Goals
  - ☐ Schema verified against Supabase before build — no drift between `docs/schema.sql` and actual columns
- [ ] **4.3** Implement Actions
  - ☐ Schema verified against Supabase before build — no drift between `docs/schema.sql` and actual columns
- [ ] **4.4** Implement Quarters
  - ☐ Schema verified against Supabase before build — no drift between `docs/schema.sql` and actual columns
- [ ] **4.5** Implement Weeks
  - ☐ Schema verified against Supabase before build — no drift between `docs/schema.sql` and actual columns
- [ ] **4.6** Implement Days
  - ☐ Schema verified against Supabase before build — no drift between `docs/schema.sql` and actual columns
- [ ] **4.7** Implement Habits
  - ☐ Schema verified against Supabase before build — no drift between `docs/schema.sql` and actual columns
- [ ] **4.8** Implement Todos/Tasks
  - ☐ Schema verified against Supabase before build — no drift between `docs/schema.sql` and actual columns

## Phase 5: Polish & Launch

- [ ] **5.1** Add meta documentation page (`/docs` — high-level site overview)
- [ ] **5.2** Test on mobile (Gen-Z, mobile-first)
- [ ] **5.3** Performance check (fast loading, no spinning wheels)
- [ ] **5.4** Deploy to production
- [ ] **5.5** User testing (Tim + invited users)

---

## What's Working (v0.2)

- Login/Auth with Supabase
- Session persistence
- Font size controls (Dev tab)
- Color palette display (Dev tab)
- Quote rotator (Marcus Aurelius quotes)
- Diagnostics status bar (Supabase, Variables, JavaScript, DevConsole)
- ObjectColor component (universal color logic based on scheduling state)
- Visions: 3-Year, Fear, 1-Year with Save/Edit workflow

## Known Issues

- Vision save/load has RLS issues — needs fix for user_id handling
- supabase-client.js getById() uses bare 'id' column — could cause issues if called on custom tables (none currently do); low-priority cleanup
- Need to continue implementing remaining features

## Next Steps (when resuming)

1. Fix visions save/load with proper user_id handling
2. Implement Goals view
3. Implement Actions view
4. Implement Quarters view
5. Continue with remaining features
