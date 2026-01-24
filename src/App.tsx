import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Agente from "./pages/Agente";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminAgentesNew from "./pages/admin/AdminAgentesNew";
import AdminNetwork from "./pages/admin/AdminNetwork";
import AdminAsignacion from "./pages/admin/AdminAsignacion";
import AdminCMS from "./pages/admin/AdminCMS";
import AdminCMSPromos from "./pages/admin/AdminCMSPromos";
import AdminSettingsNew from "./pages/admin/AdminSettingsNew";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/agente" element={<Agente />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/*" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="leads" element={<AdminLeads />} />
            <Route path="agentes" element={<AdminAgentesNew />} />
            <Route path="red" element={<AdminNetwork />} />
            <Route path="asignacion" element={<AdminAsignacion />} />
            <Route path="cms" element={<AdminCMS />} />
            <Route path="cms-promos" element={<AdminCMSPromos />} />
            <Route path="settings" element={<AdminSettingsNew />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
