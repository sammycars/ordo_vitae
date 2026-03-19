# Ordo_Vitae

> Phoenix, rebuilt right.

A life dashboard for planning and executing your goals. Built with Supabase + plain HTML/JS, following modular architecture and clean design principles.

## Quick Start

```bash
# Clone (if not already)
git clone https://github.com/sammycars/ordo_vitae.git
cd ordo_vitae

# Start local server
python3 -m http.server 45682

# Open in browser
# http://localhost:45682
```

## Tech Stack

- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Frontend:** Plain HTML/JavaScript (no frameworks)
- **Hosting:** VPS (static files)

## Project Structure

```
ordo_vitae/
├── index.html      # Main app shell
├── css/
│   └── style.css  # Design system
├── js/
│   ├── config.js           # Configuration
│   ├── supabase-client.js  # Data layer
│   ├── auth.js             # Authentication
│   └── app.js              # Main app logic
├── components/    # Reusable UI components (future)
└── docs/         # Documentation
```

## Design Principles

See: `/projects/websites/design-principles.md`

Key points:
- Modular, loose coupling
- JetBrains Mono font
- Text-based buttons `[ like this ]`
- Dark mode default
- Data naming: `USER_*`, `GOAL_*`, `TASK_*`

## Development

1. Create a branch: `git checkout -b feature/your-feature`
2. Make changes
3. Test locally
4. Commit and push
5. Merge to `main`

## Deployment

Static files go on the VPS. Update the server port as needed.

## License

Private — all rights reserved.
