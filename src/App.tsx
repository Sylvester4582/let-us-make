import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserProvider } from "@/contexts/UserContext";
import { LeaderboardProvider } from "@/contexts/LeaderboardContext";
import { BenefitsProvider } from "@/contexts/BenefitsContext";
import { AIProvider } from "@/contexts/AIContext";
import { InsuranceProvider } from "@/contexts/InsuranceContext";
import { ChallengesProvider } from "@/contexts/ChallengesContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import UserSync from "@/components/UserSync";
import Dashboard from "./pages/Dashboard";
import Insurance from "./pages/Insurance";
import Challenges from "./pages/Challenges";
import Leaderboard from "./pages/Leaderboard";
import Fitness from "./pages/Fitness";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import { Navigation } from "./components/Navigation";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <UserProvider>
        <UserSync />
        <LeaderboardProvider>
          <BenefitsProvider>
            <InsuranceProvider>
              <ChallengesProvider>
                <AIProvider>
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={
                      <ProtectedRoute>
                        <Navigation>
                          <Dashboard />
                        </Navigation>
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <Navigation>
                          <Dashboard />
                        </Navigation>
                      </ProtectedRoute>
                    } />
                    <Route path="/insurance" element={
                      <ProtectedRoute>
                        <Navigation>
                          <Insurance />
                        </Navigation>
                      </ProtectedRoute>
                    } />
                    <Route path="/challenges" element={
                      <ProtectedRoute>
                        <Navigation>
                          <Challenges />
                        </Navigation>
                      </ProtectedRoute>
                    } />
                    <Route path="/leaderboard" element={
                      <ProtectedRoute>
                        <Navigation>
                          <Leaderboard />
                        </Navigation>
                      </ProtectedRoute>
                    } />
                        <Route path="/fitness" element={
                          <ProtectedRoute>
                            <Navigation>
                              <Fitness />
                            </Navigation>
                          </ProtectedRoute>
                        } />
                        {/* Admin Dashboard - Direct access for admin users */}
                        <Route path="/admin/dashboard" element={
                          <AdminRoute>
                            <AdminDashboard />
                          </AdminRoute>
                        } />
                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </BrowserRouter>
                  </TooltipProvider>
                </AIProvider>
              </ChallengesProvider>
            </InsuranceProvider>
          </BenefitsProvider>
        </LeaderboardProvider>
      </UserProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
