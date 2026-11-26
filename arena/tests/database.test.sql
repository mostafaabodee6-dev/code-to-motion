begin;

set local role authenticated;
select set_config('arena_test.uid','00000000-0000-0000-0000-000000000001',true);
select public.arena_state('code-to-motion')->'event'->>'id' as ev \gset
select public.arena_control(:'ev','publish');
select public.arena_control(:'ev','create',null,'Demo challenge','Make a three second video');
select public.arena_state('code-to-motion')->'challenge'->>'id' as ch \gset
select public.arena_control(:'ev','start',:'ch',null,null,300);
select set_config('arena_test.uid','00000000-0000-0000-0000-000000000002',true);
select public.arena_join(:'ev','Maker A');
select set_config('arena_test.uid','00000000-0000-0000-0000-000000000003',true);
select public.arena_join(:'ev','Maker B');
select set_config('arena_test.uid','00000000-0000-0000-0000-000000000002',true);
select :'ch'||'/00000000-0000-0000-0000-000000000020.webm' as clip \gset
insert into storage.objects(bucket_id,name,owner_id) values('arena-clips',:'clip',auth.uid()::text);
select public.arena_submit(:'ch','Maker A clip',:'clip') as sub \gset
select set_config('arena_test.sub',:'sub',true),set_config('arena_test.event',:'ev',true);
do $$
declare denied boolean:=false;
begin
  begin perform public.arena_control(current_setting('arena_test.event')::uuid,'publish');
  exception when raise_exception then denied:=true; end;
  if not denied then raise exception 'Participant admin action should fail'; end if;
end $$;

set local role anon;
select set_config('arena_test.uid','',true);
do $$
begin
  if jsonb_array_length(public.arena_state('code-to-motion',true)->'submissions')<>0 then
    raise exception 'Pending clip visible on public board';
  end if;
  if exists(select 1 from storage.objects where bucket_id='arena-clips') then
    raise exception 'Pending clip visible in public storage';
  end if;
end $$;

set local role authenticated;
select set_config('arena_test.uid','00000000-0000-0000-0000-000000000001',true);
select public.arena_control(:'ev','approve',:'sub');
select public.arena_control(:'ev','review',:'ch');
select public.arena_control(:'ev','voting',:'ch',null,null,300);
select set_config('arena_test.uid','00000000-0000-0000-0000-000000000002',true);
do $$
declare denied boolean:=false;
begin
  begin perform public.arena_vote(current_setting('arena_test.sub')::uuid);
  exception when raise_exception then denied:=true; end;
  if not denied then raise exception 'Self-vote should fail'; end if;
end $$;
select set_config('arena_test.uid','00000000-0000-0000-0000-000000000003',true);
select public.arena_vote(:'sub');
do $$
declare denied boolean:=false;
begin
  begin perform public.arena_vote(current_setting('arena_test.sub')::uuid);
  exception when unique_violation then denied:=true; end;
  if not denied then raise exception 'Duplicate vote should fail'; end if;
end $$;
select set_config('arena_test.uid','00000000-0000-0000-0000-000000000001',true);
select public.arena_control(:'ev','complete',:'ch');

set local role anon;
select set_config('arena_test.uid','',true);
do $$
begin
  if (public.arena_state('code-to-motion',true)->'submissions'->0->>'votes')::int is distinct from 1 then
    raise exception 'Public score should reflect one accepted vote';
  end if;
  if not exists(select 1 from storage.objects where bucket_id='arena-clips') then
    raise exception 'Approved clip should be readable';
  end if;
end $$;

rollback;
