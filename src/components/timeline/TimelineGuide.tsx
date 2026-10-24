import { useCallback, useRef, useState } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { APPEARANCE_OPTIONS, type AppearanceType } from "../../types/appearance";
import AppearanceEditor from "./AppearanceEditor";
import TimelineMarkers from "./TimelineMarkers";
import { CHARACTER_EVENT_OPTIONS } from "../../types/characterEvent";

const descriptions: Record<AppearanceType, string> = {
	standard: "An ordinary appearance in the project.",
	flashback: "An appearance depicting an earlier moment.",
	footage: "A recording or reused footage of the character.",
	depiction: "A statue, picture, photograph or similar representation.",
	vision: "An appearance in a vision.",
	afterlife: "An appearance in an afterlife.",
	non_chronological: "An appearance outside this project's place in the chronology."
};

export default function TimelineGuide() {
	const { canEdit } = useWorkspace();
	const [open, setOpen] = useState(false);
	const anchorRef = useRef<HTMLDivElement>(null);
	const close = useCallback(() => setOpen(false), []);

	return (
		<div className="timeline-tools">
			<p>
				{canEdit
					? "Click a cell to add/remove an appearance. Right-click for types and events."
					: "Read projects from left to right. Select a marker for details."}
			</p>

			<div ref={anchorRef}>
				<button
					type="button"
					className="utility-button"
					aria-haspopup="dialog"
					aria-expanded={open}
					onClick={() => setOpen((current) => !current)}
				>
					Legend & help
				</button>
			</div>

			{open && (
				<AppearanceEditor
					anchorRef={anchorRef}
					onClose={close}
					label="Timeline legend and help"
					className="timeline-legend-popup"
				>
					<div className="legend-heading">
						<h2>Reading the timeline</h2>
						<button type="button" onClick={close}>
							Close
						</button>
					</div>

					<p className="legend-copy">
						Each row follows a character. Projects run from left to right
						in this universe's chronology, not release order.
					</p>

					<h3>Appearances</h3>

					<ul className="legend-list">
						{APPEARANCE_OPTIONS.map((option) => (
							<li key={option.value}>
								<span
									className="legend-sample"
									aria-hidden="true"
								>
									<TimelineMarkers appearance={{
										appearance_type: option.value,
										is_detached: false
									}} />
								</span>

								<span>
									<strong>{option.label}</strong>
									<span className="legend-description">
										{descriptions[option.value]}
									</span>
								</span>
							</li>
						))}
					</ul>

					<h3>Events</h3>

					<ul className="legend-list">
						{CHARACTER_EVENT_OPTIONS.map((option) => (
							<li key={option.value}>
								<span
									className="legend-sample"
									aria-hidden="true"
								>
									<TimelineMarkers characterEvent={{
										event_type: option.value,
										event_position: "at"
									}} />
								</span>

								<span>{option.label}</span>
							</li>
						))}
					</ul>

					<h3>Lines and positions</h3>

					<ul className="legend-list">
						<li>
							<span className="legend-sample" aria-hidden="true">
								<span className="timeline-line timeline-line-right" />
								<TimelineMarkers
									isFirstConnected
									appearance={{
										appearance_type: "standard",
										is_detached: false
									}}
								/>
							</span>
							<span>Arrow: first connected appearance.</span>
						</li>

						<li>
							<span className="legend-sample" aria-hidden="true">
								<TimelineMarkers appearance={{
									appearance_type: "standard",
									is_detached: true
								}} />
							</span>
							<span>Faded: detached; does not start or extend a lifeline.</span>
						</li>

						<li>
							<span className="legend-sample" aria-hidden="true">
								<TimelineMarkers
									appearance={{
										appearance_type: "standard",
										is_detached: false
									}}
									characterEvent={{
										event_type: "death",
										event_position: "at"
									}}
								/>
							</span>
							<span>Inside a dot: an event at a connected standard appearance.</span>
						</li>

						<li>
							<span className="legend-sample" aria-hidden="true">
								<span className="timeline-line timeline-line-left" />
								<span className="timeline-line timeline-line-right" />
								<TimelineMarkers characterEvent={{
									event_type: "unknown",
									event_position: "after"
								}} />
							</span>
							<span>Boundary marker: an event after this project, and before the next project.</span>
						</li>
					</ul>

					<p className="legend-copy">
						Other appearance/event combinations keep both symbols.
						Lines show recorded continuity; a line ending alone
						does not mean the character died.
					</p>

					<p className="legend-copy">
						A label beside a visiting character names their origin.
						Select it to visit that timeline when available.
					</p>

					<p className="legend-copy">
						Scroll sideways for more projects. In Viewer, use Tab to focus entries,
						Enter or Space to open details, and Escape to close. You can also tap an entry.
					</p>
				</AppearanceEditor>
			)}
		</div>
	);
}