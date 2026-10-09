import type { Universe } from "../types/universe";

export function formatUniverseLabel(
    universeId: number,
    universes: Universe[]
): string {
    const universe = universes.find((item) => item.id === universeId);

    if (!universe) return "Universe #" + universeId;

    return universe.code
        ? universe.name + " (" + universe.code + ")"
        : universe.name;
}