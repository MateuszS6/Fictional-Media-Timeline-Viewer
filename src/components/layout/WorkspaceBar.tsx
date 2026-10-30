import { Link, useNavigate } from "react-router";
import { useWorkspace } from "../../context/WorkspaceContext";
import type { WorkspaceView } from "../../types/workspace";
import { workspacePath } from "../../utils/workspacePath";

const views: { value: WorkspaceView; label: string }[] = [
	{ value: "timeline", label: "Timeline" },
	{ value: "characters", label: "Characters" },
	{ value: "projects", label: "Projects" }
];

export default function WorkspaceBar({
	activeView
}: {
	activeView: WorkspaceView;
}) {
	const navigate = useNavigate();

	const {
		franchises,
		universes,
		selectedFranchiseId,
		selectedUniverseId,
		canEdit,
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
				<Link
					className="workspace-link"
					to={workspacePath(canEdit)}
					aria-disabled={savingWorkspace}
					onClick={(event) => {
						if (savingWorkspace) event.preventDefault();
					}}
				>
					All franchises
				</Link>

				<span aria-hidden="true">/</span>

				{onUniversePage ? (
					<span aria-current="page">
						{franchise?.name}
					</span>
				) : (
					<Link
						className="workspace-link"
						to={workspacePath(canEdit, selectedFranchiseId)}
						aria-disabled={savingWorkspace}
						onClick={(event) => {
							if (savingWorkspace) event.preventDefault();
						}}
					>
						{franchise?.name}
					</Link>
				)}
			</nav>

			{!onUniversePage && availableUniverses.length > 1 && (
				<label className="workspace-switcher">
					<span>Universe</span>

					<select
						value={selectedUniverseId ?? ""}
						disabled={loading || savingWorkspace}
						onChange={(event) => {
							navigate(workspacePath(
								canEdit,
								selectedFranchiseId,
								Number(event.target.value),
								activeView
							))
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
						<Link
							key={view.value}
							className="workspace-tab"
							to={workspacePath(
								true,
								selectedFranchiseId,
								selectedUniverseId,
								view.value
							)}
							aria-current={
								activeView === view.value ? "page" : undefined
							}
							aria-disabled={loading || savingWorkspace}
							onClick={(event) => {
								if (loading || savingWorkspace) event.preventDefault();
							}}
						>
							{view.label}
						</Link>
					))}
				</nav>
			)}
		</div>
	);
}