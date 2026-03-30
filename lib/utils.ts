import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes without conflicting utilities (shadcn/ui pattern). */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
