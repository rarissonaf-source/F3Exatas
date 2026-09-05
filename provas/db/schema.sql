create table if not exists comments (
  id text primary key,
  question_id text not null,
  author_email text not null,
  author_name text not null,
  author_picture text not null default '',
  text text not null,
  created_at timestamptz not null default now()
);

create index if not exists comments_question_id_idx on comments (question_id, created_at);

create table if not exists profiles (
  account_key text primary key,
  name text not null default '',
  email text not null default '',
  phone text not null default '',
  picture text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists question_lists (
  id text primary key,
  account_key text not null,
  name text not null,
  question_ids jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists question_lists_account_key_idx on question_lists (account_key, created_at);
