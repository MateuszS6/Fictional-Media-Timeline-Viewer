import { supabase } from "../config/supabase";
import type { Franchise, FranchiseInput } from "../types/franchise";

export async function getFranchises(
	publicOnly = false
): Promise<Franchise[]> {
	const query = publicOnly
		? supabase.from("franchises")
			.select("id, name, universes!inner(id)")
			.eq("universes.is_published", true)
		: supabase.from("franchises").select("id, name");

	const { data, error } = await query.order("name");

	if (error) throw error;

	return (data ?? []).map(({ id, name }) => ({ id, name }));
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