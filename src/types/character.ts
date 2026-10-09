export interface Character {
    id: number;
    alias: string;
    real_name: string | null;
    origin_universe_id: number;
}

export interface CharacterInput {
    alias: string;
    real_name: string | null;
    origin_universe_id: number;
}