/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Sentry from "@sentry/react";
import { lazy, Suspense } from "react";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "@/src/auth/AuthProvider";
import AppShell from "@/src/components/AppShell";
import { AnalyticsRouteListener } from "@/src/components/analytics-route-listener.tsx";
import { AppErrorFallback } from "@/src/components/app-error-fallback.tsx";
import { ProtectedRoute } from "@/src/components/ProtectedRoute";
import PortalRouteSkeleton from "@/src/components/skeletons/PortalRouteSkeleton";
import { ToastProvider } from "@/src/components/toast/ToastProvider";
import LandingPage from "@/src/pages/LandingPage";
import LoginPage from "@/src/pages/LoginPage";
import ResetPasswordPage from "@/src/pages/ResetPasswordPage";
import SignupPage from "@/src/pages/SignupPage";

const ApplyPage = lazy(() => import("@/src/pages/ApplyPage"));
const ReviewPage = lazy(() => import("@/src/pages/ReviewPage"));
const NetworkPage = lazy(() => import("@/src/pages/NetworkPage"));
const AdminRolesPage = lazy(() => import("@/src/pages/AdminRolesPage"));
const AdminApplicationsPage = lazy(
	() => import("@/src/pages/AdminApplicationsPage"),
);
const AdminReviewsPage = lazy(() => import("@/src/pages/AdminReviewsPage"));
const AdminDirectoryPage = lazy(() => import("@/src/pages/AdminDirectoryPage"));
const AdminNetworkEventsPage = lazy(
	() => import("@/src/pages/AdminNetworkEventsPage"),
);
const PendingPage = lazy(() => import("@/src/pages/PendingPage"));
const BalloonsDemoPage = lazy(() => import("@/src/pages/BalloonsDemoPage"));

export default function App() {
	return (
		<HelmetProvider>
			<Sentry.ErrorBoundary
				fallback={({ error, resetError }) => (
					<AppErrorFallback error={error} resetError={resetError} />
				)}
			>
				<AuthProvider>
					<ToastProvider>
						<BrowserRouter>
							<AnalyticsRouteListener />
							<Suspense fallback={<PortalRouteSkeleton />}>
								<Routes>
									<Route path="/" element={<LandingPage />} />
									<Route path="/login" element={<LoginPage />} />
									<Route path="/signup" element={<SignupPage />} />
									<Route
										path="/reset-password"
										element={<ResetPasswordPage />}
									/>
									<Route path="/balloons-demo" element={<BalloonsDemoPage />} />
									<Route
										path="/pending"
										element={
											<ProtectedRoute>
												<PendingPage />
											</ProtectedRoute>
										}
									/>

									<Route
										element={
											<ProtectedRoute>
												<AppShell />
											</ProtectedRoute>
										}
									>
										<Route path="/apply" element={<ApplyPage />} />
									</Route>

									<Route
										element={
											<ProtectedRoute roles={["reviewer", "admin"]}>
												<AppShell />
											</ProtectedRoute>
										}
									>
										<Route path="/review" element={<ReviewPage />} />
									</Route>

									<Route
										element={
											<ProtectedRoute roles={["alumni", "admin"]}>
												<AppShell />
											</ProtectedRoute>
										}
									>
										<Route path="/network" element={<NetworkPage />} />
									</Route>

									<Route
										element={
											<ProtectedRoute roles={["admin"]}>
												<AppShell />
											</ProtectedRoute>
										}
									>
										<Route path="/admin" element={<AdminRolesPage />} />
										<Route
											path="/admin/applications"
											element={<AdminApplicationsPage />}
										/>
										<Route
											path="/admin/reviews"
											element={<AdminReviewsPage />}
										/>
										<Route
											path="/admin/directory"
											element={<AdminDirectoryPage />}
										/>
										<Route
											path="/admin/network-events"
											element={<AdminNetworkEventsPage />}
										/>
									</Route>

									<Route path="*" element={<Navigate to="/" replace />} />
								</Routes>
							</Suspense>
						</BrowserRouter>
					</ToastProvider>
				</AuthProvider>
			</Sentry.ErrorBoundary>
		</HelmetProvider>
	);
}
