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
        
        {/* ✨ FIX: Restructured main content area for proper padding and centering */}
        <main className="flex-1 min-w-0 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default EliteLayout;
