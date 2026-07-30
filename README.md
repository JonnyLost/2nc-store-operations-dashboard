# 2NC Store Operations Dashboard

A mobile-friendly working prototype for a retail store daily operating workflow.

[Open the live dashboard](https://jonnylost.github.io/2nc-store-operations-dashboard/)

All names, identifiers, dates, budgets, schedules, and results in this public demo are fictional
sample data. They do not represent an actual store or associate.

## Included in this build

- Daily command-center dashboard
- Associate roster and store setup
- Weekly sales budgets, last-year sales, and operational goals
- Daily schedule, breaks, positions, assignments, and team priorities
- Sales, buyback, loyalty, and payroll result entry
- Automatic WTD and goal calculations
- Letter-size landscape daily agenda
- Nightly report generator
- Device-local saving through browser storage
- Installable web-app manifest

## Data and security

This first build is a prototype. Its data is saved only in the current browser with `localStorage`.
Do not use it for confidential associate information, employee IDs, LP notes, or sensitive
communications. Shared production use requires authentication and a secure database.

## Development

No build step is required. Open `index.html` directly or serve the folder with any static web server.

```bash
python3 -m http.server 8080
```

## Publishing

The included GitHub Actions workflow deploys the site to GitHub Pages whenever `main` changes.
The deployed prototype and this public source repository contain fictional sample data only.
