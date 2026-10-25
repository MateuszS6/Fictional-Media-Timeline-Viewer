import type { CharacterEventType } from "../../types/characterEvent";

const paths: Record<CharacterEventType, string> = {
	death: "M6 6l12 12M18 6 6 18",
	revival: "M19 10a7 7 0 1 0-2 7M19 5v5h-5",
	blip: "M12 4l2.4 5.6L20 12l-5.6 2.4L12 20l-2.4-5.6L4 12l5.6-2.4Z",
	return: "M5 10a7 7 0 1 1 2 7M5 5v5h5",
	unknown: "M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4M12 18h.01"
}

export default function EventIcon({
	type
}: {
	type: CharacterEventType;
}) {
	return (
		<svg
			className="timeline-event-icon"
			viewBox="0 0 24 24"
			fill={
				type === "blip"
					? "true"
					: "none"
			}
			stroke="currentColor"
			strokeWidth="2.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			focusable="false"
		>
			<path d={paths[type]} />
		</svg>
	)
}