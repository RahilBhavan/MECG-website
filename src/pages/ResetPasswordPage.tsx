import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { focusFormControl } from "@/src/lib/focus-form-control";
import { supabase } from "@/src/lib/supabase";

type InvalidField = "password" | "confirm" | null;

/**
 * Supabase sends users here after resetPasswordForEmail. Add this URL to Supabase Auth → URL config
 * (Redirect URLs), e.g. https://yourdomain.com/reset-password
 */
export default function ResetPasswordPage() {
	const navigate = useNavigate();
	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");
	const [ready, setReady] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [invalidField, setInvalidField] = useState<InvalidField>(null);
	const [pending, setPending] = useState(false);
	const passwordRef = useRef<HTMLInputElement>(null);
	const confirmRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event) => {
			if (event === "PASSWORD_RECOVERY") setReady(true);
		});

		void supabase.auth.getSession().then(({ data }) => {
			if (data.session) setReady(true);
		});

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setInvalidField(null);
		if (password.length < 8) {
			setError("Use at least 8 characters.");
			setInvalidField("password");
			window.requestAnimationFrame(() => focusFormControl(passwordRef.current));
			return;
		}
		if (password !== confirm) {
			setError("Passwords do not match.");
			setInvalidField("confirm");
			window.requestAnimationFrame(() => focusFormControl(confirmRef.current));
			return;
		}
		setPending(true);
		const { error: err } = await supabase.auth.updateUser({ password });
		setPending(false);
		if (err) {
			setError(err.message);
			setInvalidField("password");
			window.requestAnimationFrame(() => focusFormControl(passwordRef.current));
			return;
		}
		await supabase.auth.signOut();
		navigate("/login", { replace: true, state: { resetOk: true } });
	}

	return (
		<div className="min-h-screen bg-bg text-ink flex flex-col items-center justify-center px-6">
			<div className="w-full max-w-md rounded-sm border border-border bg-surface/40 p-8 space-y-6">
				<h1 className="type-auth-title">Set new password</h1>
				{!ready ? (
					<p className="text-technical text-muted">Checking your reset link…</p>
				) : (
					<form
						noValidate
						onSubmit={(e) => void handleSubmit(e)}
						className="space-y-4"
					>
						<label className="block space-y-1" htmlFor="reset-new-password">
							<span className="text-technical text-muted">New password</span>
							<input
								id="reset-new-password"
								ref={passwordRef}
								type="password"
								required
								minLength={8}
								autoComplete="new-password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								disabled={pending}
								aria-invalid={invalidField === "password"}
								aria-describedby={
									error && invalidField === "password"
										? "reset-password-requirements-hint reset-password-field-error"
										: "reset-password-requirements-hint"
								}
								className="w-full bg-transparent border border-border px-3 py-2 font-sans focus:border-ink outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:opacity-50"
							/>
							<p
								id="reset-password-requirements-hint"
								className="text-technical text-xs text-muted"
							>
								At least 8 characters.
							</p>
							{error && invalidField === "password" ? (
								<p
									id="reset-password-field-error"
									className="text-sm text-danger"
									role="alert"
								>
									{error}
								</p>
							) : null}
						</label>
						<label className="block space-y-1" htmlFor="reset-confirm-password">
							<span className="text-technical text-muted">
								Confirm password
							</span>
							<input
								id="reset-confirm-password"
								ref={confirmRef}
								type="password"
								required
								minLength={8}
								autoComplete="new-password"
								value={confirm}
								onChange={(e) => setConfirm(e.target.value)}
								disabled={pending}
								aria-invalid={invalidField === "confirm"}
								aria-describedby={
									error && invalidField === "confirm"
										? "reset-confirm-hint reset-confirm-field-error"
										: "reset-confirm-hint"
								}
								className="w-full bg-transparent border border-border px-3 py-2 font-sans focus:border-ink outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:opacity-50"
							/>
							<p
								id="reset-confirm-hint"
								className="text-technical text-xs text-muted"
							>
								Must match the field above.
							</p>
							{error && invalidField === "confirm" ? (
								<p
									id="reset-confirm-field-error"
									className="text-sm text-danger"
									role="alert"
								>
									{error}
								</p>
							) : null}
						</label>
						<button
							type="submit"
							disabled={pending}
							className="w-full border border-accent py-3 min-h-11 text-technical text-accent hover:bg-accent hover:text-bg transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
						>
							{pending ? "Updating…" : "Update password"}
						</button>
					</form>
				)}
				<Link
					to="/login"
					className="block text-center text-technical text-muted hover:text-ink"
				>
					← Back to sign in
				</Link>
			</div>
		</div>
	);
}
