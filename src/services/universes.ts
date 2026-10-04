import { supabase } from "../config/supabase";
import type { Universe, UniverseInput } from "../types/universe";

export async function getUniversesByFranchise(
    franchiseId: number
): Promise<Universe[]> {
    const { data, error } = await supabase
        .from("universes")
        .select("*")
        .eq("franchise_id", franchiseId)
        .order("code")

    if (error) throw error;

    return data ?? [];
}

export async function createUniverse(
    franchiseId: number,
    input: UniverseInput
): Promise<Universe> {
    const { data, error } = await supabase
        .from("universes")
        .insert({
            franchise_id: franchiseId,
            ...input
        })
        .select()
        .single();

    if (error) throw error;

    return data;
}

export async function updateUniverse(
    id: number,
    input: UniverseInput
): Promise<Universe> {
    const { data, error } = await supabase
        .from("universes")
        .update(input)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;

    return data;
}

export async function deleteUniverse(id: number): Promise<void> {
    const { error } = await supabase
        .from("universes")
        .delete()
        .eq("id", id)
        .select("id")
        .single();

    if (error) throw error;
}