
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { AuthProvider } from "./contexts/AuthContext";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import TranscribePage from "./pages/TranscribePage";
import PlayerPage from "./pages/PlayerPage";
import AuthPage from "./pages/AuthPage";
import Privacy from "./pages/Privacy";
import HowItWorks from "./pages/HowItWorks";
import Terms from "./pages/Terms";
import Settings from "./pages/Settings";
import History from "./pages/History";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <SettingsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950 transition-colors">
                <Routes>
                  {/* Player page without header for fullscreen experience */}
                  <Route path="/player" element={<PlayerPage />} />
                  
                  {/* Regular pages with header */}
                  <Route path="/*" element={
                    <>
                      <Header />
                      <main className="min-h-screen">
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/transcribe" element={
                            <ProtectedRoute>
                              <TranscribePage />
                            </ProtectedRoute>
                          } />
                          <Route path="/history" element={
                            <ProtectedRoute>
                              <History />
                            </ProtectedRoute>
                          } />
                          <Route path="/settings" element={
                            <ProtectedRoute>
                              <Settings />
                            </ProtectedRoute>
                          } />
                          <Route path="/auth" element={<AuthPage />} />
                          <Route path="/privacy" element={<Privacy />} />
                          <Route path="/how-it-works" element={<HowItWorks />} />
                          <Route path="/terms" element={<Terms />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </main>
                    </>
                  } />
                </Routes>
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
