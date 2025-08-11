import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import OAuth2SuccessPage from "./pages/OAuth2SuccessPage";
import MoodDiaryListPage from "./pages/MoodDiaryListPage";
import MoodDiaryWritePage from "./pages/MoodDiaryWritePage";
import MoodDiaryDetailPage from "./pages/MoodDiaryDetailPage";
import MoodDiaryEditPage from "./pages/MoodDiaryEditPage";
import OnboardingPage from "./pages/OnboardingPage";
import SettingsPage from "./pages/SettingsPage";
import TimelinePage from "./pages/TimelinePage";
import NotificationsPage from "./pages/NotificationsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <NotificationProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/login/oauth2/success" element={<OAuth2SuccessPage />} />
              <Route path="/oauth2/redirect" element={<OAuth2SuccessPage />} />
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <OnboardingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/timeline"
                element={
                  <ProtectedRoute>
                    <TimelinePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mood-diaries"
                element={
                  <ProtectedRoute>
                    <MoodDiaryListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mood-diaries/write"
                element={
                  <ProtectedRoute>
                    <MoodDiaryWritePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mood-diaries/:id"
                element={
                  <ProtectedRoute>
                    <MoodDiaryDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mood-diaries/:id/edit"
                element={
                  <ProtectedRoute>
                    <MoodDiaryEditPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
