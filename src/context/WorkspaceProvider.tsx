import { useEffect, useRef, useState, type ReactNode } from "react";
import { createFranchise, deleteFranchise, getFranchises, updateFranchise } from "../services/franchises";
import { createUniverse, deleteUniverse, getUniversesByFranchise, updateUniverse } from "../services/universes";
import type { Franchise, FranchiseInput } from "../types/franchise";
import type { Universe, UniverseInput } from "../types/universe";
import { WorkspaceContext } from "./WorkspaceContext";

function sortFranchises(items: Franchise[]): Franchise[] {
	return [...items].sort((a, b) =>
		a.name.localeCompare(b.name) || a.id - b.id
	);
}

function sortUniverses(items: Universe[]): Universe[] {
	return [...items].sort((a, b) => {
		if (a.code === null && b.code !== null) return 1;
		if (a.code !== null && b.code === null) return -1;

		return (a.code ?? "").localeCompare(b.code ?? "") ||
			a.name.localeCompare(b.name) ||
			a.id - b.id;
	});
}

export function WorkspaceProvider({
	children,
	canEdit
}: {
	children: ReactNode;
	canEdit: boolean;
}) {
	const [franchises, setFranchises] = useState<Franchise[]>([]);
	const [universes, setUniverses] = useState<Universe[]>([]);

	const [selectedFranchiseId, setSelectedFranchiseId] = useState<number | null>(null);
	const [selectedUniverseId, setSelectedUniverseId] = useState<number | null>(null);

	const [franchisesLoading, setFranchisesLoading] = useState(true);
	const [universesLoading, setUniversesLoading] = useState(false);

	const [franchisesError, setFranchisesError] = useState<string | null>(null);
	const [universesError, setUniversesError] = useState<string | null>(null);

	const [loadAttempt, setLoadAttempt] = useState(0);
	const [savingWorkspace, setSavingWorkspace] = useState(false);
	const savingRef = useRef(false);

	useEffect(() => {
		let cancelled = false;

		async function loadFranchises() {
			try {
				const data = sortFranchises(await getFranchises(!canEdit));

				if (cancelled) return;

				setFranchises(data);
			} catch (error) {
				if (cancelled) return;

				console.error(error);
				setFranchisesError("Could not load franchises.");
			} finally {
				if (!cancelled) setFranchisesLoading(false);
			}
		}

		void loadFranchises();

		return () => {
			cancelled = true;
		};
	}, [loadAttempt, canEdit])

	useEffect(() => {
		if (selectedFranchiseId === null) return;

		const franchiseId = selectedFranchiseId;
		let cancelled = false;

		async function loadUniverses() {
			try {
				const data = sortUniverses(await getUniversesByFranchise(franchiseId));

				if (cancelled) return;

				setUniverses(data);
				setSelectedUniverseId(
					data.find((universe) =>
						canEdit || universe.is_published
					)?.id ?? null
				);
			} catch (error) {
				if (cancelled) return;

				console.error(error);
				setUniversesError("Could not load universes.");
			} finally {
				if (!cancelled) setUniversesLoading(false);
			}
		}

		void loadUniverses();

		return () => {
			cancelled = true;
		}
	}, [selectedFranchiseId, canEdit, loadAttempt]);

	function activateFranchise(id: number | null) {
		setSelectedFranchiseId(id);
		setUniverses([]);
		setSelectedUniverseId(null);
		setUniversesError(null);
		setUniversesLoading(id !== null);
	}

	function selectFranchise(id: number | null) {
		if (savingRef.current || id === selectedFranchiseId) return;

		activateFranchise(id);
	}

	function selectUniverse(id: number) {
		if (savingRef.current) return;

		const available = universes.some((universe) =>
			universe.id === id &&
			(canEdit || universe.is_published)
		);

		if (available) setSelectedUniverseId(id);
	}

	function retryWorkspace() {
		if (savingRef.current) return;

		setFranchisesError(null);
		setUniversesError(null);
		setFranchisesLoading(true);
		setUniversesLoading(selectedFranchiseId !== null);
		setLoadAttempt((current) => current + 1);
	}

	async function runWorkspaceAction(
		action: () => Promise<void>
	) {
		if (!canEdit) {
			throw new Error("Studio access is required.")
		}

		if (savingRef.current) {
			throw new Error("A workspace change is already being saved.");
		}

		savingRef.current = true;
		setSavingWorkspace(true);

		try {
			await action();
		} finally {
			savingRef.current = false;
			setSavingWorkspace(false);
		}
	}

	async function saveFranchise(
		id: number | null,
		input: FranchiseInput
	) {
		await runWorkspaceAction(async () => {
			const saved = id === null
				? await createFranchise(input)
				: await updateFranchise(id, input);

			setFranchises((current) => sortFranchises([
				...current.filter((item) => item.id !== saved.id),
				saved
			]));
		});
	}

	async function saveUniverse(
		id: number | null,
		input: UniverseInput
	) {
		const franchiseId = selectedFranchiseId;

		if (franchiseId === null) {
			throw new Error("Select a franchise first.");
		}

		await runWorkspaceAction(async () => {
			const saved = id === null
				? await createUniverse(franchiseId, input)
				: await updateUniverse(id, input);

			setUniverses((current) => sortUniverses([
				...current.filter((item) => item.id !== saved.id),
				saved
			]));

			if (id === null) setSelectedUniverseId(saved.id);
		});
	}

	async function removeFranchise(id: number) {
		await runWorkspaceAction(async () => {
			await deleteFranchise(id);

			const remaining = franchises.filter(
				(item) => item.id !== id
			);

			setFranchises(remaining);

			if (selectedFranchiseId === id) {
				activateFranchise(null);
			}
		});
	}

	async function removeUniverse(id: number) {
		await runWorkspaceAction(async () => {
			await deleteUniverse(id);

			const remaining = universes.filter(
				(item) => item.id !== id
			);

			setUniverses(remaining);

			if (selectedUniverseId === id) {
				setSelectedUniverseId(remaining[0]?.id ?? null);
			}
		});
	}

	return (
		<WorkspaceContext.Provider
			value={{
				franchises,
				universes,
				selectedFranchiseId,
				selectedUniverseId,
				canEdit,
				loading: franchisesLoading || universesLoading,
				savingWorkspace,
				error: franchisesError || universesError,
				setSelectedFranchiseId: selectFranchise,
				setSelectedUniverseId: selectUniverse,
				retryWorkspace,
				saveFranchise,
				saveUniverse,
				removeFranchise,
				removeUniverse
			}}
		>
			{children}
		</WorkspaceContext.Provider>
	);
}
