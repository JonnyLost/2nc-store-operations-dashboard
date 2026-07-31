# Store 2102 Production Pilot Setup

The production pilot uses Supabase for passwordless email login, synchronized data, and dated cloud backups. The dashboard remains on GitHub Pages. Only users explicitly added to Store 2102 can read or change its data.

## One-time setup

1. Create a project at [Supabase](https://supabase.com/dashboard). Use a strong database password and keep it in your password manager.
2. Open **SQL Editor**, create a new query, paste the complete contents of `supabase-schema.sql`, and run it.
3. Open **Authentication → URL Configuration**.
   - Set **Site URL** to `https://jonnylost.github.io/2nc-store-operations-dashboard/`.
   - Add the same address to **Redirect URLs**.
4. Open **Authentication → Users**, choose **Add user → Send invitation**, and invite your email address.
5. Return to **SQL Editor** and run the final membership statement shown at the bottom of `supabase-schema.sql`, replacing `YOUR_EMAIL_HERE` with the invited email.
6. Open **Project Settings → API** and copy:
   - Project URL
   - Publishable/anon public key
7. Open the dashboard, select **Production setup**, paste those two public values, confirm Store `2102`, and save.
8. Enter your email on the sign-in screen and open the secure link that arrives. The first successful sign-in copies the current device’s dashboard state into the protected database.

The public anon key is designed for browser use. Security comes from the Row Level Security policies installed by `supabase-schema.sql`. Never paste the Supabase `service_role` or secret key into the dashboard or repository.

## Add another manager

1. In Supabase, open **Authentication → Users → Add user → Send invitation**.
2. In **SQL Editor**, run:

```sql
insert into public.store_members (store_id, user_id, role)
select '2102', id, 'manager'
from auth.users
where lower(email) = lower('MANAGER_EMAIL_HERE');
```

The invited manager can then use **Account** in the dashboard and sign in with the approved email address. This v1.0 pilot intentionally allows only owner/manager accounts because the synchronized record includes pay rates and the manager Communication Log.

## Remove access

Run this in **SQL Editor**, then optionally delete the person under **Authentication → Users**:

```sql
delete from public.store_members
where store_id = '2102'
  and user_id = (select id from auth.users where lower(email) = lower('FORMER_USER_EMAIL'));
```

Removing the membership blocks dashboard data immediately, even if the user still has an active sign-in link.

## Backups and recovery

- **Export backup** downloads a complete dated JSON copy you control.
- **Create cloud backup** saves a dated recovery point in the protected database.
- **Restore backup** validates a downloaded JSON backup before replacing the current data and synchronizing it.
- The browser also keeps a recovery cache so a brief internet outage does not erase current work.

For the first two weeks of Q3, export a JSON backup at the end of each week in addition to the cloud backups.
