import type { Appearance } from "../../types/appearance";
import type { CharacterEvent } from "../../types/characterEvent";
import EventIcon from "./EventIcon";

type MarkerAppearance = Pick<Appearance, "appearance_type" | "is_detached">;

type MarkerEvent = Pick<CharacterEvent, "event_type" | "event_position">;

interface TimelineMarkersProps {
	appearance?: MarkerAppearance;
	characterEvent?: MarkerEvent;
	isFirstConnected?: boolean;
}

export default function TimelineMarkers({
	appearance,
	characterEvent,
	isFirstConnected = false
}: TimelineMarkersProps) {
	const mergedEvent =
		characterEvent?.event_position === "at" &&
			appearance?.appearance_type === "standard" &&
			!appearance.is_detached
			? characterEvent
			: undefined;

	const eventLabel = characterEvent?.event_type === "unknown"
		? "Unknown status"
		: characterEvent?.event_type;

	return (
		<>
			{/* First connected appearance has a pointer to it */}
			{isFirstConnected && (
				<span
					className="timeline-start-marker"
					title="First connected appearance"
				/>
			)}

			{/* An appearance, with a possibly merged event */}
			{appearance && (
				<span
					className={`
						appearance-marker
						appearance-${appearance.appearance_type}
						${appearance.is_detached ? "appearance-detached" : ""}
						${mergedEvent ? "appearance-with-event" : ""}
					`}
					title={
						appearance.appearance_type.replaceAll("_", " ") +
						(appearance.is_detached ? " - detached" : "") +
						(mergedEvent
							? ` - ${eventLabel} at this project`
							: "")
					}
				>
					{mergedEvent && (
						<span className="appearance-event-symbol">
							<EventIcon type={mergedEvent.event_type} />
						</span>
					)}
				</span>
			)}

			{/* A standalone character event */}
			{characterEvent && !mergedEvent && (
				<span
					className={`
												timeline-event
												timeline-event-${characterEvent.event_position}
												${appearance ? "timeline-event-with-appearance" : ""}
										`}
					title={`${eventLabel} - ${characterEvent.event_position} this project`}
				>
					<EventIcon type={characterEvent.event_type} />
				</span>
			)}
		</>
	);
}