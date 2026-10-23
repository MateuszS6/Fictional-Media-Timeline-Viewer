import { useState } from 'react';
import WorkspaceBar from './components/layout/WorkspaceBar';
import { useWorkspace } from './context/WorkspaceContext';
import CharactersPage from './pages/CharactersPage';
import ProjectsPage from './pages/ProjectsPage';
import TimelinePage from './pages/TimelinePage';
import WorkspacesPage from './pages/WorkspacesPage';
import type { Character } from './types/character';
import type { WorkspaceView } from './types/workspace';

export default function App() {
	const [activeView, setActiveView] = useState<WorkspaceView>("timeline");
	const [timelineTarget, setTimelineTarget] = useState<{
		universeId: number;
		characterId: number;
	} | null>(null);

	const {
		franchises,
		universes,
		selectedFranchiseId,
		selectedUniverseId,
		canEdit,
		loading,
		error,
		setSelectedUniverseId,
		retryWorkspace
	} = useWorkspace();

	const focusedCharacterId =
		timelineTarget?.universeId === selectedUniverseId
			? timelineTarget.characterId
			: null;

	function openCharacterTimeline(
		universeId: number,
		character: Character
	) {
		if (!universes.some((universe) =>
			universe.id === universeId &&
			(canEdit || universe.is_published)
		)) return;

		setSelectedUniverseId(universeId);
		setTimelineTarget({
			universeId,
			characterId: character.id
		});
		setActiveView("timeline");
	}

	const selectedFranchise = franchises.find(
		(franchise) => franchise.id === selectedFranchiseId
	);

	const selectedUniverse = universes.find(
		(universe) => universe.id === selectedUniverseId
	);

	const universeName = selectedUniverse?.name ?? "Workspace";

	const title = activeView === "workspaces"
		? "Franchises & universes"
		: activeView === "timeline"
			? selectedUniverse?.name ?? "Timeline"
			: activeView === "characters"
				? "Characters"
				: "Projects";

	let description: string;

	if (activeView === "workspaces") {
		description = "Manage franchises and their universes.";
	} else if (activeView === "characters") {
		description = `Manage characters for ${universeName}`;
	} else if (activeView === "projects") {
		description = `Projects in the chronology of ${universeName}`;
	} else if (
		selectedFranchise?.name === "Marvel" &&
		selectedUniverse?.code
	) {
		description = `Character lifelines for Earth-${selectedUniverse.code}`;
	} else {
		description = "Character lifelines showing appearances across projects";
	}

	return (
		<div className='app-layout'>
			<WorkspaceBar
				activeView={activeView}
				onWorkspaceChange={() => setTimelineTarget(null)}
				onViewChange={(view) => {
					setTimelineTarget(null);
					setActiveView(view);
				}}
			/>

			<main className='main-content'>
				<header className='page-header'>
					<h1>{title}</h1>
					<p>{description}</p>
				</header>

				{loading ? (
					<p className='status-message' role='status'>
						Loading workspace...
					</p>
				) : error ? (
					<div className='status-message status-error' role='alert'>
						<p>{error}</p>
						<button
							type='button'
							className='utility-button'
							onClick={retryWorkspace}
						>
							Try again
						</button>
					</div>
				) : activeView === "workspaces" ? (
					<WorkspacesPage
						key={selectedFranchiseId ?? "empty"}
					/>
				) : selectedUniverseId === null ? (
					<p className='status-message'>
						{franchises.length === 0
							? "No franchises are available."
							: "No universes are available for this franchise."}
						{canEdit && " Open Franchises & universes to add one."}
					</p>
				) : activeView === "timeline" ? (
					<TimelinePage
						key={selectedUniverseId + ":" + (focusedCharacterId ?? "all")}
						universeId={selectedUniverseId}
						focusedCharacterId={focusedCharacterId}
						onOpenOrigin={(character) =>
							openCharacterTimeline(
								character.origin_universe_id,
								character
							)
						}
					/>
				) : activeView === "characters" ? (
					<CharactersPage
						key={selectedUniverseId}
						universeId={selectedUniverseId}
						onEditTimeline={(character) =>
							openCharacterTimeline(selectedUniverseId, character)
						}
					/>
				) : (
					<ProjectsPage
						key={selectedUniverseId}
						universeId={selectedUniverseId}
					/>
				)}
			</main>
		</div>
	);
}