import { Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "@/src/auth/AuthProvider";
import { classifySignUpAuthError } from "@/src/lib/auth-errors";
import { focusFormControl } from "@/src/lib/focus-form-control";

export default function SignupPage() {
	const { user, configured, loading, signUpWithPassword } = useAuth();
	const navigate = useNavigate();
	const [displayName, setDisplayName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [displayNameError, setDisplayNameError] = useState<string | null>(null);
	const [signUpEmailError, setSignUpEmailError] = useState<string | null>(null);
	const [signUpPasswordError, setSignUpPasswordError] = useState<string | null>(
		null,
	);
	const [signUpFormError, setSignUpFormError] = useState<string | null>(null);
	const [errorDetail, setErrorDetail] = useState<string | null>(null);
	const [successPanel, setSuccessPanel] = useState(false);
	const [pending, setPending] = useState(false);
	const displayNameRef = useRef<HTMLInputElement>(null);
	const emailRef = useRef<HTMLInputElement>(null);
	const passwordRef = useRef<HTMLInputElement>(null);

	if (!configured && !loading) {
		return (
			<div className="min-h-screen bg-bg text-ink flex items-center justify-center px-6">
				<p className="text-technical text-muted text-center max-w-md">
					Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable
					sign-up.
				</p>
			</div>
		);
	}

	if (user && !loading) {
		return <Navigate to="/apply" replace />;
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (pending) return;
		setDisplayNameError(null);
		setSignUpEmailError(null);
		setSignUpPasswordError(null);
		setSignUpFormError(null);
		setErrorDetail(null);
		setPending(true);
		const { error: err, session } = await signUpWithPassword(
			email.trim(),
			password,
			displayName.trim(),
		);
		setPending(false);
		if (err) {
			const { friendly, detail, target } = classifySignUpAuthError(err.message);
			setErrorDetail(detail);
			if (target === "displayName") setDisplayNameError(friendly);
			else if (target === "email") setSignUpEmailError(friendly);
			else if (target === "password") setSignUpPasswordError(friendly);
			else setSignUpFormError(friendly);
			window.requestAnimationFrame(() => {
				if (target === "displayName") focusFormControl(displayNameRef.current);
				else if (target === "email") focusFormControl(emailRef.current);
				else if (target === "password") focusFormControl(passwordRef.current);
				else focusFormControl(displayNameRef.current);
			});
			return;
		}
		if (session) {
			navigate("/apply", { replace: true });
			return;
		}
		setSuccessPanel(true);
	}

	if (successPanel) {
		return (
			<div className="min-h-screen bg-bg text-ink flex flex-col items-center justify-center px-6">
				<div className="w-full max-w-md rounded-sm border border-success/50 bg-success-bg/25 p-8 space-y-6">
					<div className="flex items-center gap-3">
						<span className="flex h-10 w-10 items-center justify-center rounded-full border border-success/60">
							<Check className="h-5 w-5 text-success" aria-hidden />
						</span>
						<h1 className="type-auth-state-title">Check your inbox</h1>
					</div>
					<ul className="list-disc pl-5 text-technical text-muted space-y-2">
						<li>
							Open the confirmation email we sent to{" "}
							<span className="text-ink">{email}</span>.
						</li>
						<li>Confirm your account, then return here to sign in.</li>
						<li>If you don&apos;t see it, check spam or promotions.</li>
					</ul>
					<Link
						to="/login"
						className="block w-full text-center border border-accent py-3 min-h-11 text-technical text-accent hover:bg-accent hover:text-bg transition-colors"
					>
						Back to sign in
					</Link>
					<Link
						to="/"
						className="block text-center text-technical text-muted hover:text-ink"
					>
						← Back to site
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-bg text-ink flex flex-col items-center justify-center px-6">
			<div className="w-full max-w-md rounded-sm border border-border bg-surface/40 p-8 space-y-6">
				<h1 className="type-auth-title">Create account</h1>
				<p className="text-technical text-muted">
					New accounts receive the applicant role by default. Alumni, reviewer,
					and admin roles are assigned by an administrator in Supabase or via
					the Admin screen.
				</p>
				<form
					onSubmit={(e) => void handleSubmit(e)}
					className="space-y-4"
					noValidate
				>
					{signUpFormError ? (
						<p
							id="signup-auth-error"
							className="text-sm text-danger border border-danger/40 px-3 py-2"
							role="alert"
						>
							{signUpFormError}
						</p>
					) : null}
					<label className="block space-y-1" htmlFor="signup-display-name">
						<span className="text-technical text-muted">Display name</span>
						<input
							id="signup-display-name"
							ref={displayNameRef}
							type="text"
							required
							value={displayName}
							onChange={(e) => setDisplayName(e.target.value)}
							disabled={pending}
							aria-invalid={!!(displayNameError || signUpFormError)}
							aria-describedby={
								signUpFormError
									? "signup-auth-error"
									: displayNameError
										? "signup-display-name-error"
										: undefined
							}
							className="w-full bg-transparent border border-border px-3 py-2 font-sans focus:border-ink outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:opacity-50"
						/>
						{displayNameError ? (
							<span
								id="signup-display-name-error"
								className="text-xs text-danger"
							>
								{displayNameError}
							</span>
						) : null}
					</label>
					<label className="block space-y-1" htmlFor="signup-email">
						<span className="text-technical text-muted">Email</span>
						<input
							id="signup-email"
							ref={emailRef}
							type="email"
							required
							autoComplete="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							disabled={pending}
							aria-invalid={!!(signUpEmailError || signUpFormError)}
							aria-describedby={
								signUpFormError
									? "signup-auth-error"
									: signUpEmailError
										? "signup-email-error"
										: undefined
							}
							className="w-full bg-transparent border border-border px-3 py-2 font-sans focus:border-ink outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:opacity-50"
						/>
						{signUpEmailError ? (
							<span id="signup-email-error" className="text-xs text-danger">
								{signUpEmailError}
							</span>
						) : null}
					</label>
					<div className="space-y-1">
						<span
							className="text-technical text-muted block"
							id="signup-password-label"
						>
							Password
						</span>
						<div className="flex gap-2">
							<input
								id="signup-password"
								ref={passwordRef}
								type={showPassword ? "text" : "password"}
								required
								autoComplete="new-password"
								minLength={8}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								disabled={pending}
								aria-labelledby="signup-password-label"
								aria-invalid={!!(signUpPasswordError || signUpFormError)}
								aria-describedby={
									signUpFormError
										? "signup-auth-error"
										: signUpPasswordError
											? "signup-password-error"
											: "signup-password-hint"
								}
								className="flex-1 min-w-0 bg-transparent border border-border px-3 py-2 font-sans focus:border-ink outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:opacity-50"
							/>
							<button
								type="button"
								aria-pressed={showPassword}
								aria-label={showPassword ? "Hide password" : "Show password"}
								onClick={() => setShowPassword((v) => !v)}
								disabled={pending}
								className="shrink-0 min-h-11 min-w-11 border border-border flex items-center justify-center hover:border-ink disabled:opacity-50"
							>
								{showPassword ? (
									<EyeOff className="h-5 w-5" aria-hidden />
								) : (
									<Eye className="h-5 w-5" aria-hidden />
								)}
							</button>
						</div>
						{signUpPasswordError ? (
							<span id="signup-password-error" className="text-xs text-danger">
								{signUpPasswordError}
							</span>
						) : (
							<p
								id="signup-password-hint"
								className="text-technical text-xs text-muted"
							>
								At least 8 characters.
							</p>
						)}
					</div>
					{errorDetail ? (
						<details className="text-technical text-muted text-xs">
							<summary className="cursor-pointer hover:text-ink">
								Technical details
							</summary>
							<pre className="mt-2 whitespace-pre-wrap break-words">
								{errorDetail}
							</pre>
						</details>
					) : null}
					<button
						type="submit"
						disabled={pending}
						className="w-full border border-accent py-3 min-h-11 text-technical text-accent hover:bg-accent hover:text-bg transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
					>
						{pending ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" aria-hidden />
								Creating…
							</>
						) : (
							"Sign up"
						)}
					</button>
				</form>
				<p className="text-technical text-muted text-center">
					Already have an account?{" "}
					<Link to="/login" className="text-ink hover:underline">
						Sign in
					</Link>
				</p>
				<Link
					to="/"
					className="block text-center text-technical text-muted hover:text-ink"
				>
					← Back to site
				</Link>
			</div>
		</div>
	);
}
