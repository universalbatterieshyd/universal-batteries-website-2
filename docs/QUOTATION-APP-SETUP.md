# Rapid Quote Engine — setup

## 1. Run the migration

In Supabase SQL Editor, run:

`supabase/migrations/019_quote_engine.sql`

## 2. Create your quote admin user

1. Supabase → Authentication → Users → Add user (email + password).
2. Copy the user UUID.
3. Run:

```sql
INSERT INTO quote_profiles (user_id, role, display_name, branch_id, can_access_cms)
VALUES (
  '<auth-user-uuid>',
  'quote_admin',
  'Saurabh',
  (SELECT id FROM quote_branches WHERE code = 'MG'),
  true  -- set false for shop staff so they cannot open /admin
);
```

For shop boys / salespeople: `can_access_cms = false`, role = `salesperson` or `shop_boy`.

## 3. Open the app

- Quotes login: `/quotes/login`
- Website CMS login: `/admin/login` (unchanged)
- Shop staff with Quotes-only profiles are redirected away from `/admin`

## 4. Built so far

- Schema: branches, profiles, categories, products, buyback, pricing, customers, quotes
- Separate auth gate in middleware
- `/quotes` home, `/quotes/admin`, category drag-and-drop tree
- Stubs: new quote, import, settings, users

## 5. Next slices

1. Excel workbook import (sheet adapters + Category column)
2. Quote builder (search, Target/Floor, buyback, PDF)
