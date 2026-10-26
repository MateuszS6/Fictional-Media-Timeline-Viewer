import { useRef, useState, type SubmitEvent } from "react";
import type { Character, CharacterInput } from "../../types/character";
import type { Universe } from "../../types/universe";

interface CharacterFormProps {
	character: Character | null;
	defaultUniverseId: number;
	universes: Universe[];
	onSave: (input: CharacterInput) => Promise<void>;
	onCancel: () => void;
}

export default function CharacterForm({
	character,
	defaultUniverseId,
	universes,
	onSave,
	onCancel
}: CharacterFormProps) {
	const [alias, setAlias] = useState(character?.alias ?? "");
	const [realName, setRealName] = useState(character?.real_name ?? "");

	const [originUniverseId, setOriginUniverseId] = useState(character?.origin_universe_id ?? defaultUniverseId);

	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const savingRef = useRef(false);

	async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();

		if (savingRef.current) return;

		const trimmedAlias = alias.trim();
		const trimmedRealName = realName.trim();

		if (!trimmedAlias) {
			setError("Enter a character alias.");
			return;
		}

		if (!universes.some((universe) => universe.id === originUniverseId)) {
			setError("Choose an origin universe.")
			return;
		}

		savingRef.current = true;
		setSaving(true);
		setError(null);

		try {
			await onSave({
				alias: trimmedAlias,
				real_name: trimmedRealName || null,
				origin_universe_id: originUniverseId
			});
		} catch (caughtError) {
			console.error(caughtError);
			setError("Could not save the character. Your entries have been kept.");
		} finally {
			savingRef.current = false;
			setSaving(false);
		}
	}

	return (
		<form
			className="management-form"
			aria-labelledby="character-form-heading"
			aria-busy={saving}
			onSubmit={handleSubmit}
		>
			<h2 id="character-form-heading">
				{character ? "Edit character" : "Add character"}
			</h2>

			{error && (
				<p className="form-error" role="alert">
					{error}
				</p>
			)}

			<fieldset disabled={saving}>

				<div className="form-fields">

					<label className="form-field">
						<span>Alias</span>
						<input
							type="text"
							value={alias}
							onChange={(event) => setAlias(event.target.value)}
							required
							autoFocus
						/>
						<small>The display name used in the timeline.</small>
					</label>

					<label className="form-field">
						<span>Real name (optional)</span>
						<input
							type="text"
							value={realName}
							onChange={(event) => setRealName(event.target.value)}
						/>
					</label>

					<label className="form-field">
						<span>Origin universe</span>
						<select
							value={originUniverseId}
							onChange={(event) =>
								setOriginUniverseId(Number(event.target.value))
							}
							required
						>
							{universes.map((universe) => (
								<option key={universe.id} value={universe.id}>
									{universe.name}
								</option>
							))}
						</select>
						<small>
							Origin does not restrict where this character can appear.
						</small>

					</label>

				</div>

				<div className="form-actions">

					<button type="submit" className="utility-button">
						{saving
							? "Saving..."
							: character
								? "Save changes"
								: "Add character"}
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