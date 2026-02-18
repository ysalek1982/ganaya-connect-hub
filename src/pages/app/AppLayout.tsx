import { useEffect, useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Link as LinkIcon, 
  Users, 
  UserPlus, 
  FileText, 
  LogOut, 
  Menu,
  X,
  User,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userData, loading, signOut, isAdmin, isLineLeader, isAgent, needsPasswordReset } = useFirebaseAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      navigate('/login');
      return;
    }
    
    // Force password change if needed
    if (!loading && user && needsPasswordReset) {
      navigate('/app/change-password');
    }
  }, [user, loading, needsPasswordReset, navigate]);

  const handleLogout = async () => {
    await signOut();
    toast.success('Sesión cerrada');
    navigate('/login');
  };

  // Build nav items based on role
  const getNavItems = () => {
    const items = [
      { path: '/app', icon: LayoutDashboard, label: 'Dashboard', exact: true },
      { path: '/app/profile', icon: User, label: 'Mi Perfil' },
      { path: '/app/referrals', icon: LinkIcon, label: 'Mis Links' },
      { path: '/app/leads', icon: Users, label: 'Mis Leads' },
      { path: '/app/tutorials', icon: BookOpen, label: 'Tutoriales' },
    ];

    // Show subagents if admin, line_leader, or agent with permission
    if (isAdmin || isLineLeader || (isAgent && userData?.canRecruitSubagents)) {
      items.push({ path: '/app/subagents', icon: UserPlus, label: 'Subagentes' });
    }

    items.push({ path: '/app/assets', icon: FileText, label: 'Recursos' });

    return items;
  };

  const navItems = getNavItems();

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
            <Link to="/app" className="font-display text-xl font-bold">
              <span className="text-gradient-primary">Ganaya</span><span className="text-muted-foreground">.app</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Agent Info */}
          {userData && (
            <div className="p-4 border-b border-sidebar-border">
              <p className="font-medium text-sm truncate">{userData.name}</p>
              {userData.refCode && (
                <code className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded mt-1 inline-block">
                  {userData.refCode}
                </code>
              )}
            </div>
          )}

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = item.exact 
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-primary'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-sidebar-border space-y-2">
            {isAdmin && (
              <Link to="/admin/dashboard">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  Panel Admin
                </Button>
              </Link>
            )}
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
        <header className="md:hidden sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border/50 px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-display font-bold text-base">
            <span className="text-gradient-primary">Ganaya</span>.app
          </span>
          {/* Ref code badge */}
          {userData?.refCode && (
            <code className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded font-mono">
              {userData.refCode}
            </code>
          )}
        </header>

        <div className="p-4 md:p-8 pb-24 md:pb-8">
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

export default AppLayout;
