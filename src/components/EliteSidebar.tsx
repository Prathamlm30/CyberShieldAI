import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Shield,
  BarChart3,
  Search,
  Users,
  Brain,
  User,
  LogOut,
  MoreHorizontal
} from 'lucide-react';

interface EliteSidebarProps {
  activeView: string;
  onViewChange: (view: 'dashboard' | 'scanner' | 'community' | 'intel' | 'profile') => void;
}

export const EliteSidebar = ({ activeView, onViewChange }: EliteSidebarProps) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out",
    });
  };

  const menuItems = [
    { id: 'dashboard', label: 'Command Center', icon: BarChart3, description: 'Real-time security overview' },
    { id: 'scanner', label: 'Threat Scanner', icon: Search, description: 'Advanced URL & File analysis' },
    { id: 'community', label: 'Community Intel', icon: Users, description: 'Crowdsourced threat intelligence' },
    { id: 'intel', label: 'AI Analytics', icon: Brain, description: 'AI-powered security insights' },
  ];

  return (
    <div
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
      className={`flex-shrink-0 transition-all duration-300 ease-in-out bg-transparent ${
        isCollapsed ? 'w-20' : 'w-80'
      }`}
    >
      <Sidebar className="h-screen glass border-r border-glass-border flex flex-col">
        <SidebarHeader className="p-4 border-b border-glass-border">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 glass rounded-xl cyber-glow">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div className={`transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
              {/* ✨ CHANGE: Brighter header color */}
              <h1 className="text-xl font-bold text-white text-glow">CyberShield AI</h1>
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                {/* ✨ CHANGE: Brighter status color */}
                <p className="text-xs text-green-500">All Systems Operational</p>
              </div>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-3 py-4 flex-1">
          <TooltipProvider delayDuration={0}>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <SidebarMenuItem key={item.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton
                          onClick={() => onViewChange(item.id as any)}
                          className={`h-12 justify-start rounded-lg transition-all duration-200 text-base font-semibold ${
                            isActive
                              ? 'bg-gradient-to-r from-primary/10 to-primary/5 text-primary shadow-glow border border-primary/20'
                              // ✨ CHANGE: Better contrast for inactive menu items
                              : 'text-slate-400 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <Icon className={`w-6 h-6 flex-shrink-0 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                            <span className={`transition-opacity duration-200 whitespace-nowrap ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                              {item.label}
                            </span>
                          </div>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      {isCollapsed && (
                        <TooltipContent side="right" align="center" className="ml-2">
                          <p>{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </TooltipProvider>
        </SidebarContent>

        <SidebarFooter className="p-3 border-t border-glass-border">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-success flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className={`flex justify-between items-center w-full transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
              <div className="ml-3">
                {/* ✨ CHANGE: Brighter username color */}
                <p className="text-sm font-semibold text-white truncate">
                  {user?.email?.split('@')[0] || 'User'}
                </p>
                {/* ✨ CHANGE: Better contrast for email */}
                <p className="text-xs text-slate-500 truncate">
                  {user?.email}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5" onClick={handleSignOut}>
                <LogOut className="w-5 h-5 text-slate-400"/>
              </Button>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}
