export type AppearanceType = 
    | "standard"
    | "flashback"
    | "footage";

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