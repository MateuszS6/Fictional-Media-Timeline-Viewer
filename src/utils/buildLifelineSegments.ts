import type { Appearance } from "../types/appearance";
import { getContinuityEffect, type CharacterEvent } from "../types/characterEvent";

export interface LifelineSegment {
	start: number;
	end: number;
}

export function buildLifelineSegments(
	rowAppearances: Array<Appearance | undefined>,
	rowEvents: Array<CharacterEvent | undefined>
): LifelineSegment[] {
	const segments: LifelineSegment[] = [];

	let isActive = false;

	let segmentStart: number | null = null;
	let lastConnectedAppearance: number | null = null;

	function startSegment(coordinate: number) {
		isActive = true;
		segmentStart = coordinate;
		lastConnectedAppearance = coordinate;
	}

	function endSegment(coordinate: number) {
		if (!isActive || segmentStart === null) {
			return;
		}

		segments.push({
			start: segmentStart,
			end: coordinate
		});

		isActive = false;
		segmentStart = null;
		lastConnectedAppearance = null;
	}

	for (
		let index = 0;
		index < rowAppearances.length;
		index++
	) {
		const appearance = rowAppearances[index];
		const event = rowEvents[index];

		const connectedAppearance = appearance && !appearance.is_detached;

		// RESUME event AT the project
		// must happen before processing appearance which may be character's return.
		if (
			event &&
			event.event_position === "at" &&
			getContinuityEffect(event.event_type) === "resume" &&
			!isActive
		) {
			startSegment(index);
		}

		// A connected appearance starts or resumes the displayed continuity.
		if (connectedAppearance) {
			if (!isActive) {
				startSegment(index);
			}

			if (isActive) {
				lastConnectedAppearance = index;
			}
		}

		// END event AT the project
		// ends continuity at the centre of the cell.
		if (
			event &&
			event.event_position === "at" &&
			getContinuityEffect(event.event_type) === "end"
		) {
			endSegment(index);
		}

		// Events AFTER the project
		// occur at the right boundary (hence 0.5).
		if (
			event &&
			event.event_position === "after"
		) {
			const coordinate = index + 0.5;
			const effect = getContinuityEffect(event.event_type);

			if (
				effect === "end" &&
				isActive
			) {
				endSegment(coordinate);
			}

			if (
				effect === "resume" &&
				!isActive
			) {
				startSegment(coordinate);
			}
		}
	}

	// End open continuity at the latest connected appearance.
	if (
		isActive &&
		segmentStart !== null
	) {
		segments.push({
			start: segmentStart,
			end: lastConnectedAppearance ?? segmentStart
		});
	}

	return segments;
}