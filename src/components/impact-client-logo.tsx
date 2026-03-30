import type { SimpleIcon } from "simple-icons";

type ImpactClientLogoProps =
	| { kind: "simple-icon"; icon: SimpleIcon }
	| { kind: "image"; src: string };

/**
 * Renders a client mark for impact cards: Simple Icons (CC0) or a static SVG in /public/impact-logos.
 */
export function ImpactClientLogo(props: ImpactClientLogoProps) {
	if (props.kind === "simple-icon") {
		const { icon } = props;
		return (
			<svg
				viewBox="0 0 24 24"
				className="h-9 w-9 shrink-0"
				aria-hidden
				xmlns="http://www.w3.org/2000/svg"
			>
				<path fill={`#${icon.hex}`} d={icon.path} />
			</svg>
		);
	}

	return (
		<img
			src={props.src}
			alt=""
			width={36}
			height={36}
			loading="lazy"
			decoding="async"
			className="h-9 w-9 shrink-0 object-contain"
		/>
	);
}
