import { useEffect, useRef } from 'react';
import { Navigate, useBlocker, useLocation, useNavigate } from 'react-router';
import WorkspaceBar from './components/layout/WorkspaceBar';
import TimelineGuide from './components/timeline/TimelineGuide';
import { useWorkspace } from './context/WorkspaceContext';
import CharactersPage from './pages/CharactersPage';
import ProjectsPage from './pages/ProjectsPage';
import TimelinePage from './pages/TimelinePage';
import UnavailablePage from './pages/UnavailablePage';
import WorkspacesPage from './pages/WorkspacesPage';
import type { Character } from './types/character';
import type { WorkspaceView } from './types/workspace';
import { workspacePath } from './utils/workspacePath';
import PageTitle from './components/layout/PageTitle';

export default function App({
	activeView
}: {
	activeView: WorkspaceView;
}) {
	const headingRef = useRef<HTMLHeadingElement>(null);
	const navigate = useNavigate();
	const location = useLocation();

	const {
		franchises,
		universes,
		selectedFranchiseId,
		selectedUniverseId,
		canEdit,
		loading,
		savingWorkspace,
		error,
		retryWorkspace
	} = useWorkspace();

	const blocker = useBlocker(savingWorkspace);

	useEffect(() => {
		if (blocker.state === "blocked") blocker.reset();
	}, [blocker]);

	const selectedFranchise = franchises.find(
		(franchise) => franchise.id === selectedFranchiseId
	);

	const availableUniverses = universes.filter(
		(universe) => canEdit || universe.is_published
	);

	const selectedUniverse = availableUniverses.find(
		(universe) => universe.id === selectedUniverseId
	);

	const available =
		(selectedFranchiseId === null || !!selectedFranchise) &&
		(selectedUniverseId === null || !!selectedUniverse);

	const isTimeline = activeView === "timeline";

	const isBrowsing =
		activeView === "franchises" ||
		activeView === "universes";

	const requestedCharacter = location.state?.focusCharacterId;

	const focusedCharacterId =
		typeof requestedCharacter === "number" &&
			Number.isSafeInteger(requestedCharacter) &&
			requestedCharacter > 0
			? requestedCharacter
			: null;

	useEffect(() => {
		if (!loading && !error) {
			headingRef.current?.focus({ preventScroll: true });
		}
	}, [location.pathname, loading, error])

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

		navigate(
			workspacePath(
				canEdit,
				selectedFranchiseId,
				universeId
			),
			{ state: { focusCharacterId: character.id } }
		);
	}

	if (!loading && !error && !available) {
		return <UnavailablePage studio={canEdit} />;
	}

	if (
		!loading &&
		!error &&
		activeView === "universes" &&
		!canEdit &&
		location.state?.autoOpen === true &&
		availableUniverses.length === 1
	) {
		return (
			<Navigate
				replace
				to={workspacePath(
					false,
					selectedFranchiseId,
					availableUniverses[0].id
				)}
			/>
		);
	}

	const universeName = selectedUniverse?.name ?? "Timeline";

	const title = activeView === "franchises"
		? canEdit ? "Franchises" : "Explore timelines"
		: activeView === "universes"
			? selectedFranchise?.name ?? "Universes"
			: isTimeline
				? universeName
				: activeView === "characters"
					? "Characters"
					: "Projects";

	const description = activeView === "franchises"
		? canEdit
			? "Choose a franchise to manage its universes."
			: "A fan-made public preview. Choose a franchise to explore its stories."
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
			<PageTitle title={
				canEdit
					? title + " — Plotstrand Studio"
					: activeView === "franchises"
						? "Plotstrand — Fictional Timelines"
						: title + " — Plotstrand"
			} />
			<WorkspaceBar activeView={activeView} />

			<main
				className={
					"main-content" +
					(isTimeline ? " main-content-timeline" : "")
				}
			>
				<header
					className={
						"page-header" +
						(isTimeline ? " timeline-page-header" : "")
					}
				>
					<div className='page-heading'>
						<h1 ref={headingRef} tabIndex={-1}>
							{title}
						</h1>
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
						key={activeView}
						level={activeView}
					/>
				) : selectedUniverseId !== null && isTimeline ? (
					<TimelinePage
						key={
							selectedUniverseId + ":" +
							(focusedCharacterId ?? "all")
						}
						universeId={selectedUniverseId}
						focusedCharacterId={focusedCharacterId}
						onOpenOrigin={(character) =>
							openCharacterTimeline(
								character.origin_universe_id,
								character
							)
						}
					/>
				) : selectedUniverseId !== null && activeView === "characters" && canEdit ? (
					<CharactersPage
						key={selectedUniverseId}
						universeId={selectedUniverseId}
						onEditTimeline={(character) =>
							openCharacterTimeline(selectedUniverseId, character)
						}
					/>
				) : selectedUniverseId !== null && canEdit ? (
					<ProjectsPage
						key={selectedUniverseId}
						universeId={selectedUniverseId}
					/>
				) : null}
			</main>
		</div>
	);
}