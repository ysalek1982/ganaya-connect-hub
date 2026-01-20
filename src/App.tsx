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
import AdminLeadsClientes from "./pages/admin/AdminLeadsClientes";
import AdminLeadsAgentes from "./pages/admin/AdminLeadsAgentes";
import AdminAgentes from "./pages/admin/AdminAgentes";
import AdminAsignacion from "./pages/admin/AdminAsignacion";
import AdminCMS from "./pages/admin/AdminCMS";
import AdminCMSPromos from "./pages/admin/AdminCMSPromos";
import AdminSettings from "./pages/admin/AdminSettings";

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
            <Route path="leads-clientes" element={<AdminLeadsClientes />} />
            <Route path="leads-agentes" element={<AdminLeadsAgentes />} />
            <Route path="agentes" element={<AdminAgentes />} />
            <Route path="asignacion" element={<AdminAsignacion />} />
            <Route path="cms" element={<AdminCMS />} />
            <Route path="cms-promos" element={<AdminCMSPromos />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
