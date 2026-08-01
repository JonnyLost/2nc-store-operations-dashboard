# 2NC Store Operations Dashboard

A production-pilot dashboard for Store 2102's daily operating workflow.

[Open the live dashboard](https://jonnylost.github.io/2nc-store-operations-dashboard/)

The public app opens safely in demo mode until its protected Supabase connection is configured.

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
- Manager-only Communication Log with search, status, category, follow-up, and history
- End-of-week, month, quarter, fiscal-year, and custom-range reports with saved snapshots
- Passwordless email login for approved owner/manager accounts
- Owner-managed, individual Payroll and Communication Log permissions
- Database-enforced separation of general, payroll, and communication data
- Secure multi-device synchronization with offline recovery
- Portable JSON export/restore and dated cloud backups
- Installable web-app manifest

## Production setup

Follow [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md). Do not enter real associate or Communication
Log information while the app still says **Demo mode**.

## Development

No build step is required. Open `index.html` directly or serve the folder with any static web server.

```bash
python3 -m http.server 8080
```

## Publishing

The included GitHub Actions workflow deploys the site to GitHub Pages whenever `main` changes.
The public source repository contains fictional sample data only. Real pilot data lives in the
protected database and is never committed to GitHub.
