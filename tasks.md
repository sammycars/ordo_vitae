# Ordo_Vitae — Project Tasks

> Phoenix rebuilt right. See `/projects/websites/design-principles.md` for the governing principles.
> **Current Version:** v0.2

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

## Phase 3: Core UI

- [x] **3.1** Build login page (Supabase Auth)
- [x] **3.2** Build main dashboard layout (navigation, header, content area)
- [x] **3.3** Implement dark mode / theming with CSS variables
- [x] **3.4** Create reusable components (buttons, cards, inputs) per design principles

## Phase 4: Features

- [x] **4.1** Implement visions (3-Year, Fear, 1-Year) with Save/Edit workflow
- [ ] **4.2** Implement Goals
- [ ] **4.3** Implement Actions
- [ ] **4.4** Implement Quarters
- [ ] **4.5** Implement Weeks
- [ ] **4.6** Implement Days
- [ ] **4.7** Implement Habits
- [ ] **4.8** Implement Todos/Tasks

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
- Need to continue implementing remaining features

## Next Steps (when resuming)

1. Fix visions save/load with proper user_id handling
2. Implement Goals view
3. Implement Actions view
4. Implement Quarters view
5. Continue with remaining features
