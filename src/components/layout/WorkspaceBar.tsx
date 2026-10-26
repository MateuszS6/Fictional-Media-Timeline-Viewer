import { useWorkspace } from "../../context/WorkspaceContext";
import type { WorkspaceView } from "../../types/workspace";

interface WorkspaceBarProps {
	activeView: WorkspaceView;
	onWorkspaceChange: () => void;
	onViewChange: (view: WorkspaceView) => void;
}

const views: { value: WorkspaceView; label: string }[] = [
	{ value: "timeline", label: "Timeline" },
	{ value: "characters", label: "Characters" },
	{ value: "projects", label: "Projects" },
	{ value: "workspaces", label: "Franchises & universes" }
];

export default function WorkspaceBar({
	activeView,
	onWorkspaceChange,
	onViewChange
}: WorkspaceBarProps) {
	const {
		franchises,
		universes,
		selectedFranchiseId,
		selectedUniverseId,
		canEdit,
		setSelectedFranchiseId,
		setSelectedUniverseId,
		loading,
		savingWorkspace
	} = useWorkspace();

	const selectableUniverses = universes.filter(
		(universe) => canEdit || universe.is_published
	);

	return (
		<aside className="workspace-bar">
			<div className="workspace-selectors">
				<label>
					<span>Franchise</span>

					<select
						value={selectedFranchiseId ?? ""}
						disabled={
							loading ||
							savingWorkspace ||
							franchises.length === 0
						}
						onChange={(event) => {
							onWorkspaceChange();
							setSelectedFranchiseId(Number(event.target.value))
						}}
					>
						{franchises.length === 0 && (
							<option value="" disabled>
								{loading ? "Loading..." : "No franchises"}
							</option>
						)}

						{franchises.map((franchise) => (
							<option key={franchise.id} value={franchise.id}>
								{franchise.name}
							</option>
						))}
					</select>
				</label>

				{activeView !== "workspaces" && (
					<label>
						<span>Universe</span>

						<select
							value={selectedUniverseId ?? ""}
							disabled={
								loading ||
								savingWorkspace ||
								selectableUniverses.length === 0
							}
							onChange={(event) => {
								onWorkspaceChange();
								setSelectedUniverseId(Number(event.target.value))
							}}
						>
							{selectableUniverses.length === 0 && (
								<option value="" disabled>
									{loading ? "Loading..." : "No universes"}
								</option>
							)}

							{selectableUniverses.map((universe) => (
								<option key={universe.id} value={universe.id} >
									{universe.name}
								</option>
							))}
						</select>
					</label>
				)}
			</div>

			{canEdit && (
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
		</aside>
	)
}