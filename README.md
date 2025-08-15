# Supabase Database Schema with SQL Queries

---

## 1️⃣ Supabase Auth (Default Table: `auth.users`)

Supabase automatically manages:

| Column Name         | Type      |
| ------------------- | --------- |
| id                  | UUID      |
| email               | TEXT      |
| encrypted\_password | TEXT      |
| email\_verified     | BOOLEAN   |
| created\_at         | TIMESTAMP |

We’ll use this as the primary reference for all user-related data.

---

## 2️⃣ Table: `user_profiles`

Stores extended user information.

| Column Name    | Type       | Constraints                                           |
| -------------- | ---------- | ----------------------------------------------------- |
| id             | UUID       | Primary Key, references auth.users(id)                |
| full\_name     | TEXT       | NOT NULL                                              |
| birthdate      | DATE       | NOT NULL, must validate >= 18 years                   |
| gender         | TEXT       | CHECK (gender IN ('Male','Female','Other'))           |
| phone\_number  | TEXT       | 10 digits, with country code                          |
| profile\_image | TEXT (URL) | Nullable (default placeholder)                        |
| role           | TEXT       | Nullable, defaults to 'user' or 'admin' if applicable |
| created\_at    | TIMESTAMP  | DEFAULT now()                                         |
| updated\_at    | TIMESTAMP  | DEFAULT now()                                         |

🔹 Relation: `user_profiles.id → auth.users.id` (1-to-1)

### SQL Query:

```sql
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    birthdate DATE NOT NULL,
    gender TEXT CHECK (gender IN ('Male','Female','Other')),
    phone_number TEXT,
    profile_image TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 3️⃣ Table: `email_verification_tokens`

For email verification with expiry (10 mins).

| Column Name | Type      | Constraints                 |
| ----------- | --------- | --------------------------- |
| id          | UUID      | Primary Key (generated)     |
| user\_id    | UUID      | FOREIGN KEY → auth.users.id |
| token       | TEXT      | UNIQUE, required            |
| expires\_at | TIMESTAMP | Required                    |
| is\_used    | BOOLEAN   | DEFAULT false               |
| created\_at | TIMESTAMP | DEFAULT now()               |

🔹 Relation: `email_verification_tokens.user_id → auth.users.id` (Many-to-1)

### SQL Query:

```sql
CREATE TABLE public.email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 4️⃣ Table: `password_reset_tokens`

For forgot password functionality (10 min expiry).

| Column Name | Type      | Constraints                 |
| ----------- | --------- | --------------------------- |
| id          | UUID      | Primary Key                 |
| user\_id    | UUID      | FOREIGN KEY → auth.users.id |
| token       | TEXT      | UNIQUE, required            |
| expires\_at | TIMESTAMP | Required                    |
| is\_used    | BOOLEAN   | DEFAULT false               |
| created\_at | TIMESTAMP | DEFAULT now()               |

🔹 Relation: `password_reset_tokens.user_id → auth.users.id` (Many-to-1)

### SQL Query:

```sql
CREATE TABLE public.password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 5️⃣ Table: `documents`

For user document uploads with approval/rejection workflow.

| Column Name     | Type      | Constraints                                                          |
| --------------- | --------- | -------------------------------------------------------------------- |
| id              | UUID      | Primary Key                                                          |
| user\_id        | UUID      | FOREIGN KEY → auth.users.id                                          |
| document\_name  | TEXT      | NOT NULL                                                             |
| document\_type  | TEXT      | CHECK(document\_type IN ('Aadhaar','PAN','Resume','Other'))          |
| file\_url       | TEXT      | Required (Supabase storage file link)                                |
| upload\_date    | TIMESTAMP | DEFAULT now()                                                        |
| status          | TEXT      | DEFAULT 'Pending' CHECK(status IN ('Pending','Approved','Rejected')) |
| rejection\_note | TEXT      | Nullable                                                             |
| updated\_at     | TIMESTAMP | DEFAULT now()                                                        |

🔹 Relation: `documents.user_id → auth.users.id` (Many-to-1)

### SQL Query:

```sql
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    document_name TEXT NOT NULL,
    document_type TEXT CHECK (document_type IN ('Aadhaar','PAN','Resume','Other')),
    file_url TEXT NOT NULL,
    upload_date TIMESTAMP DEFAULT NOW(),
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending','Approved','Rejected')),
    rejection_note TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 6️⃣ Admin Role Management

Instead of using a separate table for admins, you can store admin profiles in `user_profiles` by adding a `role` column.

* `role` can be 'user' or 'admin'.
* This simplifies role-based access control without needing an additional table.


# Supabase Database Schema with SQL Queries

---

## Using Supabase Edge Functions

Supabase Edge Functions are serverless functions that you can deploy directly on Supabase to handle backend logic. You write them in TypeScript or JavaScript and they run on Deno runtime.

**Steps to use:**

1. Install Supabase CLI (`npm install supabase --global`).
2. Initialize functions folder (`supabase functions new my-function`).
3. Write your logic inside the generated index.ts file.
4. Deploy function with `supabase functions deploy my-function`.
5. Call it using the endpoint `https://<project-ref>.functions.supabase.co/my-function` via fetch or your client app.

Would you like me to prepare a quick example Edge Function (like sending a welcome email) for your schema?
