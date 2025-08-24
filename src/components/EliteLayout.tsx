import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar, SidebarContent, SidebarProvider } from '@/components/ui/sidebar';
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
      <div className="min-h-screen flex w-full space-bg">
        <EliteSidebar activeView={activeView} onViewChange={setActiveView} />
        
        {/* ✨ FINAL CHANGE: Added min-w-0 to allow the main content to shrink */}
        <main className="flex-1 overflow-hidden min-w-0">
          <div className="h-full p-6">
            <div className="max-w-7xl mx-auto h-full">
              {renderActiveView()}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default EliteLayout;
