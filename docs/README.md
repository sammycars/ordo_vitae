# Ordo_Vitae — Documentation

> High-level overview of the Ordo_Vitae project.

## What Is Ordo_Vitae?

A personal life dashboard for planning and executing goals. It's a rebuild of the original Phoenix dashboard, built right from the start with modular architecture and clean design.

## Architecture

### Tech Stack
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Frontend:** Plain HTML/JavaScript (no frameworks)
- **Hosting:** VPS (static files)

### Folder Structure

```
ordo_vitae/
├── index.html          # Main app shell
├── css/
│   └── style.css      # Design system + CSS variables
├── js/
│   ├── config.js      # Configuration (Supabase credentials)
│   ├── supabase-client.js  # Data layer (repository pattern)
│   ├── auth.js        # Authentication
│   ├── app.js         # Main app (routing)
│   └── views/         # Each view in its own file
│       ├── visions.js
│       ├── goals.js
│       ├── actions.js
│       ├── quarters.js
│       ├── weeks.js
│       ├── days.js
│       └── habits.js
└── docs/
    └── README.md      # This file
```

### Data Flow

1. User loads page → `index.html`
2. `auth.js` checks for existing session
3. If logged in → `app.js` loads the selected view
4. Views use `supabase-client.js` to talk to the database
5. All data lives in Supabase (no localStorage for core data)

## Design System

See: `/projects/websites/design-principles.md`

Key points:
- Font: JetBrains Mono (monospace)
- Buttons: Text-based `[ like this ]`
- No popups — use inline messages
- Dark mode default
- Mobile-first

## Views

### Visions
- 3-Year Vision
- Fear Vision  
- 1-Year Vision

### Goals
- High-level goals

### Actions
- Action items tied to goals

### Quarters
- Quarterly planning

### Weeks
- Weekly planning

### Days
- Daily planning

### Habits
- Habit tracking

## Supabase Schema

Tables use naming convention from design principles:
- `USER_*` columns for user data
- `GOAL_*` columns for goals
- `TASK_*` columns for tasks

See Phase 2 (Data Schema) in tasks.md for details.

## Development

1. Make changes in a feature branch
2. Test locally
3. Commit and push
4. Deploy to VPS

## Principles

This project follows the Website Design & Development Principles:
- /projects/websites/design-principles.md

Key rules:
- No popups
- Modular, loose coupling
- Configuration over hard-coding
- Comments explain *why*, not just *what*
