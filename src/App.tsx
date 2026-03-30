/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "@/src/auth/AuthProvider";
import AppShell from "@/src/components/AppShell";
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
const PendingPage = lazy(() => import("@/src/pages/PendingPage"));
const BalloonsDemoPage = lazy(() => import("@/src/pages/BalloonsDemoPage"));

export default function App() {
	return (
		<AuthProvider>
			<ToastProvider>
				<BrowserRouter>
					<Suspense fallback={<PortalRouteSkeleton />}>
						<Routes>
							<Route path="/" element={<LandingPage />} />
							<Route path="/login" element={<LoginPage />} />
							<Route path="/signup" element={<SignupPage />} />
							<Route path="/reset-password" element={<ResetPasswordPage />} />
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
							</Route>

							<Route path="*" element={<Navigate to="/" replace />} />
						</Routes>
					</Suspense>
				</BrowserRouter>
			</ToastProvider>
		</AuthProvider>
	);
}
