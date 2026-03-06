import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DebugPanel } from "@/debug/DebugPanel";
import { AuthContextProvider } from "@/contexts/AuthContext";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard";
import PropertyAssessment from "./pages/PropertyAssessment";
import SeasonalCalendar from "./pages/SeasonalCalendar";
import HealthHub from "./pages/HealthHub";
import InventoryManagement from "./pages/InventoryManagement";
import HomesteadBalance from "./pages/HomesteadBalance";
import HomesteadJournal from "./pages/HomesteadJournal";
import HomesteadGoals from "./pages/HomesteadGoals";
import CropPlanner from "./pages/CropPlanner";
import Infrastructure from "./pages/Infrastructure";
import BreedingTracker from "./pages/BreedingTracker";
import StrategicPlanningHub from "./pages/StrategicPlanningHub";
import UserProfile from "./pages/UserProfile";
import Achievements from "./pages/Achievements";
import PraxisLog from "./pages/PraxisLog";
import PraxisTimeline from "./pages/PraxisTimeline";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        <TooltipProvider>
          <BrowserRouter>
            {import.meta.env.DEV && <DebugPanel />}
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth/login" element={<Login />} />

              <Route path="/auth/register" element={<Register />} />

              {/* Backward compatible routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <ProtectedLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/log" element={<PraxisLog />} />
                <Route path="/timeline" element={<PraxisTimeline />} />
                <Route path="/goals" element={<HomesteadGoals />} />
                <Route path="/finance" element={<HomesteadBalance />} />
                <Route path="/journal" element={<HomesteadJournal />} />
                <Route path="/animals" element={<HealthHub />} />
                <Route path="/inventory" element={<InventoryManagement />} />
                <Route path="/property" element={<PropertyAssessment />} />
                <Route path="/calendar" element={<SeasonalCalendar />} />
                <Route path="/infrastructure" element={<Infrastructure />} />
                <Route path="/strategic-planning" element={<StrategicPlanningHub />} />
                <Route path="/breeding" element={<BreedingTracker />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/achievements" element={<Achievements />} />
                <Route path="/crop-planner" element={<CropPlanner />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthContextProvider>
    </QueryClientProvider>
  );
};

export default App;
