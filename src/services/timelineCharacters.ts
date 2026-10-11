import { supabase } from "../config/supabase";
import type { Character } from "../types/character";
import { getCharactersByIds } from "./characters";

export async function getTimelineCharactersIds(
    universeId: number
): Promise<number[]> {
    const { data, error } = await supabase
        .from("universe_characters")
        .select("character_id")
        .eq("universe_id", universeId)

    if (error) throw error;

    return (data ?? []).map((row) => row.character_id);
}

export async function getTimelineCharacters(
    universeId: number,
    focusedCharacterId: number | null = null
): Promise<Character[]> {
    const ids = await getTimelineCharactersIds(universeId);

    if (
        focusedCharacterId !== null &&
        !ids.includes(focusedCharacterId)
    ) {
        ids.push(focusedCharacterId);
    }

    return getCharactersByIds(ids);
}

export async function showCharacterOnTimeline(
    universeId: number,
    characterId: number
): Promise<void> {
    const { error } = await supabase
        .from("universe_characters")
        .upsert(
            {
                universe_id: universeId,
                character_id: characterId
            },
            {
                onConflict: "universe_id,character_id",
                ignoreDuplicates: true
            }
        );

    if (error) throw error;
}

export async function hideCharacterFromTimeline(
    universeId: number,
    characterId: number
): Promise<void> {
    const { error } = await supabase
        .from("universe_characters")
        .delete()
        .eq("universe_id", universeId)
        .eq("character_id", characterId);

    if (error) throw error;
}