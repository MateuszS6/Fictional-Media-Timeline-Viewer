import { useCallback, useRef, useState } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { APPEARANCE_OPTIONS, type Appearance, type AppearanceType, type AppearanceUpdate } from "../../types/appearance";
import { CHARACTER_EVENT_OPTIONS, type CharacterEvent, type CharacterEventPosition, type CharacterEventType } from "../../types/characterEvent";
import AppearanceEditor from "./AppearanceEditor";

interface TimelineCellProps {
    characterId: number;
    projectId: number;

    characterName: string;
    projectTitle: string;

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
    characterName,
    projectTitle,
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
    const { canEdit } = useWorkspace();
    const hasDetails = Boolean(appearance || characterEvent)

    const [editorOpen, setEditorOpen] = useState(false);
    const cellRef = useRef<HTMLDivElement>(null);

    const closeEditor = useCallback(() => {
        setEditorOpen(false);
    }, []);

    function handleLeftClick() {
        if (saving) return;

        if (!canEdit) {
            if (hasDetails) {
                setEditorOpen((open) => !open);
            }

            return;
        }

        if (!appearance) {
            onCreate(characterId, projectId);
            return;
        } else {
            onDelete(characterId, projectId);
            setEditorOpen(false);
            return;
        }
    }

    function handleRightClick(
        event: React.MouseEvent<HTMLDivElement>
    ) {
        if (!canEdit) return;

        event.preventDefault();

        if (saving) return;

        // Empty cell can still contain/edit a timeline event.
        setEditorOpen((open) => !open);
    }

    function handleAppearanceTypeChange(type: AppearanceType) {
        if (!appearance || saving) return;

        // Selecting the current type keeps any manual detachment choice.
        if (appearance.appearance_type === type) {
            setEditorOpen(false);
            return;
        }

        onUpdate(characterId, projectId, {
            appearance_type: type,
            is_detached: type !== "standard" || appearance.is_detached
        });

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
            className={
                canEdit
                    ? "timeline-cell"
                    : "timeline-cell timeline-cell-viewer"
            }
            role={!canEdit && hasDetails ? "button" : undefined}
            tabIndex={!canEdit && hasDetails ? 0 : undefined}
            aria-label={
                !canEdit && hasDetails
                    ? `Details for ${characterName} in ${projectTitle}`
                    : undefined
            }
            aria-haspopup={!canEdit && hasDetails ? "dialog" : undefined}
            aria-expanded={!canEdit && hasDetails ? editorOpen : undefined}
            aria-disabled={saving}
            onClick={handleLeftClick}
            onContextMenu={handleRightClick}
            onKeyDown={(event) => {
                if (event.target !== event.currentTarget) return;

                if (
                    !canEdit &&
                    hasDetails &&
                    (event.key === "Enter" || event.key === " ")
                ) {
                    event.preventDefault();
                    handleLeftClick();
                }
            }}
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
                        appearance.appearance_type.replaceAll("_", " ") +
                        (appearance.is_detached ? " - detached" : "")
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
                    title={characterEvent.event_type === "unknown"
                        ? "Unknown status"
                        : characterEvent.event_type
                    }
                >
                    {characterEvent.event_type === "death" && "×"}
                    {characterEvent.event_type === "revival" && "↻"}
                    {characterEvent.event_type === "blip" && "✦"}
                    {characterEvent.event_type === "return" && "↺"}
                    {characterEvent.event_type === "unknown" && "?"}
                </span>
            )}

            {/* VIEWER */}

            {editorOpen && !canEdit && hasDetails && (
                <AppearanceEditor
                    anchorRef={cellRef}
                    onClose={closeEditor}
                >
                    <div className="timeline-cell-details">
                        <strong>{characterName}</strong>
                        <p>{projectTitle}</p>

                        {appearance && (
                            <p>
                                Appearance: {APPEARANCE_OPTIONS.find((option) =>
                                    option.value === appearance.appearance_type
                                )?.label}

                                <br />

                                {appearance.is_detached
                                    ? "Detached from the lifeline"
                                    : "Connected to the lifeline"}
                            </p>
                        )}

                        {characterEvent && (
                            <p>
                                Event: {CHARACTER_EVENT_OPTIONS.find((option) =>
                                    option.value === characterEvent.event_type
                                )?.label}

                                <br />

                                {characterEvent.event_position === "after"
                                    ? "After this project"
                                    : "At this project"}
                            </p>
                        )}

                        <button type="button" onClick={closeEditor}>
                            Close
                        </button>
                    </div>
                </AppearanceEditor>
            )}

            {/* EDITOR */}

            {editorOpen && canEdit && (
                <AppearanceEditor
                    anchorRef={cellRef}
                    onClose={closeEditor}
                >
                    {/* APPEARANCE SECTION */}

                    {appearance ? (
                        <>
                            {APPEARANCE_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    disabled={saving}
                                    className={
                                        appearance.appearance_type === option.value
                                            ? "appearance-editor-option active"
                                            : "appearance-editor-option"
                                    }
                                    onClick={() => handleAppearanceTypeChange(option.value)}
                                >
                                    {option.label}
                                </button>
                            ))}

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

                    {CHARACTER_EVENT_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            disabled={saving}
                            className={
                                characterEvent?.event_type === option.value
                                    ? "appearance-editor-option active"
                                    : "appearance-editor-option"
                            }
                            onClick={() => handleEventTypeChange(option.value)}
                        >
                            {option.label}
                        </button>
                    ))}

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