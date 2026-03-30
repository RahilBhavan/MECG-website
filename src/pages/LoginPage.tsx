import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { getPostLoginPath, useAuth } from "@/src/auth/AuthProvider";
import {
	classifyLoginAuthError,
	mapAuthErrorMessage,
} from "@/src/lib/auth-errors";
import { focusFormControl } from "@/src/lib/focus-form-control";
import { prefetchPortalRoute } from "@/src/lib/prefetch-portal";

export default function LoginPage() {
	const {
		user,
		roles,
		signInWithPassword,
		resetPasswordForEmail,
		configured,
		loading,
	} = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const from = (location.state as { from?: string } | null)?.from;

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loginEmailError, setLoginEmailError] = useState<string | null>(null);
	const [loginPasswordError, setLoginPasswordError] = useState<string | null>(
		null,
	);
	const [loginFormError, setLoginFormError] = useState<string | null>(null);
	const [forgotError, setForgotError] = useState<string | null>(null);
	const [errorDetail, setErrorDetail] = useState<string | null>(null);
	const [pending, setPending] = useState(false);
	const [forgotMode, setForgotMode] = useState(false);
	const [forgotSent, setForgotSent] = useState(false);
	const emailRef = useRef<HTMLInputElement>(null);
	const passwordRef = useRef<HTMLInputElement>(null);
	const forgotEmailRef = useRef<HTMLInputElement>(null);

	if (!configured && !loading) {
		return (
			<div className="min-h-screen bg-bg text-ink flex items-center justify-center px-6">
				<p className="text-technical text-muted text-center max-w-md">
					Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable
					sign-in.
				</p>
			</div>
		);
	}

	if (user && !loading) {
		const dest = from && from !== "/login" ? from : getPostLoginPath(roles);
		return <Navigate to={dest} replace />;
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (pending) return;
		setLoginEmailError(null);
		setLoginPasswordError(null);
		setLoginFormError(null);
		setErrorDetail(null);
		setPending(true);
		const { error: err, roles: nextRoles } = await signInWithPassword(
			email.trim(),
			password,
		);
		setPending(false);
		if (err) {
			const { friendly, detail, target } = classifyLoginAuthError(err.message);
			setErrorDetail(detail);
			if (target === "email") setLoginEmailError(friendly);
			else if (target === "password") setLoginPasswordError(friendly);
			else setLoginFormError(friendly);
			window.requestAnimationFrame(() => {
				if (target === "email") focusFormControl(emailRef.current);
				else if (target === "password") focusFormControl(passwordRef.current);
				else focusFormControl(emailRef.current);
			});
			return;
		}
		const dest = from && from !== "/login" ? from : getPostLoginPath(nextRoles);
		prefetchPortalRoute(dest);
		navigate(dest, { replace: true });
	}

	async function handleForgot(e: React.FormEvent) {
		e.preventDefault();
		if (pending) return;
		setForgotError(null);
		setErrorDetail(null);
		setPending(true);
		const redirectTo = `${window.location.origin}/reset-password`;
		const { error: err } = await resetPasswordForEmail(
			email.trim(),
			redirectTo,
		);
		setPending(false);
		if (err) {
			const { friendly, detail } = mapAuthErrorMessage(err.message);
			setForgotError(friendly);
			setErrorDetail(detail);
			window.requestAnimationFrame(() =>
				focusFormControl(forgotEmailRef.current),
			);
			return;
		}
		setForgotSent(true);
	}

	if (forgotMode) {
		return (
			<div className="min-h-screen bg-bg text-ink flex flex-col items-center justify-center px-6">
				<div className="w-full max-w-md rounded-sm border border-border bg-surface/40 p-8 space-y-6">
					<h1 className="type-auth-title">Reset password</h1>
					<p className="text-technical text-muted">
						We&apos;ll email you a link to choose a new password. Add{" "}
						<code className="text-ink">/reset-password</code> to Supabase Auth
						redirect URLs.
					</p>
					{forgotSent ? (
						<p className="text-sm text-success border border-success/50 px-4 py-3">
							If an account exists for that email, you&apos;ll receive a reset
							link shortly.
						</p>
					) : (
						<form onSubmit={(e) => void handleForgot(e)} className="space-y-4">
							<label className="block space-y-1" htmlFor="forgot-email">
								<span className="text-technical text-muted">Email</span>
								<input
									id="forgot-email"
									ref={forgotEmailRef}
									type="email"
									required
									autoComplete="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									disabled={pending}
									aria-invalid={!!forgotError}
									aria-describedby={
										forgotError ? "forgot-email-error" : undefined
									}
									className="w-full bg-transparent border border-border px-3 py-2 font-sans focus:border-ink outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:opacity-50"
								/>
							</label>
							{forgotError ? (
								<p
									id="forgot-email-error"
									className="text-sm text-danger"
									role="alert"
								>
									{forgotError}
								</p>
							) : null}
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
										Sending…
									</>
								) : (
									"Send reset link"
								)}
							</button>
						</form>
					)}
					<button
						type="button"
						onClick={() => {
							setForgotMode(false);
							setForgotSent(false);
							setForgotError(null);
							setErrorDetail(null);
						}}
						className="text-technical text-muted hover:text-ink w-full text-center"
					>
						← Back to sign in
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-bg text-ink flex flex-col items-center justify-center px-6">
			<div className="w-full max-w-md rounded-sm border border-border bg-surface/40 p-8 space-y-6">
				<h1 className="type-auth-title">Sign in</h1>
				<p className="text-technical text-muted">
					Access is controlled by roles assigned in Supabase (applicant, alumni,
					reviewer, admin).
				</p>
				<form
					onSubmit={(e) => void handleSubmit(e)}
					className="space-y-4"
					noValidate
				>
					{loginFormError ? (
						<p
							id="login-auth-error"
							className="text-sm text-danger border border-danger/40 px-3 py-2"
							role="alert"
						>
							{loginFormError}
						</p>
					) : null}
					<label className="block space-y-1" htmlFor="login-email">
						<span className="text-technical text-muted">Email</span>
						<input
							id="login-email"
							ref={emailRef}
							type="email"
							required
							autoComplete="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							disabled={pending}
							aria-invalid={!!(loginEmailError || loginFormError)}
							aria-describedby={
								loginFormError
									? "login-auth-error"
									: loginEmailError
										? "login-email-error"
										: undefined
							}
							className="w-full bg-transparent border border-border px-3 py-2 font-sans focus:border-ink outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:opacity-50"
						/>
						{loginEmailError ? (
							<span id="login-email-error" className="text-xs text-danger">
								{loginEmailError}
							</span>
						) : null}
					</label>
					<div className="space-y-1">
						<span
							className="text-technical text-muted block"
							id="login-password-label"
						>
							Password
						</span>
						<div className="flex gap-2">
							<input
								id="login-password"
								ref={passwordRef}
								type={showPassword ? "text" : "password"}
								required
								autoComplete="current-password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								disabled={pending}
								aria-labelledby="login-password-label"
								aria-invalid={!!(loginPasswordError || loginFormError)}
								aria-describedby={
									loginFormError
										? "login-auth-error"
										: loginPasswordError
											? "login-password-error"
											: undefined
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
						{loginPasswordError ? (
							<span id="login-password-error" className="text-xs text-danger">
								{loginPasswordError}
							</span>
						) : null}
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
								Signing in…
							</>
						) : (
							"Sign in"
						)}
					</button>
				</form>
				<div className="flex flex-col gap-2 text-center text-technical text-sm">
					<button
						type="button"
						onClick={() => {
							setForgotMode(true);
							setLoginEmailError(null);
							setLoginPasswordError(null);
							setLoginFormError(null);
							setErrorDetail(null);
						}}
						className="text-muted hover:text-ink"
					>
						Forgot password?
					</button>
					<p className="text-muted">
						No account?{" "}
						<Link to="/signup" className="text-ink hover:underline">
							Create one
						</Link>
					</p>
				</div>
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
