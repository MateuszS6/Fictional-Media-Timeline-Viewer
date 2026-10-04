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
    children
}: {
    children: ReactNode;
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
                const data = await getFranchises();

                if (cancelled) return;

                const firstFranchiseId = data[0]?.id ?? null;

                setFranchises(data);
                setSelectedFranchiseId(firstFranchiseId);
                setUniversesLoading(firstFranchiseId !== null);
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
    }, [loadAttempt])

    useEffect(() => {
        if (selectedFranchiseId === null) return;

        const franchiseId = selectedFranchiseId;
        let cancelled = false;

        async function loadUniverses() {
            try {
                const data = await getUniversesByFranchise(franchiseId);

                if (cancelled) return;

                setUniverses(data);
                setSelectedUniverseId(data[0]?.id ?? null);
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
    }, [selectedFranchiseId]);

    function activateFranchise(id: number | null) {
        setSelectedFranchiseId(id);
        setUniverses([]);
        setSelectedUniverseId(null);
        setUniversesError(null);
        setUniversesLoading(id !== null);
    }

    function selectFranchise(id: number) {
        if (savingRef.current || id === selectedFranchiseId) return;

        activateFranchise(id);
    }

    function selectUniverse(id: number) {
        if (savingRef.current) return;

        setSelectedUniverseId(id);
    }

    function retryWorkspace() {
        if (savingRef.current) return;

        setFranchises([]);
        activateFranchise(null);
        setFranchisesError(null);
        setFranchisesLoading(true);
        setLoadAttempt((current) => current + 1);
    }

    async function runWorkspaceAction(
        action: () => Promise<void>
    ) {
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

            if (id === null) activateFranchise(saved.id);
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
                activateFranchise(remaining[0]?.id ?? null);
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
