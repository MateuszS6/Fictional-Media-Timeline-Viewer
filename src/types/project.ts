export interface Project {
    id: number;
    title: string;
    release_date: string | null;
    primary_universe_id: number;
}

export interface ProjectInput {
    title: string;
    release_date: string | null;
    primary_universe_id: number;
}