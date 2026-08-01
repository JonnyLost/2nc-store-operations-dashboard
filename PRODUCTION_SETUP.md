# Store 2102 Secure Setup

This is a one-time setup. After it is finished, managers and their individual permissions are handled inside the dashboard—no additional database work is needed.

## What Jon does once

1. Create a project at [Supabase](https://supabase.com/dashboard). Save the database password somewhere safe.
2. Open **SQL Editor**, choose **New query**, and paste the complete contents of `supabase-schema.sql`.
3. At the very bottom, replace `YOUR_EMAIL_HERE` with your own email address, then choose **Run**.
4. Open **Authentication → URL Configuration**.
   - Set **Site URL** to `https://jonnylost.github.io/2nc-store-operations-dashboard/`.
   - Add that same address under **Redirect URLs**.
5. Open **Project Settings → API** and copy the:
   - Project URL
   - Publishable/anon public key
6. Open the dashboard, choose **Production setup**, paste those two public values, confirm Store `2102`, and save.
7. Enter the same owner email address and request a secure sign-in link.

The public anon key is intended for browser use. Never paste a Supabase secret key or `service_role` key into the dashboard.

## Add and manage managers

Once signed in as the owner:

1. Choose **Account**.
2. Under **Manager access**, enter the manager’s email.
3. Turn **Payroll** and **Communication Log** on or off for that person.
4. Choose **Add or update manager**.
5. The manager can then open the normal dashboard link, enter that exact email address, and request their sign-in link.

You can return to **Account** at any time to change a manager’s permissions or remove their access. Each person’s permissions are independent. Owners always retain access to every area.

## How sensitive information is protected

- General store operations data is available only to approved Store 2102 accounts.
- Payroll is stored separately and is returned only to an owner or manager with Payroll permission.
- Communication Log entries are stored separately and are returned only to an owner or manager with Communication Log permission.
- Hiding a tab is not the security boundary; the database also blocks unauthorized requests.
- Saved end-of-period snapshots and complete cloud backups remain owner-only because they can contain both kinds of sensitive information.

## Phones, iPads, and store computers

Every approved person uses the same dashboard address and their own email sign-in link. Once the public project connection is placed in `config.js`, nobody needs to paste setup values on each device.

## Backups and recovery

- **Export backup** downloads the data visible to the signed-in account.
- **Create cloud backup** is owner-only and saves a complete dated recovery point.
- The browser also keeps a temporary recovery copy so a brief internet outage does not erase current work.
- During the first two weeks of Q3, the owner should export a JSON backup at the end of each week.
