import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { DailyLogPage } from "@/pages/DailyLogPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { LoginPage } from "@/pages/LoginPage";
import { PendingPage } from "@/pages/PendingPage";
import { WeeklyPlanPage } from "@/pages/WeeklyPlanPage";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/planejamento" element={<WeeklyPlanPage />} />
          <Route path="/diario" element={<DailyLogPage />} />
          <Route path="/pendencias" element={<PendingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/planejamento" replace />} />
    </Routes>
  );
}
