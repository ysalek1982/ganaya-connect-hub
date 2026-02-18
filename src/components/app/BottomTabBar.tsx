import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Link as LinkIcon, Users, User, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';

const BottomTabBar = () => {
  const location = useLocation();
  const { isAdmin, isLineLeader, isAgent, userData } = useFirebaseAuth();

  const isActive = (path: string, exact = false) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  const mainTabs = [
    { path: '/app', icon: LayoutDashboard, label: 'Inicio', exact: true },
    { path: '/app/referrals', icon: LinkIcon, label: 'Links' },
    { path: '/app/leads', icon: Users, label: 'Leads' },
    { path: '/app/profile', icon: User, label: 'Perfil' },
  ];

  const showSubagents = isAdmin || isLineLeader || (isAgent && userData?.canRecruitSubagents);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/50 safe-area-pb">
      <div className="flex items-center justify-around h-14 px-1">
        {mainTabs.map((tab) => {
          const active = isActive(tab.path, tab.exact);
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                isActive('/app/tutorials') || isActive('/app/subagents') || isActive('/app/assets')
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              <MoreHorizontal className="w-5 h-5" />
              <span className="text-[10px] font-medium">Más</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="mb-2">
            <DropdownMenuItem asChild>
              <Link to="/app/tutorials">📚 Tutoriales</Link>
            </DropdownMenuItem>
            {showSubagents && (
              <DropdownMenuItem asChild>
                <Link to="/app/subagents">👥 Subagentes</Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
              <Link to="/app/assets">📁 Recursos</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default BottomTabBar;
