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

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out",
    });
  };

  // Corrected labels and descriptions to match your UI image
  const menuItems = [
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
    // ✨ FIX: Added the 'glass' class back for the glassmorphism effect
    <Sidebar className="w-80 border-r border-glass-border glass">
      <SidebarHeader className="p-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-12 h-12 glass rounded-xl cyber-glow">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground text-glow">CyberShield AI</h1>
            <p className="text-sm text-muted-foreground">Digital Sovereignty</p>
          </div>
        </div>
        
        <div className="mt-4 p-3 glass rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="text-sm text-success">System Online</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">All shields active</p>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4">
        <div className="space-y-2">
          <div className="px-3 py-2">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Security Operations
            </h2>
          </div>
          
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
                    <div className="flex items-center space-x-4">
                      <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div className="flex-1 text-left">
                        <p className={`font-medium ${isActive ? 'text-primary' : 'text-foreground'}`}>
                          {item.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      {isActive && (
                        <Zap className="w-4 h-4 text-primary animate-pulse" />
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
      </SidebarFooter>
    </Sidebar>
  );
}
