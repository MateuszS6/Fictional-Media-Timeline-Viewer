import { useEffect, useRef } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import type { Appearance, AppearanceUpdate } from "../../types/appearance";
import type { Character } from "../../types/character";
import type { CharacterEvent, CharacterEventPosition, CharacterEventType } from "../../types/characterEvent";
import type { Project } from "../../types/project";
import { buildLifelineSegments } from "../../utils/buildLifelineSegments";
import { formatUniverseLabel } from "../../utils/formatUniverseLabel";

import TimelineCell from "./TimelineCell";

interface CharacterRowProps {
	character: Character;
	projects: Project[];
	appearances: Appearance[];
	characterEvents: CharacterEvent[];

	onCreateAppearance: (
		characterId: number,
		projectId: number
	) => void;

	onUpdateAppearance: (
		characterId: number,
		projectId: number,
		updates: AppearanceUpdate
	) => void;

	onDeleteAppearance: (
		characterId: number,
		projectId: number
	) => void;

	onSaveCharacterEvent: (
		characterId: number,
		projectId: number,
		eventType: CharacterEventType,
		eventPosition: CharacterEventPosition
	) => void;

	onDeleteCharacterEvent: (
		characterId: number,
		projectId: number
	) => void;

	selected: boolean;
	onSelect: (button: HTMLButtonElement) => void;

	focused: boolean;
	saving: boolean;
	onOpenOrigin: (character: Character) => void;
}

export default function CharacterRow({
	character,
	projects,
	appearances,
	characterEvents,
	onCreateAppearance,
	onUpdateAppearance,
	onDeleteAppearance,
	onSaveCharacterEvent,
	onDeleteCharacterEvent,
	selected,
	onSelect,
	focused,
	saving,
	onOpenOrigin
}: CharacterRowProps) {
	const { canEdit, universes, selectedUniverseId } = useWorkspace();

	const nameRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!focused) return;

		nameRef.current?.scrollIntoView({
			block: "center",
			inline: "nearest"
		});

		nameRef.current?.focus({ preventScroll: true });
	}, [focused]);

	const originUniverse = universes.find((universe) =>
		universe.id === character.origin_universe_id
	);

	const canOpenOrigin = originUniverse && (canEdit || originUniverse.is_published);

	const isVisitor = character.origin_universe_id !== selectedUniverseId;

	const originLabel = formatUniverseLabel(
		character.origin_universe_id,
		universes
	);

	const rowAppearances = projects.map((project) =>
		appearances.find(
			(appearance) =>
				appearance.character_id === character.id &&
				appearance.project_id === project.id
		)
	);

	const rowEvents = projects.map((project) =>
		characterEvents.find(
			(event) =>
				event.character_id === character.id &&
				event.project_id === project.id
		)
	);

	const lifelineSegments =
		buildLifelineSegments(
			rowAppearances,
			rowEvents
		);

	const firstConnectedIndex =
		rowAppearances.findIndex(
			(appearance) =>
				appearance !== undefined &&
				!appearance.is_detached
		)

	return (
		<div className={`timeline-row ${focused ? "timeline-row-focused" : ""
			} ${selected ? "timeline-row-selected" : ""}`}
		>
			<div
				ref={nameRef}
				className="character-column"
				tabIndex={-1}
			>
				<button
					type="button"
					className="character-name-button"
					aria-expanded={selected}
					aria-controls={selected ? "character-panel" : undefined}
					aria-haspopup="dialog"
					onClick={(event) => onSelect(event.currentTarget)}
				>
					{character.alias}
				</button>

				{isVisitor && (
					<button
						type="button"
						className="character-origin-link"
						disabled={saving || !canOpenOrigin}
						aria-label={
							`Open ${character.alias} in ${originUniverse?.name ?? originLabel
							}`
						}
						title={
							originUniverse && !canEdit && !originUniverse.is_published
								? `${originUniverse.name}: timeline not published.`
								: originUniverse
									? `Open origin timeline: ${originUniverse.name} ${originUniverse.code ? `(${originUniverse.code})` : ""}`
									: "Origin universe is outside the current franchise."
						}
						onClick={() => onOpenOrigin(character)}
					>
						{originLabel}
					</button>
				)}
			</div>

			{projects.map((project, index) => {
				const appearance = rowAppearances[index];
				const characterEvent = rowEvents[index];

				const lineLeft = lifelineSegments.some(
					(segment) =>
						segment.start < index &&
						segment.end >= index
				)

				const lineRight = lifelineSegments.some(
					(segment) =>
						segment.start <= index &&
						segment.end > index
				)

				const isFirstConnected =
					index === firstConnectedIndex;

				return (
					<TimelineCell
						key={project.id}
						characterId={character.id}
						projectId={project.id}
						characterName={character.alias}
						projectTitle={project.title}
						appearance={appearance}
						characterEvent={characterEvent}
						lineLeft={lineLeft}
						lineRight={lineRight}
						isFirstConnected={isFirstConnected}
						onCreate={onCreateAppearance}
						onUpdate={onUpdateAppearance}
						onDelete={onDeleteAppearance}
						onSaveEvent={onSaveCharacterEvent}
						onDeleteEvent={onDeleteCharacterEvent}
						saving={saving}
					/>
				);
			})}
		</div>
	)
}