import { useEffect, useRef, useState } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { createAppearance, deleteAppearance, getAppearancesForProjects, updateAppearance } from "../../services/appearances";
import { deleteCharacterEvent, getCharacterEventsForProjects, saveCharacterEvent } from "../../services/characterEvents";
import { getCharactersByIds } from "../../services/characters";
import { getProjectsForUniverse } from "../../services/projects";
import { collectCharacterIds } from "../../services/timelineCharacters";
import type { Appearance, AppearanceUpdate } from "../../types/appearance";
import type { Character } from "../../types/character";
import type { CharacterEvent, CharacterEventPosition, CharacterEventType } from "../../types/characterEvent";
import type { Project } from "../../types/project";
import CharacterRow from "./CharacterRow";
import TimelineHeader from "./TimelineHeader";
import CharacterPanel from "./CharacterPanel";

interface TimelineGridProps {
	universeId: number;
	focusedCharacterId: number | null;
	onOpenOrigin: (character: Character) => void;
}

export default function TimelineGrid({
	universeId,
	focusedCharacterId,
	onOpenOrigin
}: TimelineGridProps) {
	const { canEdit } = useWorkspace();

	const [projects, setProjects] = useState<Project[]>([]);
	const [characters, setCharacters] = useState<Character[]>([]);
	const [appearances, setAppearances] = useState<Appearance[]>([]);
	const [characterEvents, setCharacterEvents] = useState<CharacterEvent[]>([]);

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [loadAttempt, setLoadAttempt] = useState(0);
	const [actionError, setActionError] = useState<string | null>(null);

	const [saving, setSaving] = useState(false);
	const savingRef = useRef(false);

	// CHARACTER SELECTION / PANEL

	const [selectedCharacterId, setSelectedCharacterId] =
		useState<number | null>(null);

	const selectedCharacter = characters.find(
		(character) => character.id === selectedCharacterId
	);

	const selectionButtonRef = useRef<HTMLButtonElement | null>(null);
	const timelineRef = useRef<HTMLElement>(null);

	function closeCharacterPanel() {
		setSelectedCharacterId(null);

		const target = selectionButtonRef.current?.isConnected
			? selectionButtonRef.current
			: timelineRef.current

		target?.focus({ preventScroll: true });
	}

	// CHARACTER UNIVERSE SCOPE

	const participatingIds = new Set(collectCharacterIds(appearances, characterEvents));

	const visibleCharacters = characters.filter((character) =>
		participatingIds.has(character.id) ||
		character.id === focusedCharacterId
	);

	// ORIGIN CHARACTER HIGHLIGHT
	const focusedCharacter = characters.find(
		(character) => character.id === focusedCharacterId
	);

	useEffect(() => {
		let cancelled = false;

		async function loadTimeline() {
			try {
				const projectsData = await getProjectsForUniverse(universeId);

				if (cancelled) return;

				const projectIds = projectsData.map((project) => project.id);

				const [appearancesData, characterEventsData] = await Promise.all([
					getAppearancesForProjects(universeId, projectIds),
					getCharacterEventsForProjects(universeId, projectIds)
				]);

				if (cancelled) return;

				const characterIds = new Set(collectCharacterIds(appearancesData, characterEventsData));

				if (focusedCharacterId !== null) characterIds.add(focusedCharacterId);

				const charactersData = await getCharactersByIds([...characterIds]);

				if (cancelled) return;

				setProjects(projectsData);
				setCharacters(charactersData);
				setAppearances(appearancesData);
				setCharacterEvents(characterEventsData);
				setError(null);
			} catch (error) {
				if (cancelled) return;

				console.error(error);
				setError("Could not load timeline.")
			} finally {
				if (!cancelled) setLoading(false);
			}
		}

		void loadTimeline();

		return () => {
			cancelled = true;
		}
	}, [universeId, focusedCharacterId, loadAttempt]);

	function retryTimeline() {
		setError(null);
		setLoading(true);
		setLoadAttempt((current) => current + 1);
	}

	async function runTimelineChange(
		action: () => Promise<void>,
		failureMessage: string
	) {
		if (!canEdit || savingRef.current) return;

		savingRef.current = true;
		setSaving(true);
		setActionError(null);

		try {
			await action();
		} catch (caughtError) {
			console.error(caughtError);
			setActionError(failureMessage);
		} finally {
			savingRef.current = false;
			setSaving(false);
		}
	}

	// Appearance handlers

	async function handleCreateAppearance(
		characterId: number,
		projectId: number
	) {
		await runTimelineChange(async () => {
			const newAppearance = await createAppearance(
				universeId,
				characterId,
				projectId
			);

			setAppearances((current) => [
				...current,
				newAppearance
			]);
		}, "Could not add the appearance. Please try again.");
	}

	async function handleUpdateAppearance(
		characterId: number,
		projectId: number,
		updates: AppearanceUpdate
	) {
		await runTimelineChange(async () => {
			const updatedAppearance = await updateAppearance(
				universeId,
				characterId,
				projectId,
				updates
			);

			setAppearances((current) =>
				current.map((appearance) =>
					appearance.character_id === characterId &&
						appearance.project_id === projectId
						? updatedAppearance
						: appearance
				)
			);
		}, "Could not update the appearance. Please try again.");
	}

	async function handleDeleteAppearance(
		characterId: number,
		projectId: number
	) {
		await runTimelineChange(async () => {
			await deleteAppearance(universeId, characterId, projectId);

			setAppearances((current) =>
				current.filter((appearance) =>
					!(
						appearance.character_id === characterId &&
						appearance.project_id === projectId
					)
				)
			);
		}, "Could not remove the appearance. Please try again.");
	}

	// Event handlers

	async function handleSaveCharacterEvent(
		characterId: number,
		projectId: number,
		eventType: CharacterEventType,
		eventPosition: CharacterEventPosition
	) {
		await runTimelineChange(async () => {
			const savedEvent = await saveCharacterEvent(
				universeId,
				characterId,
				projectId,
				eventType,
				eventPosition
			);

			setCharacterEvents((current) => {
				const alreadyExists = current.some(
					(event) =>
						event.character_id === characterId &&
						event.project_id === projectId
				);

				if (!alreadyExists) return [...current, savedEvent];

				return current.map((event) =>
					event.character_id === characterId &&
						event.project_id === projectId
						? savedEvent
						: event
				);
			});
		}, "Could not save the event. Please try again.");
	}

	async function handleDeleteCharacterEvent(
		characterId: number,
		projectId: number
	) {
		await runTimelineChange(async () => {
			await deleteCharacterEvent(universeId, characterId, projectId);

			setCharacterEvents((current) =>
				current.filter((event) =>
					!(
						event.character_id === characterId &&
						event.project_id === projectId
					)
				)
			);
		}, "Could not remove the event. Please try again.");
	}

	if (loading) {
		return (
			<p className="status-message" role="status">
				Loading timeline...
			</p>
		);
	}

	if (error) {
		return (
			<div className="status-message status-error" role="alert">
				<p>{error}</p>

				<button
					type="button"
					className="utility-button"
					onClick={retryTimeline}
				>
					Try again
				</button>
			</div>
		);
	}

	if (projects.length === 0) {
		return (
			<p className="status-message">
				No projects have been added to this universe.
				{canEdit && " Open Projects to add one."}
			</p>
		);
	}

	return (
		<>
			{actionError && (
				<div className="status-message status-error" role="alert">
					<p>{actionError}</p>

					<button
						type="button"
						className="utility-button"
						onClick={() => setActionError(null)}
					>
						Dismiss
					</button>
				</div>
			)}

			{visibleCharacters.length === 0 && (
				<p className="status-message">
					No characters have appearances or events in this timeline yet.
					{canEdit &&
						" Open Characters and choose \"Edit on timeline\" to add the first entry."}
				</p>
			)}

			{focusedCharacter && !participatingIds.has(focusedCharacter.id) && (
				<p className="management-notice" role="status">
					{focusedCharacter.alias} has no entries here yet.

					{canEdit && (
						<>
							{" Click an empty cell to add an appearance, or right-click to add an event."}
							{" This empty row stays open only for this visit."}
						</>
					)}
				</p>
			)}

			<div className="timeline-workspace">
				<section
					ref={timelineRef}
					tabIndex={-1}
					className="timeline-container"
					aria-label="Character timeline"
					aria-busy={saving}
				>
					<div className="timeline-grid">
						<TimelineHeader projects={projects} />

						{visibleCharacters.map((character) => (
							<CharacterRow
								key={character.id}
								character={character}
								projects={projects}
								appearances={appearances}
								characterEvents={characterEvents}
								onCreateAppearance={handleCreateAppearance}
								onUpdateAppearance={handleUpdateAppearance}
								onDeleteAppearance={handleDeleteAppearance}
								onSaveCharacterEvent={handleSaveCharacterEvent}
								onDeleteCharacterEvent={handleDeleteCharacterEvent}
								selected={character.id === selectedCharacterId}
								onSelect={(button) => {
									selectionButtonRef.current = button;
									setSelectedCharacterId(character.id);
								}}
								focused={character.id === focusedCharacterId}
								saving={saving}
								onOpenOrigin={onOpenOrigin}
							/>
						))}
					</div>
				</section>

				{selectedCharacter && (
					<CharacterPanel
						character={selectedCharacter}
						universeId={universeId}
						projects={projects}
						appearances={appearances}
						characterEvents={characterEvents}
						saving={saving}
						onClose={closeCharacterPanel}
						onOpenOrigin={onOpenOrigin}
					/>
				)}
			</div>
		</>
	)
}