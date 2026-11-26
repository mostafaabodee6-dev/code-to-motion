begin;

create table public.arena_events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check(slug ~ '^[a-z][a-z0-9-]{2,50}$'),
  title_ar text not null check(length(title_ar) between 1 and 120),
  title_en text not null check(length(title_en) between 1 and 120),
  scene text not null default 'countdown' check(scene in ('countdown','gallery','leaderboard','winners','break')),
  published boolean not null default false
);
create table public.arena_members (
  event_id uuid references public.arena_events on delete cascade,
  user_id uuid references auth.users on delete cascade,
  alias text not null check(length(alias) between 2 and 40),
  primary key(event_id,user_id)
);
create table public.arena_challenges (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.arena_events on delete cascade,
  title text not null check(length(title) between 2 and 120),
  rules text not null check(length(rules) between 1 and 2500),
  state text not null default 'draft' check(state in ('draft','active','paused','review','voting','complete','cancelled')),
  deadline timestamptz,
  paused_seconds integer,
  created_at timestamptz not null default now(),
  unique(event_id,id)
);
create unique index arena_one_current_challenge on public.arena_challenges(event_id)
  where state in ('active','paused','review','voting');
create table public.arena_submissions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null,
  challenge_id uuid not null,
  user_id uuid not null,
  title text not null check(length(title) between 2 and 100),
  video_path text unique not null,
  status text not null default 'pending' check(status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  unique(challenge_id,user_id),
  foreign key(event_id,challenge_id) references public.arena_challenges(event_id,id) on delete cascade,
  foreign key(event_id,user_id) references public.arena_members on delete cascade
);
create table public.arena_votes (
  submission_id uuid references public.arena_submissions on delete cascade,
  challenge_id uuid not null references public.arena_challenges on delete cascade,
  voter_id uuid references auth.users on delete cascade,
  created_at timestamptz not null default now(),
  primary key(challenge_id,voter_id)
);
create index arena_votes_submission on public.arena_votes(submission_id);
create table public.arena_results (
  submission_id uuid primary key references public.arena_submissions on delete cascade,
  votes integer not null check(votes>=0)
);
create table public.arena_audit (
  id bigint generated always as identity primary key,
  actor uuid references auth.users on delete set null,
  action text not null,
  target uuid not null,
  created_at timestamptz not null default now()
);

alter table public.arena_events enable row level security;
alter table public.arena_members enable row level security;
alter table public.arena_challenges enable row level security;
alter table public.arena_submissions enable row level security;
alter table public.arena_votes enable row level security;
alter table public.arena_results enable row level security;
alter table public.arena_audit enable row level security;
revoke all on public.arena_events,public.arena_members,public.arena_challenges,
public.arena_submissions,public.arena_votes,public.arena_results,public.arena_audit from anon,authenticated;
-- App reads and changes go through the explicitly granted RPCs below.

create function public.arena_state(p_slug text,p_public boolean default false)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  event public.arena_events;
  challenge public.arena_challenges;
  admin boolean:=not coalesce(p_public,false) and coalesce(public.is_admin(),false);
  me uuid:=case when not coalesce(p_public,false) then auth.uid() end;
  result jsonb;
begin
  select * into event from public.arena_events e where e.slug=p_slug and (e.published or admin);
  if not found then return null; end if;
  select * into challenge from public.arena_challenges c where c.event_id=event.id
    and (admin or c.state not in ('draft','cancelled'))
    order by case when c.state in ('active','paused','review','voting') then 0 when c.state='draft' then 1 else 2 end,
      c.created_at desc,c.id limit 1;
  select coalesce(jsonb_agg(jsonb_build_object(
    'id',s.id,'title',s.title,'alias',m.alias,'video_path',s.video_path,'status',s.status,
    'own',s.user_id=me,'voted',exists(select 1 from public.arena_votes v where v.submission_id=s.id and v.voter_id=me),
    'votes',case when challenge.state='complete' then (select r.votes from public.arena_results r where r.submission_id=s.id) else null end
  ) order by s.created_at,s.id),'[]'::jsonb) into result
  from public.arena_submissions s join public.arena_members m using(event_id,user_id)
  where s.challenge_id=challenge.id and (s.status='approved' or s.user_id=me or admin);
  return jsonb_build_object('event',to_jsonb(event),'challenge',to_jsonb(challenge),'submissions',result,
    'admin',admin,'alias',(select m.alias from public.arena_members m where m.event_id=event.id and m.user_id=me),
    'server_now',clock_timestamp(),
    'has_voted',exists(select 1 from public.arena_votes v where v.challenge_id=challenge.id and v.voter_id=me));
