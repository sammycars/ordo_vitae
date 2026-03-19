# Ordo_Vitae — Project Tasks

> Phoenix rebuilt right. See `/projects/websites/design-principles.md` for the governing principles.

---

## Phase 1: Foundation

- [x] **1.1** Create GitHub repository for Ordo_Vitae
- [x] **1.2** Clone repo to VPS/local and set up basic folder structure
- [x] **1.3** Create `README.md` with project overview and architecture summary
- [x] **1.4** Set up Supabase project (or use existing)
- [ ] **1.5** Apply design principles: JetBrains Mono font, text-based buttons, minimalist aesthetic

## Phase 2: Data Schema

- [x] **2.1** Design database schema following Section 5 principles (`USER_*`, `GOAL_*` naming)
- [x] **2.2** Create migrations for core tables (users, goals, tasks, etc.)
- [x] **2.3** Enable RLS (Row Level Security) on all tables
- [ ] **2.4** Document schema in `docs/database.md` (meta documentation)

## Phase 3: Core UI

- [ ] **3.1** Build login page (Supabase Auth)
- [ ] **3.2** Build main dashboard layout (navigation, header, content area)
- [ ] **3.3** Implement dark mode / theming with CSS variables
- [ ] **3.4** Create reusable components (buttons, cards, inputs) per design principles

## Phase 4: Features

- [ ] **4.1** Implement visions (3-Year, Fear, 1-Year) — per Phoenix design
- [ ] **4.2** Implement quarterly goals
- [ ] **4.3** Implement weekly planning
- [ ] **4.4** Implement daily planning
- [ ] **4.5** Add agent integration (optional — agents can read/write goals)

## Phase 5: Polish & Launch

- [ ] **5.1** Add meta documentation page (`/docs` — high-level site overview)
- [ ] **5.2** Test on mobile (Gen-Z, mobile-first)
- [ ] **5.3** Performance check (fast loading, no spinning wheels)
- [ ] **5.4** Deploy to production
- [ ] **5.5** User testing (Tim + invited users)

---

> Each task should be a Git branch → PR → merge cycle as the project scales.
