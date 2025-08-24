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
  Zap
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
    { id: 'dashboard', label: 'Command Center', icon: BarChart3, description: 'Real-time security' },
    { id: 'scanner', label: 'Advanced URL & File', icon: Search, description: 'Advanced threat analysis' },
    { id: 'community', label: 'Community threat', icon: Users, description: 'Community intelligence' },
    { id: 'intel', label: 'Advanced threat analytics', icon: Brain, description: 'AI-powered insights' },
    { id: 'profile', label: 'Account & security settings', icon: User, description: 'Manage your profile' }
  ];

  return (
    <div
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
      // ✨ FIX: Increased expanded width for more space
      className={`flex-shrink-0 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-80' 
      }`}
    >
      <Sidebar
        className="h-screen glass border-r border-glass-border"
      >
        <SidebarHeader className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 glass rounded-xl cyber-glow">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-foreground text-glow">CyberShield AI</h1>
                <p className="text-sm text-slate-400">Digital Sovereignty</p>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <div className="mt-4 p-3 glass rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-success">System Online</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">All shields active</p>
            </div>
          )}
        </SidebarHeader>

        <SidebarContent className="px-4">
          <div className="space-y-2">
            {!isCollapsed && (
              <div className="px-3 py-2">
                {/* ✨ FIX: Brighter, bolder heading */}
                <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                  Security Operations
                </h2>
              </div>
            )}

            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onViewChange(item.id as any)}
                      className={`p-3 rounded-xl transition-all duration-300 ${
                        isActive
                          ? 'bg-primary/10 border border-primary/30 shadow-glow text-primary'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-4'}`}>
                        <Icon className={`w-6 h-6 flex-shrink-0 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                        {!isCollapsed && (
                          <>
                            <div className="flex-1 text-left">
                              {/* ✨ FIX: Larger main label */}
                              <p className={`text-base font-semibold ${isActive ? 'text-primary' : 'text-slate-100'}`}>
                                {item.label}
                              </p>
                              {/* ✨ FIX: Larger, brighter description */}
                              <p className="text-sm text-slate-400">
                                {item.description}
                              </p>
                            </div>
                            {isActive && (
                              <Zap className="w-5 h-5 text-primary animate-pulse" />
                            )}
                          </>
                        )}
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </div>
        </SidebarContent>

        <SidebarFooter className="p-4">
          {!isCollapsed ? (
            <div className="glass rounded-xl p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-success rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  {/* ✨ FIX: Larger, brighter username */}
                  <p className="text-sm font-semibold text-slate-100 truncate">
                    {user?.email?.split('@')[0] || 'User'}
                  </p>
                  {/* ✨ FIX: Brighter email */}
                  <p className="text-xs text-slate-400 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="w-full justify-start hover:bg-white/5"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={handleSignOut}
                className="hover:bg-white/5 rounded-xl"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}
