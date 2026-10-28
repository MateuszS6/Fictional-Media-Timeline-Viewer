import { useEffect, useRef, useState } from 'react';
import WorkspaceBar from './components/layout/WorkspaceBar';
import { useWorkspace } from './context/WorkspaceContext';
import CharactersPage from './pages/CharactersPage';
import ProjectsPage from './pages/ProjectsPage';
import TimelinePage from './pages/TimelinePage';
import WorkspacesPage from './pages/WorkspacesPage';
import type { Character } from './types/character';
import type { WorkspaceView } from './types/workspace';
import TimelineGuide from './components/timeline/TimelineGuide';

export default function App() {
	const [requestedView, setRequestedView] =
		useState<WorkspaceView>("franchises");

	const [timelineTarget, setTimelineTarget] = useState<{
		universeId: number;
		characterId: number;
	} | null>(null);

	const headingRef = useRef<HTMLHeadingElement>(null);

	const {
		franchises,
		universes,
		selectedFranchiseId,
		selectedUniverseId,
		canEdit,
		loading,
		savingWorkspace,
		error,
		setSelectedFranchiseId,
		setSelectedUniverseId,
		retryWorkspace
	} = useWorkspace();

	const selectedFranchise = franchises.find(
		(franchise) => franchise.id === selectedFranchiseId
	);

	const selectedUniverse = universes.find(
		(universe) => universe.id === selectedUniverseId
	);

	const availableUniverses = universes.filter(
		(universe) => canEdit || universe.is_published
	);

	// "browse" chooses the first screen after a franchise's universes load.
	const activeView =
		!selectedFranchise || requestedView === "franchises"
			? "franchises"
			: requestedView === "browse"
				? !canEdit && availableUniverses.length === 1
					? "timeline"
					: "universes"
				: requestedView;

	const isTimeline = activeView === "timeline";

	const isBrowsing = activeView === "franchises" || activeView === "universes";

	const focusedCharacterId =
		timelineTarget?.universeId === selectedUniverseId
			? timelineTarget.characterId
			: null;

	useEffect(() => {
		if (!loading && !error) {
			headingRef.current?.focus({ preventScroll: true });
		}
	}, [activeView, selectedFranchiseId, selectedUniverseId, loading, error])

	function changeView(view: WorkspaceView) {
		if (savingWorkspace) return;

		setTimelineTarget(null);

		if (view === "franchises") {
			setSelectedFranchiseId(null);
		}

		setRequestedView(view);
	}

	function openFranchise(id: number) {
		if (savingWorkspace) return;

		setTimelineTarget(null);
		setSelectedFranchiseId(id);
		setRequestedView("browse");
	}

	function openUniverse(id: number) {
		if (savingWorkspace) return;

		setTimelineTarget(null);
		setSelectedUniverseId(id);
		setRequestedView("timeline");
	}

	function openCharacterTimeline(
		universeId: number,
		character: Character
	) {
		if (
			savingWorkspace ||
			!availableUniverses.some(
				(universe) => universe.id === universeId
			)
		) return;

		setSelectedUniverseId(universeId);
		setTimelineTarget({
			universeId,
			characterId: character.id
		});
		setRequestedView("timeline");
	}

	const universeName = selectedUniverse?.name ?? "this universe";

	const title = activeView === "franchises"
		? canEdit ? "Franchises" : "Explore timelines"
		: activeView === "universes"
			? selectedUniverse?.name ?? "Universes"
			: isTimeline
				? universeName
				: activeView === "characters"
					? "Characters"
					: "Projects";

	const description = activeView === "franchises"
		? canEdit
			? "Choose a franchise to manage its universes."
			: "Choose a franchise to explore its stories."
		: activeView === "universes"
			? canEdit
				? "Open a timeline or manage its universe below."
				: "Choose a universe to explore."
			: activeView === "characters"
				? "Manage characters for " + universeName
				: activeView === "projects"
					? "Projects in the chronology of " + universeName
					: selectedFranchise?.name === "Marvel" &&
						selectedUniverse?.code
						? "Character lifelines for Earth-" + selectedUniverse.code
						: "Character lifelines showing appearances across projects";

	return (
		<div className='app-layout'>
			<WorkspaceBar
				activeView={activeView}
				onViewChange={changeView}
				onWorkspaceChange={() => setTimelineTarget(null)}
			/>

			<main
				className={`main-content ${isTimeline ? "main-content-timeline" : ""}`}
			>
				<header
					className={`page-header ${isTimeline ? "timeline-page-header" : ""}`}
				>
					<div className='page-heading'>
						<h1 ref={headingRef} tabIndex={-1}>{title}</h1>
						<p>{description}</p>
					</div>

					{isTimeline && (
						<TimelineGuide key={selectedUniverseId ?? "empty"} />
					)}
				</header>

				{loading ? (
					<p className='status-message' role='status'>
						Loading...
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
				) : isBrowsing ? (
					<WorkspacesPage
						key={activeView + ":" + (selectedFranchiseId ?? "all")}
						level={activeView}
						onOpenFranchise={openFranchise}
						onOpenUniverse={openUniverse}
					/>
				) : selectedUniverseId === null ? (
					<p className='status-message'>
						Choose a universe from its franchise page.
					</p>
				) : isTimeline ? (
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
				) : activeView === "characters" && canEdit ? (
					<CharactersPage
						key={selectedUniverseId}
						universeId={selectedUniverseId}
						onEditTimeline={(character) =>
							openCharacterTimeline(selectedUniverseId, character)
						}
					/>
				) : canEdit ? (
					<ProjectsPage
						key={selectedUniverseId}
						universeId={selectedUniverseId}
					/>
				) : null}
			</main>
		</div>
	);
}