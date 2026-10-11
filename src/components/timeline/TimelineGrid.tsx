import { useEffect, useRef, useState } from "react";
import { createAppearance, deleteAppearance, getAppearancesForProjects, updateAppearance } from "../../services/appearances";
import { deleteCharacterEvent, getCharacterEventsForProjects, saveCharacterEvent } from "../../services/characterEvents";
import { getProjectsForUniverse } from "../../services/projects";
import { getTimelineCharacters } from "../../services/timelineCharacters";
import type { Appearance, AppearanceUpdate } from "../../types/appearance";
import type { Character } from "../../types/character";
import type { CharacterEvent, CharacterEventPosition, CharacterEventType } from "../../types/characterEvent";
import type { Project } from "../../types/project";
import CharacterRow from "./CharacterRow";
import TimelineHeader from "./TimelineHeader";

interface TimelineGridProps {
    universeId: number;
    focusedCharacterId: number | null;
    onOpenOrigin: (character: Character) => void;
}

export default function TimelineGrid({
    universeId,
    focusedCharacterId,
    onOpenOrigin
}: TimelineGridProps) {

    const [projects, setProjects] = useState<Project[]>([]);
    const [characters, setCharacters] = useState<Character[]>([]);
    const [appearances, setAppearances] = useState<Appearance[]>([]);
    const [characterEvents, setCharacterEvents] = useState<CharacterEvent[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [loadAttempt, setLoadAttempt] = useState(0);
    const [actionError, setActionError] = useState<string | null>(null);

    const [saving, setSaving] = useState(false);
    const savingRef = useRef(false);

    useEffect(() => {
        let cancelled = false;

        async function loadTimeline() {
            try {
                const projectsData = await getProjectsForUniverse(universeId);

                if (cancelled) return;

                const projectIds = projectsData.map((project) => project.id);

                const [
                    appearancesData,
                    characterEventsData,
                    charactersData
                ] = await Promise.all([
                    getAppearancesForProjects(projectIds),
                    getCharacterEventsForProjects(projectIds),
                    getTimelineCharacters(universeId, focusedCharacterId)
                ]);

                if (cancelled) return;

                setProjects(projectsData);
                setCharacters(charactersData);
                setAppearances(appearancesData);
                setCharacterEvents(characterEventsData);
                setError(null);
            } catch (error) {
                if (cancelled) return;

                console.error(error);
                setError("Could not load timeline.")
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void loadTimeline();

        return () => {
            cancelled = true;
        }
    }, [universeId, focusedCharacterId, loadAttempt]);

    function retryTimeline() {
        setError(null);
        setLoading(true);
        setLoadAttempt((current) => current + 1);
    }

    async function runTimelineChange(
        action: () => Promise<void>,
        failureMessage: string
    ) {
        if (savingRef.current) return;

        savingRef.current = true;
        setSaving(true);
        setActionError(null);

        try {
            await action();
        } catch (caughtError) {
            console.error(caughtError);
            setActionError(failureMessage);
        } finally {
            savingRef.current = false;
            setSaving(false);
        }
    }

    // Appearance handlers

    async function handleCreateAppearance(
        characterId: number,
        projectId: number
    ) {
        await runTimelineChange(async () => {
            const newAppearance = await createAppearance(
                characterId,
                projectId
            );

            setAppearances((current) => [
                ...current,
                newAppearance
            ]);
        }, "Could not add the appearance. Please try again.");
    }

    async function handleUpdateAppearance(
        characterId: number,
        projectId: number,
        updates: AppearanceUpdate
    ) {
        await runTimelineChange(async () => {
            const updatedAppearance = await updateAppearance(
                characterId,
                projectId,
                updates
            );

            setAppearances((current) =>
                current.map((appearance) =>
                    appearance.character_id === characterId &&
                        appearance.project_id === projectId
                        ? updatedAppearance
                        : appearance
                )
            );
        }, "Could not update the appearance. Please try again.");
    }

    async function handleDeleteAppearance(
        characterId: number,
        projectId: number
    ) {
        await runTimelineChange(async () => {
            await deleteAppearance(characterId, projectId);

            setAppearances((current) =>
                current.filter((appearance) =>
                    !(
                        appearance.character_id === characterId &&
                        appearance.project_id === projectId
                    )
                )
            );
        }, "Could not remove the appearance. Please try again.");
    }

    // Event handlers

    async function handleSaveCharacterEvent(
        characterId: number,
        projectId: number,
        eventType: CharacterEventType,
        eventPosition: CharacterEventPosition
    ) {
        await runTimelineChange(async () => {
            const savedEvent = await saveCharacterEvent(
                characterId,
                projectId,
                eventType,
                eventPosition
            );

            setCharacterEvents((current) => {
                const alreadyExists = current.some(
                    (event) =>
                        event.character_id === characterId &&
                        event.project_id === projectId
                );

                if (!alreadyExists) return [...current, savedEvent];

                return current.map((event) =>
                    event.character_id === characterId &&
                        event.project_id === projectId
                        ? savedEvent
                        : event
                );
            });
        }, "Could not save the event. Please try again.");
    }

    async function handleDeleteCharacterEvent(
        characterId: number,
        projectId: number
    ) {
        await runTimelineChange(async () => {
            await deleteCharacterEvent(characterId, projectId);

            setCharacterEvents((current) =>
                current.filter((event) =>
                    !(
                        event.character_id === characterId &&
                        event.project_id === projectId
                    )
                )
            );
        }, "Could not remove the event. Please try again.");
    }

    if (loading) {
        return (
            <p className="status-message" role="status">
                Loading timeline...
            </p>
        );
    }

    if (error) {
        return (
            <div className="status-message status-error" role="alert">
                <p>{error}</p>

                <button
                    type="button"
                    className="utility-button"
                    onClick={retryTimeline}
                >
                    Try again
                </button>
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <p className="status-message">
                No projects have been added to this universe. Open Projects to add one.
            </p>
        );
    }

    return (
        <>
            {actionError && (
                <div className="status-message status-error" role="alert">
                    <p>{actionError}</p>

                    <button
                        type="button"
                        className="utility-button"
                        onClick={() => setActionError(null)}
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {characters.length === 0 && (
                <p className="status-message">
                    No characters are shown on this timeline.
                    Open Characters and choose "Show on timeline".
                </p>
            )}

            <section
                className="timeline-container"
                aria-label="Character timeline"
                aria-busy={saving}
            >
                <div className="timeline-grid">
                    <TimelineHeader projects={projects} />

                    {characters.map((character) => (
                        <CharacterRow
                            key={character.id}
                            character={character}
                            projects={projects}
                            appearances={appearances}
                            characterEvents={characterEvents}
                            onCreateAppearance={handleCreateAppearance}
                            onUpdateAppearance={handleUpdateAppearance}
                            onDeleteAppearance={handleDeleteAppearance}
                            onSaveCharacterEvent={handleSaveCharacterEvent}
                            onDeleteCharacterEvent={handleDeleteCharacterEvent}
                            focused={character.id === focusedCharacterId}
                            saving={saving}
                            onOpenOrigin={onOpenOrigin}
                        />
                    ))}
                </div>
            </section>
        </>
    )
}