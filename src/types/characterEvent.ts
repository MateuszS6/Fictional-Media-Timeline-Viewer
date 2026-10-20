export type CharacterEventType =
    | "death"
    | "revival"
    | "blip"
    | "return"
    | "unknown";

export const CHARACTER_EVENT_OPTIONS: {
    value: CharacterEventType;
    label: string;
}[] = [
        { value: "death", label: "Death" },
        { value: "revival", label: "Revival" },
        { value: "blip", label: "Blip" },
        { value: "return", label: "Return" },
        { value: "unknown", label: "Unknown status" }
    ]

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
        case "unknown":
            return "end";
        case "revival":
        case "return":
            return "resume";
    }
}