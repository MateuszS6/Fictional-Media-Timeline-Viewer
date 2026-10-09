import { useState } from "react";
import { useWorkspace } from "../context/WorkspaceContext";
import type { Franchise } from "../types/franchise";
import type { Universe } from "../types/universe";
import type { WorkspaceFormValues } from "../components/workspaces/WorkspaceForm";
import WorkspaceForm from "../components/workspaces/WorkspaceForm";

type Editor =
    | { kind: "franchise"; record: Franchise | null; }
    | { kind: "universe"; record: Universe | null; };

export default function WorkspacesPage() {
    const {
        franchises,
        universes,
        selectedFranchiseId,
        savingWorkspace,
        saveFranchise,
        saveUniverse,
        removeFranchise,
        removeUniverse
    } = useWorkspace();

    const franchise = franchises.find(
        (item) => item.id === selectedFranchiseId
    );

    const [editor, setEditor] = useState<Editor | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const controlsDisabled = savingWorkspace || editor !== null;

    function openEditor(next: Editor) {
        setNotice(null);
        setActionError(null);
        setEditor(next);
    }

    async function handleSave(values: WorkspaceFormValues) {
        if (!editor) throw new Error("No editor is open.");

        const id = editor.record?.id ?? null;

        if (editor.kind === "franchise") {
            await saveFranchise(id, { name: values.name });
        } else {
            await saveUniverse(id, values);
        }

        setNotice(values.name + " saved.");
        setEditor(null);
    }

    async function handleDelete(
        kind: "franchise" | "universe",
        record: Franchise | Universe
    ) {
        if (controlsDisabled) return;

        const details = kind === "franchise"
            ? "This franchise must have no universes before it can be deleted."
            : "This universe can only be deleted when no characters, projects " +
            "or timeline memberships reference it. Move or remove those " +
            "references first.";

        const confirmed = window.confirm(
            'Permanently delete "' + record.name + '"?\n\n' +
            details + "\n\nThis cannot be undone."
        );

        if (!confirmed) return;

        setNotice(null);
        setActionError(null);

        try {
            if (kind === "franchise") {
                await removeFranchise(record.id);
            } else {
                await removeUniverse(record.id);
            }

            setNotice(record.name + " deleted.");
        } catch (caughtError) {
            console.error(caughtError);

            const hasReferences =
                typeof caughtError === "object" &&
                caughtError !== null &&
                "code" in caughtError &&
                caughtError.code === "23503";

            setActionError(
                hasReferences
                    ? "This " + kind + " still has linked records and cannot be deleted."
                    : "Could not delete the " + kind + ". Please try again."
            );
        }
    }

    return (
        <section
            className="management-page"
            aria-label="Franchise and universes"
            aria-busy={savingWorkspace}
        >
            <div className="management-toolbar">
                <h2 className="management-section-title">
                    Franchise
                </h2>

                <div className="management-row-actions">
                    <button
                        type="button"
                        className="utility-button"
                        disabled={controlsDisabled}
                        onClick={() => openEditor({
                            kind: "franchise",
                            record: null
                        })}
                    >
                        Add franchise
                    </button>

                    {franchise && (
                        <>
                            <button
                                type="button"
                                className="utility-button"
                                disabled={controlsDisabled}
                                onClick={() => openEditor({
                                    kind: "franchise",
                                    record: franchise
                                })}
                            >
                                Edit franchise
                            </button>

                            <button
                                type="button"
                                className="utility-button utility-button-danger"
                                disabled={
                                    controlsDisabled ||
                                    universes.length > 0
                                }
                                onClick={() =>
                                    handleDelete("franchise", franchise)
                                }
                            >
                                Delete franchise
                            </button>
                        </>
                    )}
                </div>
            </div>

            <p className="management-summary">
                {franchise
                    ? "Selected franchise: " + franchise.name
                    : "Add your first franchise to get started."}
            </p>

            {franchise && universes.length > 0 && (
                <p className="management-summary">
                    A franchise can be deleted after its universes have been removed.
                </p>
            )}

            {savingWorkspace && !editor && (
                <p className="management-notice" role="status">
                    Deleting...
                </p>
            )}

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

            {editor && (
                <WorkspaceForm
                    key={
                        editor.kind + "-" +
                        (editor.record?.id ?? "new")
                    }
                    kind={editor.kind}
                    editing={editor.record !== null}
                    initialValues={{
                        name: editor.record?.name ?? "",
                        code: editor.kind === "universe"
                            ? editor.record?.code ?? null
                            : null
                    }}
                    saving={savingWorkspace}
                    onSave={handleSave}
                    onCancel={() => setEditor(null)}
                />
            )}

            <div className="management-toolbar">
                <h2 className="management-section-title">
                    Universes
                </h2>

                <button
                    type="button"
                    className="utility-button"
                    disabled={controlsDisabled || !franchise}
                    onClick={() => openEditor({
                        kind: "universe",
                        record: null
                    })}
                >
                    Add universe
                </button>
            </div>

            {!franchise ? (
                <p className="status-message">
                    Create a franchise to add universes.
                </p>
            ) : universes.length === 0 ? (
                <p className="status-message">
                    This franchise has no universes yet.
                </p>
            ) : (
                <div className="management-table-container">
                    <table className="management-table">
                        <thead>
                            <tr>
                                <th scope="col">Universe</th>
                                <th scope="col">Code</th>
                                <th scope="col">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {universes.map((universe) => (
                                <tr key={universe.id}>
                                    <td>{universe.name}</td>
                                    <td>{universe.code ?? "Not set"}</td>

                                    <td>
                                        <div className="management-row-actions">
                                            <button
                                                type="button"
                                                className="utility-button"
                                                disabled={controlsDisabled}
                                                aria-label={"Edit " + universe.name}
                                                onClick={() => openEditor({
                                                    kind: "universe",
                                                    record: universe
                                                })}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                className="utility-button utility-button-danger"
                                                disabled={controlsDisabled}
                                                aria-label={"Delete " + universe.name}
                                                onClick={() => handleDelete(
                                                    "universe", universe
                                                )}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}