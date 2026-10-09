import { useRef, useState, type SubmitEvent } from "react";
import type { Project, ProjectInput } from "../../types/project";
import type { Universe } from "../../types/universe";

interface ProjectFormProps {
    project: Project | null;
    universeId: number;
    universes: Universe[];
    initialPosition: number;
    maxPosition: number;
    onSave: (input: ProjectInput, position: number) => Promise<void>;
    onCancel: () => void;
}

export default function ProjectForm({
    project,
    universeId,
    universes,
    initialPosition,
    maxPosition,
    onSave,
    onCancel
}: ProjectFormProps) {
    const [title, setTitle] = useState(project?.title ?? "");
    const [releaseDate, setReleaseDate] = useState(project?.release_date ?? "");

    const [primaryUniverseId, setPrimaryUniverseId] = useState<number>(
        project?.primary_universe_id ?? universeId
    );

    const [position, setPosition] = useState(String(initialPosition));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const savingRef = useRef(false);

    const originalPrimaryId = project?.primary_universe_id;

    const hasOutsidePrimary =
        originalPrimaryId != null &&
        !universes.some((universe) => universe.id === originalPrimaryId);

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        if (savingRef.current) return;

        const trimmedTitle = title.trim();
        const nextPosition = Number(position);

        if (!trimmedTitle) {
            setError("Enter a project title.");
            return;
        }

        if (
            !Number.isInteger(nextPosition) ||
            nextPosition < 1 ||
            nextPosition > maxPosition
        ) {
            setError(`Choose a position between 1 and ${maxPosition}`);
            return;
        }

        if (
            !universes.some((universe) => universe.id === primaryUniverseId) &&
            primaryUniverseId !== originalPrimaryId
        ) {
            setError("Choose a primary universe.")
            return;
        }

        savingRef.current = true;
        setSaving(true);
        setError(null);

        try {
            await onSave(
                {
                    title: trimmedTitle,
                    release_date: releaseDate || null,
                    primary_universe_id: primaryUniverseId
                },
                nextPosition
            );
        } catch (caughtError) {
            console.error(caughtError);

            const duplicate =
                typeof caughtError === "object" &&
                caughtError !== null &&
                "code" in caughtError &&
                caughtError.code === "23505";

            setError(
                duplicate
                    ? "A project with this title may already exist."
                    : "Could not save the project. Your entries have been kept."
            );
        } finally {
            savingRef.current = false;
            setSaving(false);
        }
    }

    return (
        <form
            className="management-form"
            aria-labelledby="project-form-heading"
            aria-busy={saving}
            onSubmit={handleSubmit}
        >
            <h2 id="project-form-heading">
                {project ? "Edit project" : "Add project"}
            </h2>

            {error && (
                <p className="form-error" role="alert">
                    {error}
                </p>
            )}

            <fieldset disabled={saving}>
                <div className="form-fields">
                    <label className="form-field">
                        <span>Title</span>
                        <input
                            type="text"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            required
                            autoFocus
                        />
                    </label>

                    <label className="form-field">
                        <span>Release date (optional)</span>
                        <input
                            type="date"
                            value={releaseDate}
                            onChange={(event) => setReleaseDate(event.target.value)}
                        />
                    </label>

                    <label className="form-field">
                        <span>Primary universe</span>
                        <select
                            value={primaryUniverseId ?? ""}
                            onChange={(event) =>
                                setPrimaryUniverseId(Number(event.target.value))
                            }
                            required
                        >
                            {hasOutsidePrimary && (
                                <option value={originalPrimaryId}>
                                    Keep existing universe outside this franchise
                                </option>
                            )}

                            {universes.map((universe) => (
                                <option key={universe.id} value={universe.id}>
                                    {universe.name}
                                </option>
                            ))}
                        </select>
                        <small>
                            Changing this does not move the project to a different chronology.
                        </small>
                    </label>

                    <label className="form-field">
                        <span>Position in this timeline</span>
                        <input
                            type="number"
                            min={1}
                            max={maxPosition}
                            step={1}
                            value={position}
                            onChange={(event) => setPosition(event.target.value)}
                            required
                        />
                        <small>
                            1 is the beginning; {maxPosition} is the end.
                            Other projects shift automatically.
                        </small>
                    </label>
                </div>

                {project && (
                    <p className="status-message">
                        Project details are shared across universes.
                        Position changes apply only to this timeline.
                    </p>
                )}

                <div className="form-actions">
                    <button type="submit" className="utility-button">
                        {saving
                            ? "Saving..."
                            : project
                                ? "Save changes"
                                : "Add project"}
                    </button>

                    <button
                        type="button"
                        className="utility-button"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                </div>
            </fieldset>
        </form>
    );
}