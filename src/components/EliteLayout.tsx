import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import { EliteSidebar } from '@/components/EliteSidebar';
import { EliteDashboard } from '@/components/EliteDashboard';
import { EliteScanner } from '@/components/EliteScanner';
import { EliteCommunity } from '@/components/EliteCommunity';
import { EliteThreatIntel } from '@/components/EliteThreatIntel';
import { EliteProfile } from '@/components/EliteProfile';

type ViewType = 'dashboard' | 'scanner' | 'community' | 'intel' | 'profile';

const EliteLayout = () => {
  const { user, loading } = useAuth();
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  // ✨ 1. State is now managed here, in the parent component.
  const [isCollapsed, setIsCollapsed] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center space-bg">
        <div className="glass bento-card">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-foreground">Initializing CyberShield AI...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <EliteDashboard />;
      case 'scanner':
        return <EliteScanner />;
      case 'community':
        return <EliteCommunity />;
      case 'intel':
        return <EliteThreatIntel />;
      case 'profile':
        return <EliteProfile />;
      default:
        return <EliteDashboard />;
    }
  };

  return (
    <SidebarProvider>
      {/* ✨ 2. The flex class is removed from this container. */}
      <div className="min-h-screen w-full space-bg">
        {/* ✨ 3. The state and setter are passed down to the sidebar. */}
        <EliteSidebar 
          activeView={activeView} 
          onViewChange={setActiveView}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed} 
        />
        
        {/* ✨ 4. The main content now has dynamic padding-left. */}
        <main className={`transition-all duration-300 ease-in-out p-8 ${isCollapsed ? 'pl-20' : 'pl-80'}`}>
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default EliteLayout;


