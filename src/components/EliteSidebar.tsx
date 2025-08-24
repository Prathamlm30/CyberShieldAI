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
    // ✨ CHANGE: Wrapper div is wider when collapsed for better icon spacing.
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
            {/* ✨ CHANGE: Text now fades in and out smoothly. */}
            <div className={`transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
              <h1 className="text-xl font-bold text-brown-600 text-slate-100 text-glow">CyberShield AI</h1>
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-xs text-green-400">All Systems Operational</p>
              </div>
            </div>
          </div>
        </SidebarHeader>

        {/* ✨ CHANGE: Main content area is now flexible to push the footer down. */}
        <SidebarContent className="px-3 py-4 flex-1 text-brown-600">
          <TooltipProvider delayDuration={0}>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <SidebarMenuItem key={item.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {/* ✨ CHANGE: Redesigned menu buttons with better styling, single label, and clearer active/hover states. */}
                        <SidebarMenuButton
                          onClick={() => onViewChange(item.id as any)}
                          className={`h-12 justify-start rounded-lg transition-all duration-200 text-base font-semibold ${
                            isActive
                              ? 'bg-gradient-to-r from-primary/10 to-primary/5 text-primary shadow-glow border border-primary/20'
                              : 'text-slate-300 hover:bg-white/5 hover:text-white'
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
                      {/* ✨ CHANGE: Tooltip only appears when collapsed to provide extra info without clutter. */}
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

        {/* ✨ CHANGE: Redesigned, visually separated footer with a professional layout. */}
        <SidebarFooter className="p-3 border-t border-glass-border">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-success flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className={`flex justify-between items-center w-full transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
              <div className="ml-3">
                <p className="text-sm text-brown-400 font-semibold text-slate-100 truncate">
                  {user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-brown-400 text-slate-400 truncate">
                  {user?.email}
                </p>
              </div>
              <Button variant="ghost" text-brown-400 size="icon" className="rounded-full hover:bg-white/5" onClick={handleSignOut}>
                <LogOut className="w-5 h-5 text-slate-400"/>
              </Button>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}


