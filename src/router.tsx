import { createBrowserRouter, Navigate, type RouteObject } from "react-router"

import { routes } from "@/config/routes"
import ConfirmPasswordContainer from "@/features/auth/confirm-password/containers/ConfirmPasswordContainer"
import ForgotPasswordContainer from "@/features/auth/forgot-password/containers/ForgotPasswordContainer"
import LoginContainer from "@/features/auth/login/containers/LoginContainer"
import RegisterContainer from "@/features/auth/register/containers/RegisterContainer"
import ResetPasswordContainer from "@/features/auth/reset-password/containers/ResetPasswordContainer"
import TwoFactorChallengeContainer from "@/features/auth/two-factor-challenge/containers/TwoFactorChallengeContainer"
import VerifyEmailContainer from "@/features/auth/verify-email/containers/VerifyEmailContainer"
import DashboardContainer from "@/features/dashboard/containers/DashboardContainer"
import AppearanceSettings from "@/features/settings/components/AppearanceSettings"
import ProfileSettings from "@/features/settings/components/ProfileSettings"
import SecuritySettings from "@/features/settings/components/SecuritySettings"
import SettingsContainer from "@/features/settings/containers/SettingsContainer"
import { AuthLayout } from "@/layouts/auth-layout"
import { DashboardLayout } from "@/layouts/dashboard-layout"
import { RootLayout } from "@/layouts/root-layout"
import { NotFoundPage } from "@/pages/not-found-page"
import { PlaceholderPage } from "@/pages/placeholder-page"
import { RouteErrorPage } from "@/pages/route-error-page"

// No API yet, so nothing is guarded: every screen is reachable and the auth
// buttons simply navigate. Add route guards here once there's a session.
export const appRoutes: RouteObject[] = [
  {
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { path: routes.home, element: <Navigate to={routes.login} replace /> },
      {
        element: <AuthLayout />,
        children: [
          { path: routes.login, element: <LoginContainer /> },
          { path: routes.register, element: <RegisterContainer /> },
          {
            path: routes.forgotPassword,
            element: <ForgotPasswordContainer />,
          },
          { path: routes.resetPassword, element: <ResetPasswordContainer /> },
          { path: routes.verifyEmail, element: <VerifyEmailContainer /> },
          {
            path: routes.twoFactorChallenge,
            element: <TwoFactorChallengeContainer />,
          },
          {
            path: routes.confirmPassword,
            element: <ConfirmPasswordContainer />,
          },
        ],
      },
      {
        element: <DashboardLayout />,
        children: [
          { path: routes.dashboard, element: <DashboardContainer /> },
          {
            path: routes.analytics,
            element: <PlaceholderPage title="Analytics" />,
          },
          {
            path: routes.reports,
            element: <PlaceholderPage title="Reports" />,
          },
          {
            path: routes.projects,
            element: <PlaceholderPage title="Projects" />,
          },
          {
            path: routes.archivedProjects,
            element: <PlaceholderPage title="Archived projects" />,
          },
          { path: routes.team, element: <PlaceholderPage title="Team" /> },
          {
            path: routes.invitations,
            element: <PlaceholderPage title="Invitations" />,
          },
          {
            path: routes.settings,
            element: <SettingsContainer />,
            children: [
              {
                index: true,
                element: <Navigate to={routes.profile} replace />,
              },
              { path: routes.profile, element: <ProfileSettings /> },
              { path: routes.security, element: <SecuritySettings /> },
              { path: routes.appearance, element: <AppearanceSettings /> },
            ],
          },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
]

export const router = createBrowserRouter(appRoutes)
