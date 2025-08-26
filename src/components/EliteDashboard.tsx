import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Scan, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Activity,
  Clock,
  Globe
} from 'lucide-react';

interface DashboardStats {
  totalScans: number;
  threatsBlocked: number;
  trustScore: number;
  recentScans: any[];
}

export function EliteDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalScans: 0,
    threatsBlocked: 0,
    trustScore: 0,
    recentScans: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      // Load user profile stats
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Load recent scan history
      const { data: scans } = await supabase
        .from('scan_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Calculate average trust score
      const avgTrustScore = scans?.length 
        ? Math.round(scans.reduce((sum, scan) => sum + scan.trust_score, 0) / scans.length)
        : 85;

      setStats({
        totalScans: profile?.total_scans || 0,
        threatsBlocked: profile?.threats_blocked || 0,
        trustScore: avgTrustScore,
        recentScans: scans || []
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color, progress }: any) => (
    <Card className="bento-card glass-hover group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl glass flex items-center justify-center ${color === 'primary' ? 'cyber-glow' : ''}`}>
              <Icon className={`w-6 h-6 ${color ? `text-${color}` : 'text-muted-foreground'}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground count-up">{value}</p>
              <p className="text-sm text-muted-foreground">{title}</p>
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          {progress !== undefined && (
            <div className="w-16 h-16">
              <div className="relative w-full h-full">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray={`${progress}, 100`}
                    className="text-primary"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-semibold text-foreground">{progress}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground text-glow">Command Center</h1>
            <p className="text-muted-foreground">Real-time security overview and threat analysis</p>
          </div>
        </div>
        <div className="liquid-grid">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bento-card">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground text-glow">Command Center</h1>
          <p className="text-muted-foreground">Real-time security overview and threat analysis</p>
        </div>
        <Badge className="glass cyber-glow px-4 py-2">
          <Activity className="w-4 h-4 mr-2" />
          All Systems Operational
        </Badge>
      </div>

      {/* Main Stats Grid */}
      <div className="liquid-grid">
        <StatCard
          icon={Scan}
          title="Total Scans"
          value={stats.totalScans}
          subtitle="Lifetime protection"
          color="primary"
        />
        <StatCard
          icon={Shield}
          title="Threats Blocked"
          value={stats.threatsBlocked}
          subtitle="Digital threats neutralized"
          color="success"
        />
        <StatCard
          icon={TrendingUp}
          title="Trust Score"
          value={stats.trustScore}
          subtitle="Average security rating"
          color="warning"
          progress={stats.trustScore}
        />
        <StatCard
          icon={CheckCircle}
          title="Protection Status"
          value="ACTIVE"
          subtitle="Real-time monitoring"
          color="success"
        />
      </div>

      {/* Recent Activity */}
      <div className="liquid-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
        <Card className="bento-card glass-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Clock className="w-5 h-5 text-primary" />
              Recent Scans
            </CardTitle>
            <CardDescription>Latest security assessments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recentScans.length > 0 ? (
              stats.recentScans.map((scan, index) => (
                <div key={scan.id} className="flex items-center justify-between p-3 glass rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full glass flex items-center justify-center ${
                      scan.is_threat ? 'threat-border' : 'success-border'
                    }`}>
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground truncate max-w-[200px]">
                        {new URL(scan.scanned_url).hostname}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(scan.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getThreatColor(scan.threat_level) as any} className="ml-2">
                    {scan.threat_level.toUpperCase()}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Scan className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">No scans yet</p>
                <p className="text-xs text-muted-foreground mt-1">Start scanning to see activity</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bento-card glass-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Threat Landscape
            </CardTitle>
            <CardDescription>Current security environment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-foreground">Phishing Attempts</span>
                <span className="text-sm font-medium text-warning">Medium</span>
              </div>
              <Progress value={65} className="h-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-foreground">Malware Detection</span>
                <span className="text-sm font-medium text-destructive">High</span>
              </div>
              <Progress value={80} className="h-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-foreground">Network Security</span>
                <span className="text-sm font-medium text-success">Low</span>
              </div>
              <Progress value={25} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}