end $$;

create function public.arena_join(p_event uuid,p_alias text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or not exists(select 1 from public.arena_events where id=p_event and published) then
    raise exception 'Event unavailable';
  end if;
  insert into public.arena_members(event_id,user_id,alias) values(p_event,auth.uid(),btrim(p_alias))
    on conflict(event_id,user_id) do update set alias=excluded.alias;
end $$;

create function public.arena_submit(p_challenge uuid,p_title text,p_path text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare c public.arena_challenges; new_id uuid; me uuid:=auth.uid();
begin
  select * into c from public.arena_challenges where id=p_challenge for update;
  if me is null or not found or c.state<>'active' or c.deadline<=clock_timestamp() then
    raise exception 'Submissions are closed';
  end if;
  if split_part(p_path,'/',1)<>p_challenge::text or
     not exists(select 1 from storage.objects o where o.bucket_id='arena-clips' and o.name=p_path and o.owner_id=me::text) then
    raise exception 'Video upload is unavailable';
  end if;
  insert into public.arena_submissions(event_id,challenge_id,user_id,title,video_path)
    values(c.event_id,c.id,me,btrim(p_title),p_path) returning id into new_id;
  return new_id;
end $$;

create function public.arena_vote(p_submission uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare s public.arena_submissions; c public.arena_challenges; me uuid:=auth.uid();
begin
  select * into s from public.arena_submissions where id=p_submission;
  select * into c from public.arena_challenges where id=s.challenge_id for update;
  if me is null or not found or c.state<>'voting' or c.deadline<=clock_timestamp() then raise exception 'Voting is closed'; end if;
  select * into s from public.arena_submissions where id=p_submission;
  if s.status<>'approved' or s.user_id=me or
    not exists(select 1 from public.arena_members m where m.event_id=s.event_id and m.user_id=me) then
    raise exception 'You cannot vote for this submission';
  end if;
  insert into public.arena_votes(submission_id,challenge_id,voter_id) values(s.id,c.id,me);
end $$;

create function public.arena_control(
  p_event uuid,p_action text,p_target uuid default null,p_title text default null,
  p_rules text default null,p_seconds integer default 300
) returns void language plpgsql security definer set search_path = '' as $$
declare c public.arena_challenges; s public.arena_submissions; target uuid:=p_target;
begin
  if not coalesce(public.is_admin(),false) then raise exception 'Administrator access required'; end if;
  if not exists(select 1 from public.arena_events where id=p_event for update) then raise exception 'Event unavailable'; end if;
  if p_seconds is null or p_seconds not between 15 and 14400 then raise exception 'Duration must be between 15 and 14400 seconds'; end if;
  if p_action='publish' then
    update public.arena_events set published=true where id=p_event;
    target:=p_event;
  elsif p_action='scene' then
    update public.arena_events set scene=p_title where id=p_event;
    target:=p_event;
  elsif p_action='create' then
    insert into public.arena_challenges(event_id,title,rules) values(p_event,btrim(p_title),btrim(p_rules)) returning id into target;
  elsif p_action in ('approve','reject') then
    select * into s from public.arena_submissions where id=p_target and event_id=p_event;
    select * into c from public.arena_challenges where id=s.challenge_id for update;
    if not found or c.state not in ('active','paused','review') then raise exception 'Moderation is closed'; end if;
    update public.arena_submissions set status=case when p_action='approve' then 'approved' else 'rejected' end where id=s.id;
  else
    select * into c from public.arena_challenges where id=p_target and event_id=p_event for update;
    if not found then raise exception 'Challenge unavailable'; end if;
    if p_action='start' and c.state='draft' then
      update public.arena_challenges set state='active',deadline=clock_timestamp()+make_interval(secs=>p_seconds) where id=c.id;
    elsif p_action='pause' and c.state='active' then
      update public.arena_challenges set state='paused',paused_seconds=greatest(0,ceil(extract(epoch from c.deadline-clock_timestamp()))::int),deadline=null where id=c.id;
    elsif p_action='resume' and c.state='paused' and c.paused_seconds>0 then
      update public.arena_challenges set state='active',deadline=clock_timestamp()+make_interval(secs=>c.paused_seconds),paused_seconds=null where id=c.id;
    elsif p_action='extend' and c.state in ('active','voting') then
      update public.arena_challenges set deadline=greatest(c.deadline,clock_timestamp())+make_interval(secs=>p_seconds) where id=c.id;
    elsif p_action='review' and c.state in ('active','paused') then
      update public.arena_challenges set state='review',deadline=null,paused_seconds=null where id=c.id;
    elsif p_action='voting' and c.state='review' then
      update public.arena_challenges set state='voting',deadline=clock_timestamp()+make_interval(secs=>p_seconds) where id=c.id;
    elsif p_action='complete' and c.state='voting' then
      insert into public.arena_results(submission_id,votes)
        select s.id,count(v.submission_id)::int
        from public.arena_submissions s left join public.arena_votes v on v.submission_id=s.id
        where s.challenge_id=c.id and s.status='approved' group by s.id;
      update public.arena_challenges set state='complete',deadline=null where id=c.id;
    elsif p_action='cancel' and c.state in ('draft','active','paused','review','voting') then
      update public.arena_challenges set state='cancelled',deadline=null,paused_seconds=null where id=c.id;
    else raise exception 'Invalid challenge transition';
    end if;
  end if;
  insert into public.arena_audit(actor,action,target) values(auth.uid(),p_action,target);
end $$;

create function public.arena_storage_upload(p_name text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(
    select 1 from public.arena_members m join public.arena_challenges c on c.event_id=m.event_id
    where m.user_id=auth.uid() and split_part(p_name,'/',1)=c.id::text and
      c.state='active' and c.deadline>statement_timestamp()
      and split_part(p_name,'/',2) ~ '^[0-9a-f-]{36}\.(mp4|webm)$'
      and array_length(string_to_array(p_name,'/'),1)=2
      and not exists(select 1 from public.arena_submissions s where s.challenge_id=c.id and s.user_id=m.user_id)
  );
$$;
create function public.arena_storage_read(p_name text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.arena_submissions s join public.arena_events e on e.id=s.event_id
    where s.video_path=p_name and (s.user_id=auth.uid() or (s.status='approved' and e.published)))
    or coalesce(public.is_admin(),false);
$$;
create function public.arena_storage_remove(p_name text)
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and not exists(select 1 from public.arena_submissions where video_path=p_name);
$$;

revoke execute on function public.arena_state(text,boolean),public.arena_join(uuid,text),public.arena_submit(uuid,text,text),
  public.arena_vote(uuid),public.arena_control(uuid,text,uuid,text,text,integer),public.arena_storage_upload(text),
  public.arena_storage_read(text),public.arena_storage_remove(text) from public,anon,authenticated;
grant execute on function public.arena_state(text,boolean),public.arena_storage_read(text) to anon,authenticated;
grant execute on function public.arena_join(uuid,text),public.arena_submit(uuid,text,text),public.arena_vote(uuid),
  public.arena_control(uuid,text,uuid,text,text,integer),public.arena_storage_upload(text),public.arena_storage_remove(text) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
  values('arena-clips','arena-clips',false,20971520,array['video/mp4','video/webm']);
create policy arena_clips_upload on storage.objects for insert to authenticated
  with check(bucket_id='arena-clips' and public.arena_storage_upload(name));
create policy arena_clips_read on storage.objects for select to anon,authenticated
  using(bucket_id='arena-clips' and (
    case when auth.uid() is not null and owner_id=auth.uid()::text then true
    else public.arena_storage_read(name) end));
create policy arena_clips_remove on storage.objects for delete to authenticated
  using(bucket_id='arena-clips' and owner_id=auth.uid()::text and public.arena_storage_remove(name));

insert into public.arena_events(slug,title_ar,title_en)
  values('code-to-motion','�� ����� ��� ������','Code to Motion');
commit;
