import { useRef, useState, type SubmitEvent } from "react";

export interface WorkspaceFormValues {
    name: string;
    code: string | null;
}

interface WorkspaceFormProps {
    kind: "franchise" | "universe";
    initialValues: WorkspaceFormValues;
    editing: boolean;
    saving: boolean;
    onSave: (values: WorkspaceFormValues) => void;
    onCancel: () => void;
}

export default function WorkspaceForm({
    kind,
    initialValues,
    editing,
    saving,
    onSave,
    onCancel
}: WorkspaceFormProps) {
    const [name, setName] = useState(initialValues.name);
    const [code, setCode] = useState(initialValues.code ?? "");
    const [error, setError] = useState<string | null>(null);
    const submittingRef = useRef(false);

    async function handleSubmit(
        event: SubmitEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (submittingRef.current || saving) return;

        const trimmedName = name.trim();

        if (!trimmedName) {
            setError("Enter a name.");
            return;
        }

        submittingRef.current = true;
        setError(null);

        try {
            await onSave({
                name: trimmedName,
                code: kind === "universe"
                    ? code.trim() || null
                    : null
            });
        } catch (caughtError) {
            console.error(caughtError);

            const duplicate =
                typeof caughtError === "object" &&
                caughtError !== null &&
                "code" in caughtError &&
                caughtError.code === "23505";

            setError(
                duplicate
                    ? "A " + kind + " with these details already exists."
                    : "Could not save. Your entries have been kept."
            );
        } finally {
            submittingRef.current = false;
        }
    }

    return (
        <form
            className="management-form"
            aria-labelledby="workspace-form-heading"
            aria-busy={saving}
            onSubmit={handleSubmit}
        >
            <h2 id="workspace-form-heading">
                {editing ? "Edit " : "Add "}{kind}
            </h2>

            {error && (
                <p className="form-error" role="alert">
                    {error}
                </p>
            )}

            <fieldset disabled={saving}>
                <div className="form-fields">
                    <label className="form-field">
                        <span>Name</span>
                        <input
                            value={name}
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                            required
                            autoFocus
                        />
                    </label>

                    {kind === "universe" && (
                        <label className="form-field">
                            <span>Code (optional)</span>
                            <input
                                value={code}
                                onChange={(event) =>
                                    setCode(event.target.value)
                                }
                            />
                        </label>
                    )}
                </div>

                <div className="form-actions">
                    <button
                        type="submit"
                        className="utility-button"
                    >
                        {saving
                            ? "Saving..."
                            : editing
                                ? "Save changes"
                                : "Add " + kind}
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