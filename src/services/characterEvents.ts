import { supabase } from "../config/supabase";
import type { CharacterEvent, CharacterEventPosition, CharacterEventType } from "../types/characterEvent";

export async function getCharacterEventsForProjects(
	universeId: number,
	projectIds: number[]
): Promise<CharacterEvent[]> {
	if (projectIds.length === 0) return [];

	const { data, error } = await supabase
		.from("character_events")
		.select("*")
		.eq("universe_id", universeId)
		.in("project_id", projectIds);

	if (error) throw error;

	return data ?? [];
}

export async function saveCharacterEvent(
	universeId: number,
	characterId: number,
	projectId: number,
	eventType: CharacterEventType,
	eventPosition: CharacterEventPosition
): Promise<CharacterEvent> {
	const { data, error } = await supabase
		.from("character_events")
		.upsert(
			{
				universe_id: universeId,
				character_id: characterId,
				project_id: projectId,
				event_type: eventType,
				event_position: eventPosition
			},
			{
				onConflict: "universe_id,character_id,project_id"
			}
		)
		.select()
		.single();

	if (error) throw error;

	return data;
}

export async function deleteCharacterEvent(
	universeId: number,
	characterId: number,
	projectId: number
): Promise<void> {
	const { error } = await supabase
		.from("character_events")
		.delete()
		.eq("universe_id", universeId)
		.eq("character_id", characterId)
		.eq("project_id", projectId);

	if (error) throw error;
}