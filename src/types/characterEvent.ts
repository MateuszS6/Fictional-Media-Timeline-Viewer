export type CharacterEventType =
    | "death"
    | "revival"
    | "blip"
    | "return";

export type CharacterEventPosition =
    | "at"
    | "after";

export interface CharacterEvent {
    id: number;
    universe_id: number;
    character_id: number;
    project_id: number;
    event_type: CharacterEventType;
    event_position: CharacterEventPosition;
}

export interface CharacterEventUpdate {
    event_type: CharacterEventType;
    event_position: CharacterEventPosition;
}

export type ContinuityEffect =
    | "end"
    | "resume";

export function getContinuityEffect(
    event_type: CharacterEventType
): ContinuityEffect {
    switch (event_type) {
        case "death":
        case "blip":
            return "end";
        case "revival":
        case "return":
            return "resume";
    }
}