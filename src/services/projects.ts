import { supabase } from '../config/supabase'
import type { Project, ProjectInput } from '../types/project';

interface UniverseProjectLink {
    project_id: number;
    timeline_position: number;
}

export async function getProjectsForUniverse(
    universeId: number
): Promise<Project[]> {

    const { data: links, error: linksError } = await supabase
        .from("universe_projects")
        .select("project_id, timeline_position")
        .eq("universe_id", universeId)
        .order("timeline_position");

    if (linksError) throw linksError;

    if (!links || links.length === 0) {
        return [];
    }

    const projectIds = (links as UniverseProjectLink[]).map(
        (link) => link.project_id
    );

    const { data: projects, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .in("id", projectIds);

    if (projectsError) throw projectsError;

    const projectMap = new Map(
        (projects ?? []).map((project) => [
            project.id,
            project
        ])
    );

    return links.flatMap((link) => {
        const project =
            projectMap.get(link.project_id);

        return project ? [project] : [];
    })
}

export async function getProjectsForPrimaryUniverses(
    universeIds: number[]
): Promise<Project[]> {
    if (universeIds.length === 0) return [];

    const { data, error } = await supabase
        .from("projects")
        .select("*")
        .in("primary_universe_id", universeIds)
        .order("title")
        .order("id");

    if (error) throw error;

    return data ?? [];
}

export async function saveProjectInUniverse(
    universeId: number,
    projectId: number | null,
    input: ProjectInput,
    position: number
): Promise<Project[]> {
    const { data, error } = await supabase.rpc(
        "save_project_in_universe",
        {
            p_universe_id: universeId,
            p_project_id: projectId,
            p_title: input.title,
            p_release_date: input.release_date,
            p_primary_universe_id: input.primary_universe_id,
            p_position: position
        }
    );

    if (error) throw error;

    return data ?? [];
}

export async function linkProjectToUniverse(
    universeId: number,
    projectId: number
): Promise<Project[]> {
    const { data, error } = await supabase.rpc(
        "link_project_to_universe",
        {
            p_universe_id: universeId,
            p_project_id: projectId
        }
    );

    if (error) throw error;

    return data ?? [];
}

export async function unlinkProjectToUniverse(
    universeId: number,
    projectId: number
): Promise<void> {
    const { error } = await supabase
        .from("universe_projects")
        .delete()
        .eq("universe_id", universeId)
        .eq("project_id", projectId)
        .select("project_id")
        .single();

    if (error) throw error;
}

export async function deleteProject(id: number): Promise<void> {
    const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", id)
        .select("id")
        .single();

    if (error) throw error;
}