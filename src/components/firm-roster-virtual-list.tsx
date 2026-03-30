import { measureElement, useWindowVirtualizer } from "@tanstack/react-virtual";
import { useLayoutEffect, useRef, useState } from "react";

import { useMediaMinWidth } from "@/src/hooks/use-media-min-width";
import { estimateFirmRosterRowHeightPx } from "@/src/lib/firm-roster-row-metrics";
import type { RosterMember } from "@/src/types/roster";

type FirmRosterVirtualListProps = {
	members: RosterMember[];
	/** Tab id — invalidates measurements when the filtered list swaps */
	revalidateKey: string;
};

/**
 * Window-scoped virtual list for the Firm roster: Pretext `estimateSize` + TanStack
 * `measureElement` for accurate variable row heights.
 */
export function FirmRosterVirtualList({
	members,
	revalidateKey,
}: FirmRosterVirtualListProps) {
	const scrollAnchorRef = useRef<HTMLDivElement>(null);
	const [scrollMargin, setScrollMargin] = useState(0);
	const [listWidth, setListWidth] = useState(0);
	const [fontEpoch, setFontEpoch] = useState(0);
	const isLg = useMediaMinWidth("(min-width: 1024px)");

	useLayoutEffect(() => {
		if (typeof document === "undefined") return;
		void document.fonts.ready.then(() => setFontEpoch((n) => n + 1));
	}, []);

	useLayoutEffect(() => {
		void revalidateKey;
		void members.length;
		const el = scrollAnchorRef.current;
		if (!el) return;
		const sync = () => {
			setScrollMargin(
				Math.round(el.getBoundingClientRect().top + window.scrollY),
			);
			setListWidth(el.clientWidth);
		};
		sync();
		const ro = new ResizeObserver(() => sync());
		ro.observe(el);
		window.addEventListener("resize", sync, { passive: true });
		return () => {
			ro.disconnect();
			window.removeEventListener("resize", sync);
		};
	}, [revalidateKey, members.length]);

	const virtualizer = useWindowVirtualizer({
		count: members.length,
		estimateSize: (index) => {
			void fontEpoch;
			return estimateFirmRosterRowHeightPx(members[index]!, listWidth, isLg);
		},
		scrollMargin,
		overscan: 8,
		measureElement,
		getItemKey: (index) => members[index]!.displayName,
	});

	useLayoutEffect(() => {
		void revalidateKey;
		void members.length;
		virtualizer.measure();
	}, [revalidateKey, members.length, virtualizer]);

	useLayoutEffect(() => {
		void fontEpoch;
		virtualizer.measure();
	}, [fontEpoch, virtualizer]);

	if (members.length === 0) {
		return null;
	}

	return (
		<div
			ref={scrollAnchorRef}
			className="w-full"
			style={{
				height: `${virtualizer.getTotalSize()}px`,
				position: "relative",
			}}
		>
			{virtualizer.getVirtualItems().map((v) => {
				const member = members[v.index]!;
				return (
					<div
						key={v.key}
						data-index={v.index}
						ref={virtualizer.measureElement}
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							width: "100%",
							transform: `translateY(${v.start - virtualizer.options.scrollMargin}px)`,
						}}
					>
						<div className="firm-row group flex cursor-pointer flex-col items-start justify-between gap-4 border-b border-border px-4 py-6 transition-colors hover:bg-accent-muted/25 lg:flex-row lg:items-center lg:gap-0">
							<div className="flex min-w-0 w-full items-center gap-6 lg:mb-0 lg:w-auto lg:gap-8">
								<div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-border-strong/40 opacity-95 ring-1 ring-border transition-opacity duration-500 group-hover:border-accent/45 group-hover:opacity-100">
									<img
										src={member.imageSrc}
										alt={member.displayName}
										width={128}
										height={128}
										loading="lazy"
										decoding="async"
										className="h-full w-full object-cover grayscale contrast-125 opacity-80 transition-all duration-500 ease-out group-hover:scale-110 group-hover:opacity-100"
										referrerPolicy="no-referrer"
									/>
								</div>
								<h4 className="min-w-0 break-words text-2xl font-display tracking-wide md:text-3xl">
									{member.displayName}
								</h4>
							</div>
							<div className="w-full shrink-0 text-left text-technical text-muted lg:w-auto lg:text-right">
								{member.role}
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}
