-- Live reference snapshot: 18 October 2026, Timeline Viewer, PostgreSQL 17.
-- Function bodies read with pg_get_functiondef through read-only Supabase MCP.
-- Documentation only; no functions were created or changed by this export.
-- Read-only role checks invoked only is_studio_owner(), not the mutation functions.
-- All three functions use SECURITY INVOKER and an empty search_path.
-- PUBLIC and anon have no EXECUTE grant; grants below reflect the live ACLs.
-- Default/role/schema privileges and Supabase-managed functions are not included.

-- The configured owner UUID identifies an account; it is not a credential.
CREATE OR REPLACE FUNCTION public.is_studio_owner()
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SECURITY INVOKER
 SET search_path TO ''
AS $function$
    SELECT coalesce(
        (SELECT auth.uid()) = '9d509840-e2f9-4c71-bef1-5ee31ecaa1ac'::uuid,
        false
    );
$function$;

REVOKE EXECUTE ON FUNCTION public.is_studio_owner() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_studio_owner()
    TO postgres, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.save_project_in_universe(p_universe_id bigint, p_project_id bigint, p_title text, p_release_date date, p_primary_universe_id bigint, p_position integer)
 RETURNS SETOF public.projects
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path TO ''
AS $function$
declare
    v_project_id bigint;
    v_other_ids bigint[];
begin
    if p_title is null or btrim(p_title) = '' then
        raise exception 'Project title is required.';
    end if;

    -- Serialize saves to the same chronology.
    perform 1
    from public.universes
    where id = p_universe_id
    for update;

    if not found then
        raise exception 'Universe does not exist or is unavailable.';
    end if;

    if p_project_id is not null then
        perform 1
        from public.universe_projects
        where universe_id = p_universe_id
          and project_id = p_project_id;

        if not found then
            raise exception 'Project is no longer linked to this universe.';
        end if;
    end if;

    -- Keep every other project in its existing relative order.
    select coalesce(
        array_agg(up.project_id order by up.timeline_position),
        '{}'::bigint[]
    )
    into v_other_ids
    from public.universe_projects up
    where up.universe_id = p_universe_id
      and (
          p_project_id is null
          or up.project_id <> p_project_id
      );

    if p_position is null
       or p_position < 1
       or p_position > cardinality(v_other_ids) + 1 then
        raise exception 'Position is outside the available range.';
    end if;

    set constraints public.universe_projects_position_key deferred;

    if p_project_id is null then
        insert into public.projects (
            title,
            release_date,
            primary_universe_id
        )
        values (
            btrim(p_title),
            p_release_date,
            p_primary_universe_id
        )
        returning id into v_project_id;

        -- Temporary position; the full order is assigned below.
        insert into public.universe_projects (
            universe_id,
            project_id,
            timeline_position
        )
        values (
            p_universe_id,
            v_project_id,
            1
        );
    else
        update public.projects
        set title = btrim(p_title),
            release_date = p_release_date,
            primary_universe_id = p_primary_universe_id
        where id = p_project_id
        returning id into v_project_id;

        if not found then
            raise exception 'Project does not exist or could not be updated.';
        end if;
    end if;

    with new_order as (
        select
            item.project_id,
            (
                item.ordinality +
                case
                    when item.ordinality >= p_position then 1
                    else 0
                end
            )::integer as position
        from unnest(v_other_ids)
            with ordinality as item(project_id, ordinality)

        union all

        select v_project_id, p_position
    )
    update public.universe_projects up
    set timeline_position = new_order.position
    from new_order
    where up.universe_id = p_universe_id
      and up.project_id = new_order.project_id;

    set constraints public.universe_projects_position_key immediate;

    return query
    select p.*
    from public.projects p
    join public.universe_projects up on up.project_id = p.id
    where up.universe_id = p_universe_id
    order by up.timeline_position;
end;
$function$;

REVOKE EXECUTE ON FUNCTION public.save_project_in_universe(bigint, bigint, text, date, bigint, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_project_in_universe(bigint, bigint, text, date, bigint, integer)
    TO postgres, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.link_project_to_universe(p_universe_id bigint, p_project_id bigint)
 RETURNS SETOF public.projects
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path TO ''
AS $function$
begin
    -- Use the same chronology lock as save_project_in_universe.
    perform 1
    from public.universes
    where id = p_universe_id
    for update;

    if not found then
        raise exception 'Universe does not exist or is unavailable.';
    end if;

    insert into public.universe_projects (
        universe_id,
        project_id,
        timeline_position
    )
    select
        p_universe_id,
        p_project_id,
        coalesce(max(timeline_position), 0) + 1
    from public.universe_projects
    where universe_id = p_universe_id
    on conflict (universe_id, project_id) do nothing;

    return query
    select p.*
    from public.projects p
    join public.universe_projects up on up.project_id = p.id
    where up.universe_id = p_universe_id
    order by up.timeline_position;
end;
$function$;

REVOKE EXECUTE ON FUNCTION public.link_project_to_universe(bigint, bigint) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.link_project_to_universe(bigint, bigint)
    TO postgres, authenticated, service_role;
