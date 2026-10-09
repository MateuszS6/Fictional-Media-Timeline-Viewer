import { useEffect, useRef, useState } from "react";
import type { Character, CharacterInput } from "../types/character";
import { createCharacter, deleteCharacter, getCharactersForUniverses, updateCharacter } from "../services/characters";
import { useWorkspace } from "../context/WorkspaceContext";
import CharacterForm from "../components/characters/CharacterForm";
import { getTimelineCharactersIds, hideCharacterFromTimeline, showCharacterOnTimeline } from "../services/timelineCharacters";
import { formatUniverseLabel } from "../utils/formatUniverseLabel";

interface CharactersPageProps {
    universeId: number;
}

function sortCharacters(characters: Character[]): Character[] {
    return [...characters].sort(
        (first, second) =>
            first.alias.localeCompare(second.alias) ||
            first.id - second.id
    );
}

export default function CharactersPage({
    universeId
}: CharactersPageProps) {
    const { universes } = useWorkspace();

    const [characters, setCharacters] = useState<Character[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loadAttempt, setLoadAttempt] = useState(0);

    const [editor, setEditor] = useState<Character | "new" | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    const [timelineCharacterIds, setTimelineCharacterIds] = useState<number[]>([]);
    const [changingCharacterId, setChangingCharacterId] = useState<number | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const [includeOtherUniverses, setIncludeOtherUniverses] = useState(false);

    const changingRef = useRef(false);
    const controlsDisabled = editor !== null || changingCharacterId !== null;

    const visibleCharacters = characters.filter((character) =>
        includeOtherUniverses ||
        character.origin_universe_id === universeId ||
        timelineCharacterIds.includes(character.id)
    );

    useEffect(() => {
        let cancelled = false;

        async function loadCharacters() {
            try {
                const [data, selectedIds] = await Promise.all([
                    getCharactersForUniverses(
                        universes.map((universe) => universe.id)
                    ),
                    getTimelineCharactersIds(universeId)
                ]);

                if (cancelled) return;

                setCharacters(sortCharacters(data));
                setTimelineCharacterIds(selectedIds);

            } catch (caughtError) {

                if (cancelled) return;

                console.error(caughtError);
                setError("Could not load characters.")

            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void loadCharacters();

        return () => {
            cancelled = true;
        }
    }, [universeId, universes, loadAttempt])

    function retry() {
        setError(null);
        setLoading(true);
        setLoadAttempt((current) => current + 1);
    }

    function openEditor(value: Character | "new") {
        setNotice(null);
        setActionError(null);
        setEditor(value);
    }

    async function handleTimelineToggle(character: Character) {
        if (changingRef.current) return;

        const isShown = timelineCharacterIds.includes(character.id);

        changingRef.current = true;
        setChangingCharacterId(character.id);
        setActionError(null);
        setNotice(null);

        try {
            if (isShown) {
                await hideCharacterFromTimeline(universeId, character.id);

                setTimelineCharacterIds((current: number[]) =>
                    current.filter((id) => id !== character.id)
                );

                setNotice(
                    `${character.alias} hidden from this timeline. ` +
                    "Their appearances and events are still saved."
                );
            } else {
                await showCharacterOnTimeline(universeId, character.id);

                setTimelineCharacterIds((current: number[]) =>
                    current.includes(character.id)
                        ? current
                        : [...current, character.id]
                );

                setNotice(
                    `${character.alias} shown on this timeline. ` +
                    "Open Timeline to edit their appearances and events."
                );
            }
        } catch (caughtError) {
            console.error(caughtError);
            setActionError("Could not change timeline visibility. Please try again.")
        } finally {
            changingRef.current = false;
            setChangingCharacterId(null);
        }
    }

    async function handleSave(input: CharacterInput): Promise<void> {
        if (editor === null) {
            throw new Error("No character editor is open.")
        }

        const savedCharacter =
            editor === "new"
                ? await createCharacter(input)
                : await updateCharacter(editor.id, input);

        setCharacters((current) => {
            const remaining = current.filter(
                (character) => character.id !== savedCharacter.id
            );

            return sortCharacters([...remaining, savedCharacter]);
        });

        setNotice(savedCharacter.alias + " saved.");
        setEditor(null);
    }

    async function handleDeleteCharacter(character: Character) {
        if (changingRef.current || editor !== null) return;

        const confirmed = window.confirm(
            `Permanently delete "${character.alias}"?\n\n` +
            "This also deletes all their appearances, events, and timeline " +
            "selections across every universe. \n\n" +
            "This cannot be undone."
        )

        if (!confirmed) return;

        changingRef.current = true;
        setChangingCharacterId(character.id);
        setActionError(null);
        setNotice(null);

        try {
            await deleteCharacter(character.id);

            setCharacters((current) =>
                current.filter((item) => item.id !== character.id)
            );

            setTimelineCharacterIds((current) =>
                current.filter((id) => id !== character.id)
            );

            setNotice(`${character.alias} deleted.`)
        } catch (caughtError) {
            console.error(caughtError);
            setActionError("Could not delete the character. Please try again.");
        } finally {
            changingRef.current = false;
            setChangingCharacterId(null);
        }
    }

    if (loading) {
        return (
            <p className="status-message" role="status">
                Loading characters...
            </p>
        )
    }

    if (error) {
        return (
            <div className="status-message status-error" role="alert">
                <p>{error}</p>

                <button
                    type="button"
                    className="utility-button"
                    onClick={retry}
                >
                    Try again
                </button>
            </div>
        );
    }

    return (
        <section className="management-page" aria-label="Characters">
            <div className="management-toolbar">
                <p className="management-summary">
                    {visibleCharacters.length}{" "}
                    {visibleCharacters.length === 1 ? "character" : "characters"}
                </p>

                <button
                    type="button"
                    className="utility-button"
                    disabled={controlsDisabled}
                    onClick={() => openEditor("new")}
                >
                    Add character
                </button>
            </div>

            {notice && (
                <p className="management-notice" role="status">
                    {notice}
                </p>
            )}

            {actionError && (
                <p className="form-error" role="alert">
                    {actionError}
                </p>
            )}

            {editor !== null && (
                <CharacterForm
                    key={editor === "new" ? "new" : editor.id}
                    character={editor === "new" ? null : editor}
                    defaultUniverseId={universeId}
                    universes={universes}
                    onSave={handleSave}
                    onCancel={() => setEditor(null)}
                />
            )}

            <label className="management-summary">
                <input
                    type="checkbox"
                    checked={includeOtherUniverses}
                    disabled={controlsDisabled}
                    onChange={(event) => setIncludeOtherUniverses(event.target.checked)}
                />
                {" Include other characters in this franchise."}
            </label>

            {visibleCharacters.length === 0 ? (
                <p className="status-message">
                    No characters match this view. Include other universes to find more.
                </p>
            ) : (
                <div className="management-table-container">
                    <table className="management-table">
                        <thead>
                            <tr>
                                <th scope="col">Character</th>
                                <th scope="col">Real name</th>
                                <th scope="col">Origin universe</th>
                                <th scope="col">Timeline</th>
                                <th scope="col">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {visibleCharacters.map((character) => {
                                const isShown = timelineCharacterIds.includes(character.id);
                                const isChanging = changingCharacterId === character.id;

                                return (
                                    <tr key={character.id}>
                                        <td>{character.alias}</td>
                                        <td>{character.real_name ?? "?"}</td>
                                        <td>
                                            {formatUniverseLabel(character.origin_universe_id, universes)}
                                        </td>
                                        <td>{isShown ? "Shown" : "Hidden"}</td>

                                        <td>
                                            <div className="management-row-actions">
                                                <button
                                                    type="button"
                                                    className="utility-button"
                                                    disabled={controlsDisabled}
                                                    aria-label={`Edit ${character.alias}`}
                                                    onClick={() => openEditor(character)}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    className="utility-button"
                                                    disabled={controlsDisabled}
                                                    onClick={() => handleTimelineToggle(character)}
                                                >
                                                    {isChanging
                                                        ? "Saving..."
                                                        : isShown
                                                            ? "Hide from timeline"
                                                            : "Show on timeline"}
                                                </button>

                                                <button
                                                    type="button"
                                                    className="utility-button utility-button-danger"
                                                    disabled={controlsDisabled}
                                                    aria-label={`Delete ${character.alias}`}
                                                    onClick={() => handleDeleteCharacter(character)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}