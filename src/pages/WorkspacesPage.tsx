import { useState } from "react";
import type { WorkspaceFormValues } from "../components/workspaces/WorkspaceForm";
import WorkspaceForm from "../components/workspaces/WorkspaceForm";
import { useWorkspace } from "../context/WorkspaceContext";
import type { Franchise } from "../types/franchise";
import type { Universe } from "../types/universe";

type Editor =
	| { kind: "franchise"; record: Franchise | null; }
	| { kind: "universe"; record: Universe | null; };

interface WorkspacesPageProps {
	level: "franchises" | "universes";
	onOpenFranchise: (id: number) => void;
	onOpenUniverse: (id: number) => void;
}

export default function WorkspacesPage({
	level,
	onOpenFranchise,
	onOpenUniverse
}: WorkspacesPageProps) {
	const {
		franchises,
		universes,
		selectedFranchiseId,
		canEdit,
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
		if (!canEdit) return;
		setNotice(null);
		setActionError(null);
		setEditor(next);
	}

	async function handleSave(values: WorkspaceFormValues) {
		if (!canEdit || !editor) throw new Error("No editor is open.");

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
		if (!canEdit || controlsDisabled) return;

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

	const atRoot = level === "franchises";

	const kind = atRoot ? "franchise" : "universe";

	const records: (Franchise | Universe)[] = atRoot
		? franchises
		: universes.filter(
			(universe) => canEdit || universe.is_published
		);

	return (
		<section
			className="management-page browse-page"
			aria-label={atRoot ? "Franchises" : "Universes"}
			aria-busy={savingWorkspace}
		>
			{canEdit && (
				<div className="management-toolbar">
					<p className="management-summary">
						{atRoot
							? "Manage franchises here; open one to manage its universes."
							: "Private timelines are only available in Studio."}
					</p>

					<button
						type="button"
						className="utility-button"
						disabled={
							controlsDisabled || (!atRoot && !franchise)
						}
						onClick={() =>
							openEditor({ kind, record: null })
						}
					>
						Add {kind}
					</button>
				</div>
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
						editor.kind + "-" + (editor.record?.id ?? "new")
					}
					kind={editor.kind}
					editing={editor.record !== null}
					initialValues={{
						name: editor.record?.name ?? "",
						code: editor.kind === "universe"
							? editor.record?.code ?? null
							: null,
						is_published: editor.kind === "universe"
							? editor.record?.is_published ?? false
							: false
					}}
					saving={savingWorkspace}
					onSave={handleSave}
					onCancel={() => setEditor(null)}
				/>
			)}

			{records.length === 0 ? (
				<p className="status-message">
					{canEdit
						? atRoot
							? "Add your first franchise to get started."
							: "Add a universe to start its timeline."
						: atRoot
							? "No timelines have been published yet."
							: "No published timelines are available in this franchise."}
				</p>
			) : (
				<div className="browse-grid">
					{records.map((record) => {
						const universe = "is_published" in record ? record : null;

						return (
							<article key={record.id} className="browse-card">
								<h2>
									<button
										type="button"
										className="browse-card-open"
										disabled={controlsDisabled}
										aria-label={
											record.name +
											(atRoot ? ": open franchise" : ": open timeline")
										}
										onClick={() => atRoot
											? onOpenFranchise(record.id)
											: onOpenUniverse(record.id)
										}
									>
										<span>{record.name}</span>
										<span aria-hidden="true">→</span>
									</button>
								</h2>

								<p className="browse-card-meta">
									{universe
										? universe.code || "Timeline"
										: "Explore timelines"}

									{canEdit && universe && (
										<span className="browse-visibility">
											{universe.is_published
												? "Public"
												: "Private"}
										</span>
									)}
								</p>

								{canEdit && (
									<div className="management-row-actions browse-card-actions">
										<button
											type="button"
											className="utility-button"
											disabled={controlsDisabled}
											aria-label={"Edit" + record.name}
											onClick={() => openEditor(
												universe ? {
													kind: "universe",
													record: universe
												} : {
													kind: "franchise",
													record
												}
											)}
										>
											Edit
										</button>

										<button
											type="button"
											className="utility-button utility-button-danger"
											disabled={controlsDisabled}
											aria-label={"Delete " + record.name}
											onClick={() => handleDelete(kind, record)}
										>
											Delete
										</button>
									</div>
								)}
							</article>
						);
					})}
				</div>
			)}
		</section>
	);
}