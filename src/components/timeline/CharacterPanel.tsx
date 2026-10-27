import { useEffect, useRef } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { APPEARANCE_OPTIONS, type Appearance } from "../../types/appearance";
import type { Character } from "../../types/character";
import { CHARACTER_EVENT_OPTIONS, type CharacterEvent } from "../../types/characterEvent";
import type { Project } from "../../types/project";
import EventIcon from "./EventIcon";

interface CharacterPanelProps {
	character: Character;
	universeId: number;
	projects: Project[];
	appearances: Appearance[];
	characterEvents: CharacterEvent[];
	saving: boolean;
	onClose: () => void;
	onOpenOrigin: (character: Character) => void;
}

export default function CharacterPanel({
	character,
	universeId,
	projects,
	appearances,
	characterEvents,
	saving,
	onClose,
	onOpenOrigin
}: CharacterPanelProps) {
	const { universes, canEdit } = useWorkspace();

	const dialogRef = useRef<HTMLDialogElement>(null);
	const closeRef = useRef<HTMLButtonElement>(null);
	const bodyRef = useRef<HTMLDivElement>(null);

	const universe = universes.find(
		(item) => item.id === universeId
	);

	const origin = universes.find(
		(item) => item.id === character.origin_universe_id
	);

	const canOpenOrigin = Boolean(
		origin && (canEdit || origin.is_published)
	);

	const entries = projects.map((project) => ({
		project,
		appearance: appearances.find((item) =>
			item.universe_id === universeId &&
			item.character_id === character.id &&
			item.project_id === project.id
		),
		event: characterEvents.find((item) =>
			item.universe_id === universeId &&
			item.character_id === character.id &&
			item.project_id === project.id
		)
	})).filter((entry) => entry.appearance || entry.event);

	const appearanceCount = entries.filter(
		(entry) => entry.appearance
	).length;

	const eventCount = entries.filter(
		(entry) => entry.event
	).length;

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;

		const narrow = window.matchMedia("(max-width: 800px)");

		function updatePresentation() {
			if (!dialog) return;
			if (dialog.open) dialog.close();

			if (narrow.matches) dialog.showModal();
			else dialog.show();

			closeRef.current?.focus({ preventScroll: true });
		}

		if (bodyRef.current) bodyRef.current.scrollTop = 0;

		updatePresentation();
		narrow.addEventListener("change", updatePresentation);

		return () => {
			narrow.removeEventListener("change", updatePresentation);
		};
	}, [character.id]);

	function closePanel() {
		dialogRef.current?.close();
		onClose();
	}

	return (
		<dialog
			ref={dialogRef}
			id="character-panel"
			className="character-panel"
			aria-labelledby="character-panel-title"
			onCancel={(event) => {
				event.preventDefault();
				closePanel();
			}}
			onKeyDown={(event) => {
				if (event.key === "Escape") {
					event.preventDefault();
					event.stopPropagation();
					closePanel();
				}
			}}
		>
			<header className="character-panel-header">
				<h2 id="character-panel-title">
					{character.alias}
				</h2>

				<button
					ref={closeRef}
					type="button"
					className="utility-button"
					onClick={closePanel}
				>
					Close
				</button>
			</header>

			<div ref={bodyRef} className="character-panel-body">
				<dl className="character-facts">
					{character.real_name && (
						<div>
							<dt>Full name</dt>
							<dd>{character.real_name}</dd>
						</div>
					)}

					<div>
						<dt>Origin universe</dt>
						<dd>
							{origin?.name ?? "Origin unavailable"}

							{origin?.code && origin.code !== origin.name && (
								<span className="character-origin-code">
									{" "}({origin.code})
								</span>
							)}
						</dd>
					</div>
				</dl>

				{character.origin_universe_id !== universeId && (
					<>
						<button
							type="button"
							className="utility-button"
							disabled={saving || !canOpenOrigin}
							onClick={() => {
								closePanel();
								onOpenOrigin(character);
							}}
						>
							Open origin timeline
						</button>

						{!canOpenOrigin && (
							<p className="character-panel-note">
								{origin && !canEdit && !origin.is_published
									? "This origin timeline is not published."
									: "The origin timeline is unavailable here."}
							</p>
						)}
					</>
				)}

				<h3>In {universe?.name ?? "this timeline"}</h3>

				<p className="character-panel-summary">
					{appearanceCount}{" "}
					{appearanceCount === 1 ? "appearance" : "appearances"}
					{" · "}
					{eventCount}{" "}
					{eventCount === 1 ? "event" : "events"}
				</p>

				<p className="character-panel-note">
					In this timeline's project order.
					Detached appearances are included.
				</p>

				{entries.length === 0 ? (
					<p>No appearances or events recorded here.</p>
				) : (
					<ol className="character-history">
						{entries.map(({ project, appearance, event }) => (
							<li key={project.id}>
								<h4>{project.title}</h4>

								{appearance && (
									<p>
										{APPEARANCE_OPTIONS.find((option) =>
											option.value === appearance.appearance_type
										)?.label}

										{appearance.is_detached
											? " · Detached"
											: " · Connected"}
									</p>
								)}

								{event && (
									<p className="character-history-event">
										<EventIcon type={event.event_type} />

										<span>
											{CHARACTER_EVENT_OPTIONS.find((option) =>
												option.value === event.event_type
											)?.label}
											{" · "}
											{event.event_position === "after"
												? "After this project"
												: "At this project"}
										</span>
									</p>
								)}
							</li>
						))}
					</ol>
				)}
			</div>
		</dialog>
	);
}