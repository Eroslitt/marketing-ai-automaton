import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { Dashboard } from "./pages/Dashboard";
import { Campaigns } from "./pages/Campaigns";
import { CreateCampaign } from "./pages/CreateCampaign";
import { Creatives } from "./pages/Creatives";
import { Settings } from "./pages/Settings";
import { AgentPrompts } from "./pages/AgentPrompts";
import { Prospects } from "./pages/Prospects";
import { WhatsAppInbox } from "./pages/WhatsAppInbox";
import { CRM } from "./pages/CRM";
import { Integrations } from "./pages/Integrations";
import { AgentWorkflows } from "./pages/AgentWorkflows";
import { UserManagement } from "./pages/UserManagement"; 
import { AgentStudio } from "./pages/AgentStudio";
import { AutomationCenter } from "./pages/AutomationCenter";
import Marketplace from "./pages/Marketplace";
import VideoStudio from "./pages/VideoStudio";
import MLOpsCenter from "./pages/MLOpsCenter";
import IntegrationHub from "./pages/IntegrationHub";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="campaigns" element={<Campaigns />} />
            <Route path="campaigns/new" element={<CreateCampaign />} />
            <Route path="creatives" element={<Creatives />} />
            <Route path="prospects" element={<Prospects />} />
            <Route path="whatsapp" element={<WhatsAppInbox />} />
            <Route path="projects" element={<CRM />} />
            <Route path="analytics" element={<Dashboard />} />
            <Route path="integrations" element={<Integrations />} />
            <Route path="workflows" element={<AgentWorkflows />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="agent-studio" element={<AgentStudio />} />
            <Route path="automation" element={<AutomationCenter />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="video-studio" element={<VideoStudio />} />
            <Route path="mlops" element={<MLOpsCenter />} />
            <Route path="integration-hub" element={<IntegrationHub />} />
            <Route path="settings" element={<Settings />} />
            <Route path="agent-prompts" element={<AgentPrompts />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
