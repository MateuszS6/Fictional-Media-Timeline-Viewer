export interface Universe {
    id: number;
    franchise_id: number;
    name: string;
    code: string | null;
}

export interface UniverseInput {
    name: string;
    code: string | null;
}

export interface UniverseProjects {
    universe_id: number;
    project_id: number;
    timeline_position: number;
}