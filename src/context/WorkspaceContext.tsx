import { createContext, useContext } from "react";
import type { Franchise, FranchiseInput } from "../types/franchise";
import type { Universe, UniverseInput } from "../types/universe";

interface WorkspaceContextValue {
    franchises: Franchise[];
    universes: Universe[];
    selectedFranchiseId: number | null;
    selectedUniverseId: number | null;
    loading: boolean;
    savingWorkspace: boolean;
    error: string | null;

    setSelectedFranchiseId: (id: number) => void;
    setSelectedUniverseId: (id: number) => void;
    retryWorkspace: () => void;

    saveFranchise: (
        id: number | null,
        input: FranchiseInput
    ) => Promise<void>;

    saveUniverse: (
        id: number | null,
        input: UniverseInput
    ) => Promise<void>;

    removeFranchise: (id: number) => Promise<void>;
    removeUniverse: (id: number) => Promise<void>;
}

export const WorkspaceContext =
    createContext<WorkspaceContextValue | null>(null);

export function useWorkspace() {
    const context = useContext(WorkspaceContext);

    if (!context) throw new Error("useWorkspace must be used inside WorkspaceProvider");

    return context;
}