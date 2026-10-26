import { useEffect, useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

interface AppearanceEditorProps {
	anchorRef: RefObject<HTMLDivElement | null>;
	onClose: () => void;
	children: ReactNode;
	label?: string;
	className?: string;
}

export default function AppearanceEditor({
	anchorRef,
	onClose,
	children,
	label = "Appearance and timeline event",
	className = ""
}: AppearanceEditorProps) {
	const editorRef = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		function updatePosition() {
			const anchor = anchorRef.current;
			const editor = editorRef.current;

			if (!anchor || !editor) return;

			const anchorBounds = anchor.getBoundingClientRect();
			const editorBounds = editor.getBoundingClientRect();

			const margin = 8;
			const gap = 12;

			const preferredLeft = anchorBounds.right + gap;

			const left = preferredLeft + editorBounds.width <= window.innerWidth - margin
				? preferredLeft
				: anchorBounds.left - editorBounds.width - gap;

			const top = anchorBounds.top + anchorBounds.height / 2 - editorBounds.height / 2;

			const maxLeft = Math.max(
				margin,
				window.innerWidth - editorBounds.width - margin
			);

			const maxTop = Math.max(
				margin,
				window.innerHeight - editorBounds.height - margin
			);

			editor.style.left = `${Math.max(
				margin,
				Math.min(left, maxLeft)
			)}px`;

			editor.style.top = `${Math.max(
				margin,
				Math.min(top, maxTop)
			)}px`;
		}

		updatePosition();

		window.addEventListener("resize", updatePosition);
		window.addEventListener("scroll", updatePosition, true);

		return () => {
			window.removeEventListener("resize", updatePosition);
			window.removeEventListener("scroll", updatePosition, true);
		};
	}, [anchorRef, children]);

	useEffect(() => {
		const previousFocus = document.activeElement;

		editorRef.current?.querySelector<HTMLButtonElement>("button")?.focus({
			preventScroll: true
		});

		function handleMouseDown(event: MouseEvent) {
			const target = event.target;

			if (!(target instanceof Node)) return;

			if (
				!anchorRef.current?.contains(target) &&
				!editorRef.current?.contains(target)
			) {
				onClose();
			}
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				onClose();
			}
		}

		document.addEventListener("mousedown", handleMouseDown);
		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("mousedown", handleMouseDown);
			document.removeEventListener("keydown", handleKeyDown);

			if (
				previousFocus instanceof HTMLElement &&
				previousFocus.isConnected
			) {
				previousFocus.focus({ preventScroll: true });
			}
		};
	}, [anchorRef, onClose]);

	return createPortal(
		<div
			ref={editorRef}
			className={`appearance-editor ${className}`}
			role="dialog"
			aria-label={label}
			onClick={(event) => event.stopPropagation()}
			onContextMenu={(event) => {
				event.preventDefault();
				event.stopPropagation();
			}}
		>
			{children}
		</div>,
		document.body
	);
}