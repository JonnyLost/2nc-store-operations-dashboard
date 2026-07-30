# 2NC Store Operations Dashboard

A mobile-friendly working prototype for a retail store daily operating workflow.

[Open the live dashboard](https://jonnylost.github.io/2nc-store-operations-dashboard/)

All names, identifiers, dates, budgets, schedules, and results in this public demo are fictional
sample data. They do not represent an actual store or associate.

## Included in this build

- Daily command-center dashboard
- Associate roster, manager-only pay rates, and contest controls
- Fiscal-year and fiscal-week planning with multi-week schedules, copy-forward tools, and CSV plan import
- Quarter/full-year sales, buyback, last-year, and payroll planning
- Full weekly schedule with daily detail, payroll costing, copy tools, and warnings
- Sales and buyback result entry, including unit goals and prior-year ratios
- Excel-matched opportunity and transaction loyalty calculator
- Scheduled/worked hours plus scheduled/actual payroll cost by associate
- Consolidated daily associate tracking for buyback received/non-retail units and every active contest
- Multi-week contests with start/end weeks, cumulative goals, weekly history, and carried-forward associate results
- Automatic WTD and goal calculations
- One-page letter-size landscape daily agenda with official branding
- Nightly report generator with active-contest results
- Time-stamped Midday Report for sales, loyalty, and active contests
- Manager-only Communication Log prototype with search, status, category, follow-up, and history
- End-of-week, month, quarter, fiscal-year, and custom-range reports with saved snapshots
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
