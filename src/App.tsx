import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Tutoriales from "./pages/Tutoriales";
import NotFound from "./pages/NotFound";
// Admin
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminAgentesNew from "./pages/admin/AdminAgentesNew";
import AdminNetwork from "./pages/admin/AdminNetwork";
import AdminTutorials from "./pages/admin/AdminTutorials";
import AdminSettingsNew from "./pages/admin/AdminSettingsNew";
import AdminChatConfig from "./pages/admin/AdminChatConfig";
import AdminContent from "./pages/admin/AdminContent";
import AdminDiagnostics from "./pages/admin/AdminDiagnostics";
// Agent Portal
import AppLogin from "./pages/app/AppLogin";
import AppLayout from "./pages/app/AppLayout";
import AppDashboard from "./pages/app/AppDashboard";
import AppProfile from "./pages/app/AppProfile";
import AppReferrals from "./pages/app/AppReferrals";
import AppLeads from "./pages/app/AppLeads";
import AppTutorials from "./pages/app/AppTutorials";
import AppSubagents from "./pages/app/AppSubagents";
import AppAssets from "./pages/app/AppAssets";
import AppChangePassword from "./pages/app/AppChangePassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/tutoriales" element={<Tutoriales />} />
          
          {/* Agent Portal */}
          <Route path="/login" element={<AppLogin />} />
          <Route path="/app/login" element={<AppLogin />} />
          <Route path="/app/change-password" element={<AppChangePassword />} />
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<AppDashboard />} />
            <Route path="profile" element={<AppProfile />} />
            <Route path="referrals" element={<AppReferrals />} />
            <Route path="leads" element={<AppLeads />} />
            <Route path="tutorials" element={<AppTutorials />} />
            <Route path="subagents" element={<AppSubagents />} />
            <Route path="assets" element={<AppAssets />} />
          </Route>

          {/* Admin Panel */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/*" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="leads" element={<AdminLeads />} />
            <Route path="agentes" element={<AdminAgentesNew />} />
            <Route path="red" element={<AdminNetwork />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="tutoriales" element={<AdminTutorials />} />
            <Route path="chat-config" element={<AdminChatConfig />} />
            <Route path="settings" element={<AdminSettingsNew />} />
            <Route path="diagnostics" element={<AdminDiagnostics />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
