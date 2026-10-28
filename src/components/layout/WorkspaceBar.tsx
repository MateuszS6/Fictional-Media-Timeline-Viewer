import { useWorkspace } from "../../context/WorkspaceContext";
import type { WorkspaceView } from "../../types/workspace";

interface WorkspaceBarProps {
	activeView: WorkspaceView;
	onViewChange: (view: WorkspaceView) => void;
	onWorkspaceChange: () => void;
}

const views: { value: WorkspaceView; label: string }[] = [
	{ value: "timeline", label: "Timeline" },
	{ value: "characters", label: "Characters" },
	{ value: "projects", label: "Projects" }
];

export default function WorkspaceBar({
	activeView,
	onViewChange,
	onWorkspaceChange
}: WorkspaceBarProps) {
	const {
		franchises,
		universes,
		selectedFranchiseId,
		selectedUniverseId,
		canEdit,
		setSelectedUniverseId,
		loading,
		savingWorkspace
	} = useWorkspace();

	const franchise = franchises.find(
		(item) => item.id === selectedFranchiseId
	);

	const availableUniverses = universes.filter(
		(universe) => canEdit || universe.is_published
	);

	const onUniversePage = activeView === "universes";

	if (activeView === "franchises") return null;

	return (
		<div className="workspace-bar">
			<nav
				className="workspace-breadcrumbs"
				aria-label="Browse timelines"
			>
				<button
					type="button"
					className="workspace-link"
					disabled={savingWorkspace}
					onClick={() => onViewChange("franchises")}
				>
					All franchises
				</button>

				<span aria-hidden="true">/</span>

				{onUniversePage ? (
					<span aria-current="page">
						{franchise?.name}
					</span>
				) : (
					<button
						type="button"
						className="workspace-link"
						disabled={savingWorkspace}
						onClick={() => onViewChange("universes")}
					>
						{franchise?.name}
					</button>
				)}
			</nav>

			{!onUniversePage && availableUniverses.length > 1 && (
				<label className="workspace-switcher">
					<span>Universe</span>

					<select
						value={selectedUniverseId ?? ""}
						disabled={loading || savingWorkspace}
						onChange={(event) => {
							onWorkspaceChange();
							setSelectedUniverseId(Number(event.target.value));
						}}
					>
						{availableUniverses.map((universe) => (
							<option key={universe.id} value={universe.id}>
								{!universe.is_published ? "🔒︎ Private — " : ""}
								{universe.name}
								{universe.code
									? " (" + universe.code + ")"
									: ""}
							</option>
						))}
					</select>
				</label>
			)}

			{canEdit && !onUniversePage && selectedUniverseId !== null && (
				<nav className="workspace-nav" aria-label="Studio pages">
					{views.map((view) => (
						<button
							key={view.value}
							type="button"
							className="workspace-tab"
							aria-current={
								activeView === view.value ? "page" : undefined
							}
							disabled={savingWorkspace}
							onClick={() => onViewChange(view.value)}
						>
							{view.label}
						</button>
					))}
				</nav>
			)}
		</div>
	)
}