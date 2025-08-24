import { useState } from 'react'; // ✨ 1. Import useState
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

export function EliteSidebar({ activeView, onViewChange }: EliteSidebarProps) {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  // ✨ 2. Add state to manage the collapsed state, defaulting to true (collapsed)
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out",
    });
  };

  const menuItems = [
    // ... (menuItems array remains the same)
    {
      id: 'dashboard',
      label: 'Command Center',
      icon: BarChart3,
      description: 'Real-time security'
    },
    {
      id: 'scanner',
      label: 'Advanced URL & File',
      icon: Search,
      description: 'Advanced threat analysis'
    },
    {
      id: 'community',
      label: 'Community threat',
      icon: Users,
      description: 'Community intelligence'
    },
    {
      id: 'intel',
      label: 'Advanced threat analytics',
      icon: Brain,
      description: 'AI-powered insights'
    },
    {
      id: 'profile',
      label: 'Account & security settings',
      icon: User,
      description: 'Manage your profile'
    }
  ];

  return (
    <Sidebar
      // ✨ 3. Add event handlers and dynamic classes for width and transition
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
      className={`glass border-r border-glass-border transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-80'
      }`}
    >
      <SidebarHeader className="p-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-12 h-12 glass rounded-xl cyber-glow">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          {/* ✨ 4. Conditionally render text to hide it when collapsed */}
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-foreground text-glow">CyberShield AI</h1>
              <p className="text-sm text-muted-foreground">Digital Sovereignty</p>
            </div>
          )}
        </div>
        
        {/* Hide the status box when collapsed for a cleaner look */}
        {!isCollapsed && (
          <div className="mt-4 p-3 glass rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-sm text-success">System Online</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">All shields active</p>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-4">
        <div className="space-y-2">
            {/* ✨ 5. Conditionally render the section header */}
            {!isCollapsed && (
              <div className="px-3 py-2">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
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
                    className={`p-4 rounded-xl transition-all duration-300 ${
                      isActive 
                        ? 'bg-primary/10 border border-primary/30 shadow-glow text-primary' 
                        : 'hover:bg-white/5'
                    }`}
                  >
                    {/* ✨ 6. Adjust layout based on collapsed state */}
                    <div className={flex items-center ${isCollapsed ? 'justify-center' : 'space-x-4'}}>
                      <Icon className={w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}} />
                      {!isCollapsed && (
                        <>
                          <div className="flex-1 text-left">
                            <p className={font-medium ${isActive ? 'text-primary' : 'text-foreground'}}>
                              {item.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                          {isActive && (
                            <Zap className="w-4 h-4 text-primary animate-pulse" />
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
        {/* ✨ 7. Only show the full footer content when expanded */}
        {!isCollapsed ? (
          <div className="glass rounded-xl p-4 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-success rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
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
           // ✨ 8. Show only the logout icon when collapsed
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
  );
}
