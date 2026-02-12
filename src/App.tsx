import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { Layout } from "@/components/layout/Layout";
import Index from "./pages/Index";
import Companions from "./pages/Companions";
import CompanionDetail from "./pages/CompanionDetail";
import Chat from "./pages/Chat";
import Stories from "./pages/Stories";
import CreateCompanion from "./pages/CreateCompanion";
import Memories from "./pages/Memories";
import Mood from "./pages/Mood";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/companions" element={<Companions />} />
              <Route path="/companions/:id" element={<CompanionDetail />} />
              <Route path="/stories" element={<Stories />} />
              <Route path="/create" element={<CreateCompanion />} />
              <Route path="/memories" element={<Memories />} />
              <Route path="/mood" element={<Mood />} />
            </Route>
            <Route path="/chat/:id" element={<Chat />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
