import { Route, Routes, useParams } from "react-router";
import App from "./App";
import StudioAccess from "./components/auth/StudioAccess";
import { WorkspaceProvider } from "./context/WorkspaceProvider";
import UnavailablePage from "./pages/UnavailablePage";
import type { WorkspaceView } from "./types/workspace";

function readId(value: string | undefined): number | null {
	if (value === undefined) return null;

	return /^[1-9]\d*$/.test(value) &&
		Number.isSafeInteger(Number(value))
		? Number(value)
		: NaN;
}

function WorkspaceRoute({
	view,
	canEdit
}: {
	view: WorkspaceView;
	canEdit: boolean;
}) {
	const params = useParams();

	const franchiseId = readId(params.franchiseId);
	const universeId = readId(params.universeId);

	if (
		Number.isNaN(franchiseId) ||
		Number.isNaN(universeId)
	) {
		return <UnavailablePage studio={canEdit} />;
	}

	return (
		<WorkspaceProvider
			key={
				(canEdit ? "studio" : "viewer") + ":" + (franchiseId ?? "all")
			}
			canEdit={canEdit}
			selectedFranchiseId={franchiseId}
			selectedUniverseId={universeId}
		>
			<App activeView={view} />
		</WorkspaceProvider>
	);
}

export default function AppRoutes() {
	return (
		<StudioAccess>
			{(canEdit) => {
				const root = canEdit ? "/studio" : "";
				const franchise = root + "/franchises/:franchiseId";
				const timeline = franchise + "/timelines/:universeId";

				return (
					<Routes>
						<Route
							path={root || "/"}
							element={
								<WorkspaceRoute
									view="franchises"
									canEdit={canEdit}
								/>
							}
						/>

						<Route
							path={franchise}
							element={
								<WorkspaceRoute
									view="universes"
									canEdit={canEdit}
								/>
							}
						/>

						<Route
							path={timeline}
							element={
								<WorkspaceRoute
									view="timeline"
									canEdit={canEdit}
								/>
							}
						/>

						{canEdit && (
							<>
								<Route
									path={timeline + "/characters"}
									element={
										<WorkspaceRoute
											view="characters"
											canEdit
										/>
									}
								/>

								<Route
									path={timeline + "/projects"}
									element={
										<WorkspaceRoute
											view="projects"
											canEdit
										/>
									}
								/>
							</>
						)}

						<Route
							path="*"
							element={
								<UnavailablePage studio={canEdit} />
							}
						/>
					</Routes>
				);
			}}
		</StudioAccess>
	);
}