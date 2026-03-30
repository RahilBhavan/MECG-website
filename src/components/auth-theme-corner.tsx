import { ThemeToggle } from "@/src/components/theme-toggle.tsx";

/** Fixed top-right theme control on auth flows (safe-area aware). */
export function AuthThemeCorner() {
	return (
		<div className="pointer-events-auto fixed top-[max(1rem,env(safe-area-inset-top,0px))] right-[max(1rem,env(safe-area-inset-right,0px))] z-50">
			<ThemeToggle />
		</div>
	);
}
