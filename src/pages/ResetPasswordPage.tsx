import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
	AUTH_TEXT_INPUT_CLASS,
	AuthFieldError,
	AuthFormCard,
	AuthPortalScreen,
} from "@/src/components/auth-portal.tsx";
import { Seo } from "@/src/components/seo.tsx";
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
		<AuthPortalScreen>
			<Seo
				title="Reset password — MECG"
				description="Choose a new password for your MECG account."
				pathname="/reset-password"
			/>
			<AuthFormCard>
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
								className={AUTH_TEXT_INPUT_CLASS}
							/>
							<p
								id="reset-password-requirements-hint"
								className="text-technical text-xs text-muted"
							>
								At least 8 characters.
							</p>
							{error && invalidField === "password" ? (
								<AuthFieldError id="reset-password-field-error">
									{error}
								</AuthFieldError>
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
								className={AUTH_TEXT_INPUT_CLASS}
							/>
							<p
								id="reset-confirm-hint"
								className="text-technical text-xs text-muted"
							>
								Must match the field above.
							</p>
							{error && invalidField === "confirm" ? (
								<AuthFieldError id="reset-confirm-field-error">
									{error}
								</AuthFieldError>
							) : null}
						</label>
						<Button
							type="submit"
							disabled={pending}
							aria-busy={pending}
							variant="outline"
							className="w-full min-h-11 border-accent text-accent hover:bg-accent hover:text-bg"
							size="lg"
						>
							{pending ? "Updating…" : "Update password"}
						</Button>
					</form>
				)}
				<Link
					to="/login"
					className="block text-center text-technical text-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring rounded-sm"
				>
					← Back to sign in
				</Link>
			</AuthFormCard>
		</AuthPortalScreen>
	);
}
