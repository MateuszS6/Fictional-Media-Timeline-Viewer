export type AppearanceType =
	| "standard"
	| "flashback"
	| "footage"
	| "depiction" // Covers statues, paintings, photographs and similar representations
	| "vision"
	| "afterlife"
	| "non_chronological"; //

export const APPEARANCE_OPTIONS: {
	value: AppearanceType;
	label: string;
}[] = [
		{ value: "standard", label: "Standard" },
		{ value: "flashback", label: "Flashback" },
		{ value: "footage", label: "Footage" },
		{ value: "depiction", label: "Depiction" },
		{ value: "vision", label: "Vision" },
		{ value: "afterlife", label: "Afterlife" },
		{ value: "non_chronological", label: "Non-chronological" }
	]

export interface Appearance {
	universe_id: number;
	character_id: number;
	project_id: number;
	appearance_type: AppearanceType;
	is_detached: boolean;
}

// Optional (?) updates
export interface AppearanceUpdate {
	appearance_type?: AppearanceType;
	is_detached?: boolean;
}