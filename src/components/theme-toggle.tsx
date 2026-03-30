import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type ThemeToggleProps = {
	className?: string;
};

/**
 * Cycles light ↔ dark. Waits for mount so `resolvedTheme` matches client storage
 * (avoids hydration mismatch with next-themes).
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const isLight = resolvedTheme === "light";
	const label = isLight ? "Switch to dark theme" : "Switch to light theme";

	return (
		<button
			type="button"
			className={cn(
				"inline-flex h-11 min-h-11 w-11 min-w-11 shrink-0 items-center justify-center rounded-md border border-border bg-bg/80 text-ink backdrop-blur-sm transition-[color,background-color,border-color] hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
				className,
			)}
			aria-label={label}
			onClick={() => setTheme(isLight ? "dark" : "light")}
		>
			{mounted ? (
				isLight ? (
					<Moon className="h-5 w-5" aria-hidden />
				) : (
					<Sun className="h-5 w-5" aria-hidden />
				)
			) : (
				<span className="h-5 w-5" aria-hidden />
			)}
		</button>
	);
}
