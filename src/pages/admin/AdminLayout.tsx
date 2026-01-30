import { useEffect, useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Settings, 
  LogOut, 
  Menu,
  X,
  Shuffle,
  Network,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userData, loading, signOut, isAdmin, isLineLeader, isAgent } = useFirebaseAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/admin');
        return;
      }

      // Allow admin, line_leader, and agent roles
      const allowedRoles = ['ADMIN', 'LINE_LEADER', 'AGENT'];
      if (!userData?.role || !allowedRoles.includes(userData.role)) {
        signOut();
        navigate('/admin');
      }
    }
  }, [user, userData, loading, navigate, signOut]);

  const handleLogout = async () => {
    await signOut();
    toast.success('Sesión cerrada');
    navigate('/admin');
  };

  const navItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/leads', icon: Users, label: 'Postulaciones' },
    { path: '/admin/agentes', icon: UserCheck, label: 'Agentes' },
    { path: '/admin/red', icon: Network, label: 'Red' },
    { path: '/admin/asignacion', icon: Shuffle, label: 'Asignación' },
    { path: '/admin/chat-config', icon: MessageSquare, label: 'Chat Config' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="spinner w-8 h-8 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed md:relative z-50 w-64 h-screen bg-sidebar border-r border-sidebar-border transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
            <Link to="/admin/dashboard" className="font-display text-xl font-bold">
              <span className="text-gradient-primary">Ganaya</span><span className="text-muted-foreground">.admin</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-sidebar-border">
            <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 min-h-screen">
        {/* Mobile header */}
        <header className="md:hidden p-4 border-b border-border flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-display font-bold">
            <span className="text-gradient-primary">Ganaya</span>.admin
          </span>
          <div className="w-6" />
        </header>

        <div className="p-4 md:p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
