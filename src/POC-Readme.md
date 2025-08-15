-- USERS Table (linked with Supabase Auth)
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text unique not null,
  password text, -- hashed password handled by Supabase Auth
  birthdate date not null,
  gender text check (gender in ('Male', 'Female', 'Other')),
  phone_number text check (char_length(phone_number) = 10),
  country_code text default '+91',
  is_verified boolean default false,
  profile_picture text, -- URL to profile image in storage
  created_at timestamp default now()
);

-- EMAIL VERIFICATION TOKENS
create table email_verification_tokens (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  token text not null unique,
  expires_at timestamp not null,
  created_at timestamp default now()
);

-- PASSWORD RESET TOKENS
create table password_reset_tokens (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  token text not null unique,
  expires_at timestamp not null,
  created_at timestamp default now()
);

-- ENUM TYPE for Document Types
create type document_type as enum (
  'Aadhaar Card', 'Affidavit', 'Bank Account Passbook/Statement (with address)',
  'Bank Statement', 'Birth Certificate', 'Court Decrees/Judgments',
  'Degree Certificates', 'Death Certificate', 'Disability Certificate',
  'Driving Licence', 'Employer Letter', 'Encumbrance Certificate (EC)',
  'Form 16', 'Government Employee ID Card', 'Health Insurance Policy',
  'Income Tax Return (ITR)', 'Insurance Papers (Property or Vehicle)',
  'Investment Proofs (FD, Mutual Funds, Shares)', 'Land Records/Patta/Chitta',
  'Mark Sheets', 'Marriage Certificate', 'Medical Reports', 'Mutation/Khata Certificate',
  'PAN Card', 'Passport', 'Pollution Under Control (PUC) Certificate',
  'Power of Attorney', 'Property Registration Certificate', 'Property Sale Deed',
  'Property Tax Receipt', 'Ration Card', 'Rent Agreement (registered)',
  'Salary Slip', 'Utility Bills (Electricity, Water, Gas, Landline)',
  'Vaccination Certificate', 'Vehicle Registration Certificate (RC)',
  'Voter ID (EPIC Card)', 'Will/Testament', 'Resume', 'Other'
);

-- DOCUMENTS Table
create table documents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  document_name text not null,
  document_type document_type not null,
  file_url text not null,
  note text,
  status text check (status in ('Pending', 'Approved', 'Rejected')) default 'Pending',
  rejection_note text,
  upload_date timestamp default now(),
  created_at timestamp default now()
);

-- ADMIN USERS Table
create table admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text unique not null,
  profile_picture text,
  created_at timestamp default now()
);

-- DOCUMENT VERIFICATIONS Table (optional audit/log)
create table document_verifications (
  id uuid primary key default uuid_generate_v4(),
  document_id uuid references documents(id) on delete cascade,
  admin_id uuid references admin_users(id),
  status text check (status in ('Approved', 'Rejected')),
  remarks text,
  verified_at timestamp default now()
);

-- SUBSCRIPTION PLANS Table
create table subscription_plans (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  price numeric(10,2) not null,
  billing_cycle text check (billing_cycle in ('Monthly', 'Yearly')) not null,
  stripe_price_id text unique not null,
  created_at timestamp default now()
);

-- SUBSCRIPTIONS Table
create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  plan_id uuid references subscription_plans(id),
  stripe_subscription_id text,
  status text check (status in ('Active', 'Cancelled', 'Expired')) not null,
  payment_date timestamp,
  next_billing_date timestamp,
  created_at timestamp default now()
);

-- USER PLAN USAGE Table
create table user_plan_usage (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  plan_id uuid references subscription_plans(id),
  documents_uploaded int default 0,
  period_start timestamp,
  period_end timestamp,
  created_at timestamp default now()
);
