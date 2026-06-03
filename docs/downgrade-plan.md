# Downgrading an Organization from PRO to BASIC

Use this when you need to manually downgrade an org — for testing, refunds, expired plans, or support.

---

## What changes

| Field | PRO | BASIC |
|---|---|---|
| `Organization.plan` | `PRO` | `BASIC` |
| `Organization.planExpiresAt` | a future date | `NULL` |

The app reads these values fresh from the DB on every dashboard page load, so the downgrade takes effect immediately after saving — no restart needed.

---

## Option 1 — Prisma Studio (GUI, no SQL)

```bash
npx prisma studio
```

1. Open `http://localhost:5555`
2. Click the **Organization** table
3. Find the org by `name` or `slug`
4. Set `plan` → `BASIC`
5. Clear `planExpiresAt` → set to empty / `NULL`
6. Click **Save 1 change**

---

## Option 2 — SQL via Neon Dashboard

Go to [console.neon.tech](https://console.neon.tech) → your project → **SQL Editor**, then run:

```sql
-- downgrade by org slug
UPDATE "Organization"
SET plan = 'BASIC', "planExpiresAt" = NULL
WHERE slug = 'your-org-slug';

-- or downgrade by org id
UPDATE "Organization"
SET plan = 'BASIC', "planExpiresAt" = NULL
WHERE id = 'clxxxxxxxxxxxxxxxx';
```

To find the slug or id first:

```sql
SELECT id, name, slug, plan, "planExpiresAt"
FROM "Organization";
```

---

## Option 3 — psql CLI

```bash
psql "$DATABASE_URL" -c \
  "UPDATE \"Organization\" SET plan='BASIC', \"planExpiresAt\"=NULL WHERE slug='your-org-slug';"
```

---

## Verify

```sql
SELECT name, slug, plan, "planExpiresAt"
FROM "Organization"
WHERE slug = 'your-org-slug';
```

Expected result:

```
 name        | slug          | plan  | planExpiresAt
-------------+---------------+-------+---------------
 Acme Corp   | acme-corp     | BASIC | null
```

---

## After downgrading

- Reload the app — no restart needed
- The header will show **Upgrade** instead of **PRO**
- Leads page, analytics charts, and employee creation will be gated again
- The user's data (leads, employees) is **not deleted** — it stays in the DB

---

## Re-upgrading for testing

Use Razorpay test mode. Quickest methods:

| Method | How |
|---|---|
| Net Banking | Razorpay modal → Netbanking → any bank → auto-succeeds |
| UPI | Show All Options → UPI → `success@razorpay` |
| Domestic card | `5267 3181 8797 5449` · exp `02/26` · CVV `123` · OTP `1234` |
