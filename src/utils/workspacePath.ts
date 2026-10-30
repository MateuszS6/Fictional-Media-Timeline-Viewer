import type { WorkspaceView } from "../types/workspace";

export function workspacePath(
	studio: boolean,
	franchiseId: number | null = null,
	universeId: number | null = null,
	view: WorkspaceView = "timeline"
): string {
	const root = studio ? "/studio" : "";

	if (franchiseId === null) return root || "/";

	const franchise = root + "/franchises/" + franchiseId;

	if (universeId === null) return franchise;

	const timeline = franchise + "/timelines/" + universeId;

	return studio && (view === "characters" || view === "projects")
		? timeline + "/" + view
		: timeline;
}