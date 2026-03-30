import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
	const cursorRef = useRef<HTMLDivElement>(null);
	const [isHovering, setIsHovering] = useState(false);

	useEffect(() => {
		const cursor = cursorRef.current;
		if (!cursor) return;

		let raf = 0;
		let pendingX = 0;
		let pendingY = 0;
		const flush = () => {
			raf = 0;
			cursor.style.left = `${pendingX}px`;
			cursor.style.top = `${pendingY}px`;
		};

		const onMouseMove = (e: MouseEvent) => {
			pendingX = e.clientX;
			pendingY = e.clientY;
			if (raf === 0) raf = requestAnimationFrame(flush);
		};

		const onMouseOver = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			if (
				target.tagName.toLowerCase() === "a" ||
				target.tagName.toLowerCase() === "button" ||
				target.closest("a") ||
				target.closest("button") ||
				target.classList.contains("interactive")
			) {
				setIsHovering(true);
			} else {
				setIsHovering(false);
			}
		};

		window.addEventListener("mousemove", onMouseMove);
		window.addEventListener("mouseover", onMouseOver);

		return () => {
			window.removeEventListener("mousemove", onMouseMove);
			window.removeEventListener("mouseover", onMouseOver);
		};
	}, []);

	return (
		<div
			ref={cursorRef}
			className={`custom-cursor ${isHovering ? "hovering" : ""}`}
		/>
	);
}
