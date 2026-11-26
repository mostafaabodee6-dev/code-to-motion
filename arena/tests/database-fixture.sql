-- Third-party service boundary fixtures for an isolated PostgreSQL test database.
create role anon nologin;
create role authenticated nologin;
create schema auth;
create schema storage;
create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('arena_test.uid',true),'')::uuid
$$;
grant usage on schema auth,storage to anon,authenticated;
create function public.is_admin() returns boolean language sql stable as $$
  select auth.uid()='00000000-0000-0000-0000-000000000001'::uuid
$$;
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(bucket_id text references storage.buckets,name text,owner_id text,primary key(bucket_id,name));
alter table storage.objects enable row level security;
grant select,insert,delete on storage.objects to anon,authenticated;
insert into auth.users(id) values
  ('00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000003');
