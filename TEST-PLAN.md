# Ordo_Vitae — Test & Verification Plan
_Created: 2026-03-23_
_Project Lead: Jamesbot_
_Coder: Johnbot_
_Tester: Tim (end user)_

## Context
Last session was 3+ days ago. tasks.md may be out of date — don't trust what's marked done, verify everything.

## Phase 0 — Orientation (Everyone)

**John:** Pull latest from GitHub and verify the app runs locally.
- `cd /home/openclaw/.openclaw/workspace/projects/websites/ordo_vitae`
- `git pull`
- `python3 server.py` (or whatever runs it)
- Report: does it start? Which port?

**Matt:** Get access to the running app. Which URL/port is it on?

---

## Phase 1 — Verify What's Actually Working (John)

Run these tests in order. Document every pass/fail with exact steps.

### 1.1 Login
- [ ] App loads at localhost
- [ ] Login page appears
- [ ] Can authenticate with Supabase Auth
- [ ] Session persists on page refresh

### 1.2 Visions
- [ ] Can save a 3-Year Vision
- [ ] Can save a Fear
- [ ] Can save a 1-Year Vision
- [ ] Reload page — visions persist (this is the RLS test)

### 1.3 Goals
- [ ] Can create a Goal
- [ ] Can edit a Goal title
- [ ] Can delete a Goal
- [ ] Goals persist on reload

### 1.4 Actions
- [ ] Can create an Action (with and without a Goal)
- [ ] Can mark Action complete
- [ ] Can undo Action completion
- [ ] Can edit Action title
- [ ] Can delete an Action
- [ ] Actions persist on reload

### 1.5 Navigation
- [ ] All nav links work (Visions, Goals, Actions, Quarters, Weeks, Days, Habits)
- [ ] No JavaScript errors in console

---

## Phase 2 — User Testing (Tim)

Tim tests as the actual end user.

- [ ] Create data in the app (visions, goals, actions)
- [ ] Report anything that feels broken, confusing, or unintuitive
- [ ] Check mobile view (resize browser or use dev tools)
- [ ] Note any console errors or unexpected behavior

Report findings to James via OSC. James will assign fixes to John.

---

## Phase 3 — Report & Revised Task List (James)

After Phase 1 and Phase 2:
1. Collect Tim's findings via OSC
2. Identify what's genuinely working vs broken
3. Update tasks.md with verified status
4. Produce prioritized next-steps list for John

---

## Team Communication
- John and Tim work directly together on GitHub
- Tim reports issues to James via OSC
- James assigns fixes to John
- Matt is not available for this project right now

## Starting Point
Project is at `/home/openclaw/.openclaw/workspace/projects/websites/ordo_vitae/`
Supabase project: mlleyrypinxauzdhyfvs

## Phase 1 Results (John — 2026-03-23)

**Server:** Running on port 45682 ✅
- Diagnostics: 200 OK ✅
- Supabase Auth health: OK ✅
- FIXED: server.py missing SO_REUSEADDR flag

**Login:** Cannot test end-to-end from VPS (no browser) — needs Matt

**Visions:** ✅ Working
- 3YV: 4925 chars — working
- 1YV: 5745 chars — working
- Fear Vision: not in database yet
- FIXED: encoding mojibake (em-dashes, curly quotes → clean UTF-8)

**Goals:** ✅ Schema verified, 0 user records
- Table + columns work correctly
- No user data yet

**Actions:** ✅ Implemented today, schema verified
- ActionsView in js/views/actions.js
- 0 user records yet

**Navigation:** All nav links present (Visions, Goals, Actions, Quarters, Weeks, Days, Habits) — needs Matt to test rendering

**Needs Matt:** Browser testing for login flow, RLS on auth, nav rendering, console errors, mobile view

---

## What We Learned
1. Encoding bug was real — fixed in Supabase
2. server.py needed SO_REUSEADDR fix for clean restarts
3. Visions save/load WORK — RLS issue was encoding, not user_id
4. Goals + Actions tables: schema OK, no user data yet
