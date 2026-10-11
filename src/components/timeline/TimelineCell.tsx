import { useCallback, useRef, useState } from "react";
import type { Appearance, AppearanceType, AppearanceUpdate } from "../../types/appearance";
import type { CharacterEvent, CharacterEventPosition, CharacterEventType } from "../../types/characterEvent";
import AppearanceEditor from "./AppearanceEditor";

interface TimelineCellProps {
    characterId: number;
    projectId: number;

    appearance?: Appearance;
    characterEvent?: CharacterEvent;

    lineLeft: boolean;
    lineRight: boolean;
    isFirstConnected: boolean;

    onCreate: (
        characterId: number,
        projectId: number
    ) => void;

    onUpdate: (
        characterId: number,
        projectId: number,
        updates: AppearanceUpdate
    ) => void;

    onDelete: (
        characterId: number,
        projectId: number
    ) => void;

    onSaveEvent: (
        characterId: number,
        projectId: number,
        eventType: CharacterEventType,
        eventPosition: CharacterEventPosition
    ) => void;

    onDeleteEvent: (
        characterId: number,
        projectId: number
    ) => void;

    saving: boolean;
}

export default function TimelineCell({
    characterId,
    projectId,
    appearance,
    characterEvent,
    lineLeft,
    lineRight,
    isFirstConnected,
    onCreate,
    onUpdate,
    onDelete,
    onSaveEvent,
    onDeleteEvent,
    saving
}: TimelineCellProps) {
    const [editorOpen, setEditorOpen] = useState(false);
    const cellRef = useRef<HTMLDivElement>(null);

    const closeEditor = useCallback(() => {
        setEditorOpen(false);
    }, []);

    function handleLeftClick() {
        if (saving) return;

        if (!appearance) {
            onCreate(characterId, projectId);
            return;
        }

        setEditorOpen((open) => !open);
    }

    function handleRightClick(
        event: React.MouseEvent<HTMLDivElement>
    ) {
        event.preventDefault();

        if (saving) return;

        if (appearance) {
            onDelete(characterId, projectId);
            setEditorOpen(false);
            return;
        }

        // Empty cell can still contain/edit a timeline event.
        setEditorOpen((open) => !open);
    }

    function handleAppearanceTypeChange(type: AppearanceType) {
        onUpdate(
            characterId,
            projectId,
            {
                appearance_type: type
            }
        );

        setEditorOpen(false);
    }

    function handleDetachedToggle(
        event: React.MouseEvent
    ) {
        event.stopPropagation();

        if (!appearance) return;

        onUpdate(
            characterId,
            projectId,
            {
                is_detached: !appearance.is_detached
            }
        );
    }

    function handleEventTypeChange(
        type: CharacterEventType
    ) {
        onSaveEvent(
            characterId,
            projectId,
            type,
            characterEvent?.event_position ?? "at"
        );
    }

    function handleEventPositionChange(
        position: CharacterEventPosition
    ) {
        if (!characterEvent) return;

        onSaveEvent(
            characterId,
            projectId,
            characterEvent.event_type,
            position
        );
    }

    function handleDeleteEvent(
        event: React.MouseEvent
    ) {
        event.stopPropagation();

        onDeleteEvent(
            characterId,
            projectId
        );
    }

    return (
        <div
            ref={cellRef}
            className="timeline-cell"
            aria-disabled={saving}
            onClick={handleLeftClick}
            onContextMenu={handleRightClick}
        >
            {/* CONNECTORS */}

            {lineLeft && (
                <span className="timeline-line timeline-line-left" />
            )}

            {lineRight && (
                <span className="timeline-line timeline-line-right" />
            )}

            {/* MARKER */}

            {isFirstConnected && (
                <span
                    className="timeline-start-marker"
                    title="Start of main timeline"
                />
            )}

            {appearance && (
                <div
                    className={`
                        appearance-marker
                        appearance-${appearance.appearance_type}
                        ${appearance.is_detached ? "appearance-detached" : ""}
                    `}
                    title={
                        appearance.is_detached
                            ? `${appearance.appearance_type} - detached`
                            : appearance.appearance_type
                    }
                />
            )}

            {characterEvent && (
                <span
                    className={`
                        timeline-event
                        timeline-event-${characterEvent.event_type}
                        timeline-event-${characterEvent.event_position}
                        ${appearance ? "timeline-event-with-appearance" : ""}
                    `}
                    title={characterEvent.event_type}
                >
                    {characterEvent.event_type === "death" && "×"}
                    {characterEvent.event_type === "revival" && "↻"}
                    {characterEvent.event_type === "blip" && "✦"}
                    {characterEvent.event_type === "return" && "↺"}
                </span>
            )}

            {/* EDITOR */}

            {editorOpen && (
                <AppearanceEditor
                    anchorRef={cellRef}
                    onClose={closeEditor}
                >
                    {/* APPEARANCE SECTION */}

                    {appearance ? (
                        <>
                            <button
                                disabled={saving}
                                className={
                                    appearance.appearance_type === "standard"
                                        ? "appearance-editor-option active"
                                        : "appearance-editor-option"
                                }
                                onClick={() => handleAppearanceTypeChange("standard")}
                            >
                                Standard
                            </button>

                            <button
                                disabled={saving}
                                className={
                                    appearance.appearance_type === "flashback"
                                        ? "appearance-editor-option active"
                                        : "appearance-editor-option"
                                }
                                onClick={() => handleAppearanceTypeChange("flashback")}
                            >
                                Flashback
                            </button>

                            <button
                                disabled={saving}
                                className={
                                    appearance.appearance_type === "footage"
                                        ? "appearance-editor-option active"
                                        : "appearance-editor-option"
                                }
                                onClick={() => handleAppearanceTypeChange("footage")}
                            >
                                Footage
                            </button>

                            <div className="appearance-editor-divider" />

                            <button
                                disabled={saving}
                                className={
                                    appearance.is_detached
                                        ? "appearance-editor-option active"
                                        : "appearance-editor-option"
                                }
                                onClick={handleDetachedToggle}
                            >
                                {appearance.is_detached
                                    ? "✓ Detached from lifeline"
                                    : "Detach from lifeline"}
                            </button>
                        </>
                    ) : (
                        <button
                            disabled={saving}
                            className="appearance-editor-option"
                            onClick={() => {
                                onCreate(characterId, projectId);
                                setEditorOpen(false);
                            }}
                        >
                            Add standard appearance
                        </button>
                    )}

                    {/* EVENT SECTION */}

                    <div className="appearance-editor-divider" />

                    <div className="appearance-editor-label">
                        Timeline event
                    </div>

                    <button
                        disabled={saving}
                        className={
                            characterEvent?.event_type === "death"
                                ? "appearance-editor-option active"
                                : "appearance-editor-option"
                        }
                        onClick={() =>
                            handleEventTypeChange("death")
                        }
                    >
                        Death
                    </button>

                    <button
                        disabled={saving}
                        className={
                            characterEvent?.event_type === "revival"
                                ? "appearance-editor-option active"
                                : "appearance-editor-option"
                        }
                        onClick={() =>
                            handleEventTypeChange("revival")
                        }
                    >
                        Revival
                    </button>

                    <button
                        disabled={saving}
                        className={
                            characterEvent?.event_type === "blip"
                                ? "appearance-editor-option active"
                                : "appearance-editor-option"
                        }
                        onClick={() =>
                            handleEventTypeChange("blip")
                        }
                    >
                        Blip
                    </button>

                    <button
                        disabled={saving}
                        className={
                            characterEvent?.event_type === "return"
                                ? "appearance-editor-option active"
                                : "appearance-editor-option"
                        }
                        onClick={() =>
                            handleEventTypeChange("return")
                        }
                    >
                        Return
                    </button>

                    {/* EVENT OPTIONS */}

                    {characterEvent && (
                        <>
                            <div className="appearance-editor-divider" />

                            <div className="appearance-editor-label">
                                Event position
                            </div>

                            <button
                                disabled={saving}
                                className={
                                    characterEvent.event_position === "at"
                                        ? "appearance-editor-option active"
                                        : "appearance-editor-option"
                                }
                                onClick={() =>
                                    handleEventPositionChange("at")
                                }
                            >
                                At project
                            </button>

                            <button
                                disabled={saving}
                                className={
                                    characterEvent.event_position === "after"
                                        ? "appearance-editor-option active"
                                        : "appearance-editor-option"
                                }
                                onClick={() =>
                                    handleEventPositionChange("after")
                                }
                            >
                                After project
                            </button>

                            <div className="appearance-editor-divider" />

                            <button
                                disabled={saving}
                                className="appearance-editor-option appearance-editor-danger"
                                onClick={handleDeleteEvent}
                            >
                                Remove event
                            </button>
                        </>
                    )}
                </AppearanceEditor>
            )}
        </div>
    );
}