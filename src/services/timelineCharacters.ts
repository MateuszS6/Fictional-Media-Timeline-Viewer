import type { Appearance } from "../types/appearance";
import type { CharacterEvent } from "../types/characterEvent";
import { getAppearancesForProjects } from "./appearances";
import { getCharacterEventsForProjects } from "./characterEvents";
import { getProjectsForUniverse } from "./projects";

export function collectCharacterIds(
	appearances: Appearance[],
	events: CharacterEvent[]
): number[] {
	return [...new Set([
		...appearances.map((appearance) => appearance.character_id),
		...events.map((event) => event.character_id)
	])];
}

export async function getTimelineCharacterIds(
	universeId: number
): Promise<number[]> {
	const projects = await getProjectsForUniverse(universeId);
	const projectIds = projects.map((project) => project.id);

	const [appearances, events] = await Promise.all([
		getAppearancesForProjects(universeId, projectIds),
		getCharacterEventsForProjects(universeId, projectIds)
	]);

	return collectCharacterIds(appearances, events);
}