import { supabase } from "../config/supabase";
import type { Franchise, FranchiseInput } from "../types/franchise";

export async function getFranchises(): Promise<Franchise[]> {
    const { data, error } = await supabase
        .from("franchises")
        .select("*")
        .order("name");

    if (error) throw error;

    return data ?? [];
}

export async function createFranchise(
    input: FranchiseInput
): Promise<Franchise> {
    const { data, error } = await supabase
        .from("franchises")
        .insert(input)
        .select()
        .single();

    if (error) throw error;

    return data;
}

export async function updateFranchise(
    id: number,
    input: FranchiseInput
): Promise<Franchise> {
    const { data, error } = await supabase
        .from("franchises")
        .update(input)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;

    return data;
}

export async function deleteFranchise(id: number): Promise<void> {
    const { error } = await supabase
        .from("franchises")
        .delete()
        .eq("id", id)
        .select("id")
        .single();

    if (error) throw error;
}