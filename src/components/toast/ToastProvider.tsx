import type { ReactNode } from "react";
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useRef,
	useState,
} from "react";

export type ToastVariant = "success" | "error" | "info";

interface ToastItem {
	id: string;
	message: string;
	variant: ToastVariant;
}

interface ToastContextValue {
	pushToast: (
		message: string,
		variant?: ToastVariant,
		durationMs?: number,
	) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

function variantClasses(variant: ToastVariant): string {
	if (variant === "success") return "border-success/60 text-success";
	if (variant === "error") return "border-danger/60 text-danger";
	return "border-border text-muted";
}

export function ToastProvider({ children }: { children: ReactNode }) {
	const [toasts, setToasts] = useState<ToastItem[]>([]);
	const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

	const removeToast = useCallback((id: string) => {
		const t = timers.current.get(id);
		if (t) clearTimeout(t);
		timers.current.delete(id);
		setToasts((list) => list.filter((x) => x.id !== id));
	}, []);

	const pushToast = useCallback(
		(message: string, variant: ToastVariant = "info", durationMs = 2800) => {
			const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
			setToasts((list) => [...list, { id, message, variant }]);
			const timer = setTimeout(() => removeToast(id), durationMs);
			timers.current.set(id, timer);
		},
		[removeToast],
	);

	const value = useMemo(() => ({ pushToast }), [pushToast]);

	return (
		<ToastContext.Provider value={value}>
			{children}
			<div
				className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 max-w-sm pointer-events-none"
				aria-live="polite"
				aria-atomic="true"
			>
				{toasts.map((t) => (
					<div
						key={t.id}
						role="status"
						className={`pointer-events-auto border px-4 py-3 text-sm font-sans bg-bg/95 backdrop-blur-sm shadow-lg ${variantClasses(t.variant)}`}
					>
						{t.message}
					</div>
				))}
			</div>
		</ToastContext.Provider>
	);
}

export function useToast(): ToastContextValue {
	const ctx = useContext(ToastContext);
	if (!ctx) throw new Error("useToast must be used within ToastProvider");
	return ctx;
}
