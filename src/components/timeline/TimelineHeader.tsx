import type { Project } from "../../types/project";

interface TimelineHeaderProps {
	projects: Project[];
}

export default function TimelineHeader({
	projects
}: TimelineHeaderProps) {
	return (
		<div className="timeline-row timeline-header">
			<div className="character-column timeline-corner">
				Character
			</div>

			{projects.map((project) => (
				<div
					key={project.id}
					className="project-column"
					title={project.title}
				>
					<span>{project.title}</span>
				</div>
			))}
		</div>
	)
}