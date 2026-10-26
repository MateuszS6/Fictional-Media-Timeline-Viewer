import { supabase } from "../config/supabase";
import type { Appearance, AppearanceType, AppearanceUpdate } from "../types/appearance";

export async function getAppearancesForProjects(
	universeId: number,
	projectIds: number[]
): Promise<Appearance[]> {
	if (projectIds.length === 0) return [];

	const { data, error } = await supabase
		.from("appearances")
		.select("*")
		.eq("universe_id", universeId)
		.in("project_id", projectIds);

	if (error) throw error;

	return data ?? [];
}

export async function createAppearance(
	universeId: number,
	characterId: number,
	projectId: number,
	appearanceType: AppearanceType = "standard"
): Promise<Appearance> {
	const { data, error } = await supabase
		.from("appearances")
		.insert({
			universe_id: universeId,
			character_id: characterId,
			project_id: projectId,
			appearance_type: appearanceType
		})
		.select()
		.single();

	if (error) throw error;

	return data;
}

export async function updateAppearance(
	universeId: number,
	characterId: number,
	projectId: number,
	updates: AppearanceUpdate
): Promise<Appearance> {
	const { data, error } = await supabase
		.from("appearances")
		.update(updates)
		.eq("universe_id", universeId)
		.eq("character_id", characterId)
		.eq("project_id", projectId)
		.select()
		.single();

	if (error) throw error;

	return data;
}

export async function deleteAppearance(
	universeId: number,
	characterId: number,
	projectId: number
): Promise<void> {
	const { error } = await supabase
		.from("appearances")
		.delete()
		.eq("universe_id", universeId)
		.eq("character_id", characterId)
		.eq("project_id", projectId);

	if (error) throw error;
}