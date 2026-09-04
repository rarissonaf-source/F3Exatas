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
