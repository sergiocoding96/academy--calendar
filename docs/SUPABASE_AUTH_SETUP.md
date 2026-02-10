# Supabase auth setup (sign-in / register)

## 1. Create auth tables

Your Supabase project needs `players`, `coaches`, and `user_profiles` for the academy app.

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project (**dhisrdvfocenhfarblxd**).
2. Go to **SQL Editor** → **New query**.
3. Paste and run the contents of:
   - `supabase/migrations/20250210000000_academy_auth_tables.sql`
4. Click **Run**. You should see “Success. No rows returned.”

## 2. Auth settings (fix 400 on login)

If login returns **400** or “Invalid login credentials” / “Email not confirmed”:

1. In Dashboard go to **Authentication** → **Providers** → **Email**.
2. Turn **off** “Confirm email” (for development) so new users can sign in without confirming.
3. If you added **player@test.com** manually in **Authentication** → **Users**, set the password to **player123** again (or use **Send password recovery** to reset), and ensure the user is **Confirmed** (or disable confirm as above).

## 3. Create the player user (two options)

**Option A – Register in the app**

1. Open the app → **Register**.
2. Choose **Player**, enter name, **player@test.com**, password **player123** (min 6 chars), confirm password.
3. Click **Create account**. You should be redirected to the dashboard.

**Option B – Already created in Dashboard**

1. In **Authentication** → **Users**, add user **player@test.com** with password **player123** and mark as confirmed.
2. You still need a **player** row and **user_profile** for this auth user. Easiest is to use **Option A** (register in app) once the migration has been run; that creates the player and user_profile automatically.

## 4. Sign in

Go to **Login**, enter **player@test.com** / **player123**, then **Sign in**.

If you still see **400**: check Auth → Users that the user exists, is confirmed, and the password is correct. Use “Send password recovery” to reset if needed.
