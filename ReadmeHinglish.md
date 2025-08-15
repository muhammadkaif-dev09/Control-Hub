# Supabase Database Schema (Hinglish Explanation)

## 1️⃣ Supabase Auth (Default Table: `auth.users`)

Supabase ka default auth system yeh table manage karta hai:

* `id` (UUID) → Har user ka unique ID.
* `email` → User ka email address.
* `encrypted_password` → Password encrypted format mein store hota hai.
* `email_verified` (boolean) → Check karta hai ki email verify hui hai ya nahi.
* `created_at` → Account kab create hua uska timestamp.

**Relation:** Yeh table main base hai, baaki saare tables isi se link honge.

---

## 2️⃣ Table: `user_profiles`

Extended user information store karne ke liye.

| Column Name    | Type       | Explanation (Hinglish)                                        |
| -------------- | ---------- | ------------------------------------------------------------- |
| id             | UUID       | `auth.users.id` ko reference karta hai (1 user ka 1 profile). |
| full\_name     | TEXT       | User ka poora naam, required hai.                             |
| birthdate      | DATE       | DOB, aur validation hoga ki user 18+ years ka ho.             |
| gender         | TEXT       | Male, Female, Other me se koi ek.                             |
| phone\_number  | TEXT       | Country code ke sath 10 digit ka number.                      |
| profile\_image | TEXT (URL) | User ka profile pic link, optional.                           |
| role           | TEXT       | 'user' ya 'admin'.                                            |
| created\_at    | TIMESTAMP  | Profile kab create hua.                                       |
| updated\_at    | TIMESTAMP  | Last update kab hua.                                          |

🔹 **Relation:** `user_profiles.id → auth.users.id` (1-to-1 relation, har user ka ek profile hota hai).

---

## 3️⃣ Table: `email_verification_tokens`

Email verify karne ke liye token store karta hai (validity 10 mins).

| Column Name | Type      | Explanation (Hinglish)                                  |
| ----------- | --------- | ------------------------------------------------------- |
| id          | UUID      | Token ka unique ID.                                     |
| user\_id    | UUID      | `auth.users.id` ko reference karta hai.                 |
| token       | TEXT      | Unique token jo verification email mein bheja jata hai. |
| expires\_at | TIMESTAMP | Token ka expiry time.                                   |
| is\_used    | BOOLEAN   | Kya token use ho chuka hai ya nahi.                     |
| created\_at | TIMESTAMP | Token kab create hua.                                   |

🔹 **Relation:** `email_verification_tokens.user_id → auth.users.id` (Many-to-1 relation, ek user ke multiple tokens ho sakte hain).

---

## 4️⃣ Table: `password_reset_tokens`

Forgot password ke liye tokens (validity 10 mins).

| Column Name | Type      | Explanation (Hinglish)                  |
| ----------- | --------- | --------------------------------------- |
| id          | UUID      | Token ka unique ID.                     |
| user\_id    | UUID      | `auth.users.id` ko reference karta hai. |
| token       | TEXT      | Password reset ke liye unique token.    |
| expires\_at | TIMESTAMP | Token kab expire hoga.                  |
| is\_used    | BOOLEAN   | Token pehle use ho chuka hai ya nahi.   |
| created\_at | TIMESTAMP | Token kab create hua.                   |

🔹 **Relation:** `password_reset_tokens.user_id → auth.users.id` (Many-to-1 relation).

---

## 5️⃣ Table: `documents`

User documents upload aur approval/rejection workflow handle karta hai.

| Column Name     | Type      | Explanation (Hinglish)                                  |
| --------------- | --------- | ------------------------------------------------------- |
| id              | UUID      | Document ka unique ID.                                  |
| user\_id        | UUID      | Kis user ka document hai, reference to `auth.users.id`. |
| document\_name  | TEXT      | Document ka naam.                                       |
| document\_type  | TEXT      | Aadhaar, PAN, Resume, Other me se ek.                   |
| file\_url       | TEXT      | Supabase storage ka file link.                          |
| upload\_date    | TIMESTAMP | Document kab upload hua.                                |
| status          | TEXT      | Pending, Approved ya Rejected. Default 'Pending'.       |
| rejection\_note | TEXT      | Agar reject hua to reason.                              |
| updated\_at     | TIMESTAMP | Last update kab hua.                                    |

🔹 **Relation:** `documents.user_id → auth.users.id` (Many-to-1 relation, ek user ke multiple documents ho sakte hain).

---

## 6️⃣ Admin Role Management

Alag admins table banane ke bajay, hum `user_profiles` mein hi role store kar sakte hain.

* `role` = `'user'` ya `'admin'`.
* Isse role-based access easy ho jata hai aur extra table ki zaroorat nahi padti.
