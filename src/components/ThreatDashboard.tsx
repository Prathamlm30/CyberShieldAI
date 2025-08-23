import { useState, useEffect } from "react";
import { Shield, AlertTriangle, TrendingUp, Eye, Clock, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ThreatMetrics {
  total_scans: number;
  threats_blocked: number;
  phishing_attempts: number;
  malware_detected: number;
  trust_score_avg: number;
  active_monitors: number;
}

interface RecentThreat {
  id: string;
  url: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
  blocked: boolean;
}

const ThreatDashboard = () => {
  const [metrics, setMetrics] = useState<ThreatMetrics>({
    total_scans: 0,
    threats_blocked: 0,
    phishing_attempts: 0,
    malware_detected: 0,
    trust_score_avg: 0,
    active_monitors: 0
  });

  const [recentThreats, setRecentThreats] = useState<RecentThreat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading real-time data
    const loadDashboardData = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock real-time metrics
      setMetrics({
        total_scans: 15847,
        threats_blocked: 342,
        phishing_attempts: 128,
        malware_detected: 89,
        trust_score_avg: 87,
        active_monitors: 12
      });

      // Mock recent threats
      setRecentThreats([
        {
          id: '1',
          url: 'phishing-bank-login.com',
          type: 'Phishing',
          severity: 'high',
          timestamp: '2 min ago',
          blocked: true
        },
        {
          id: '2',
          url: 'suspicious-crypto-site.net',
          type: 'Scam',
          severity: 'high',
          timestamp: '5 min ago',
          blocked: true
        },
        {
          id: '3',
          url: 'fake-shopping.org',
          type: 'Fraud',
          severity: 'medium',
          timestamp: '12 min ago',
          blocked: true
        },
        {
          id: '4',
          url: 'malware-download.xyz',
          type: 'Malware',
          severity: 'high',
          timestamp: '18 min ago',
          blocked: true
        },
        {
          id: '5',
          url: 'suspicious-ad-network.com',
          type: 'Suspicious',
          severity: 'low',
          timestamp: '25 min ago',
          blocked: false
        }
      ]);
      
      setIsLoading(false);
    };

    loadDashboardData();
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        total_scans: prev.total_scans + Math.floor(Math.random() * 3) + 1,
        threats_blocked: prev.threats_blocked + (Math.random() > 0.8 ? 1 : 0)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-warning/20 text-warning border-warning/30';
      case 'medium': return 'bg-warning/30 text-warning border-warning/50';
      case 'high': return 'bg-destructive/20 text-destructive border-destructive/30';
      default: return 'bg-secondary/20 text-secondary-foreground border-secondary/30';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="cyber-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans Today</CardTitle>
            <Eye className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{metrics.total_scans.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="success-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threats Blocked</CardTitle>
            <Shield className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{metrics.threats_blocked}</div>
            <p className="text-xs text-muted-foreground">
              +8% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="threat-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phishing Attempts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{metrics.phishing_attempts}</div>
            <p className="text-xs text-muted-foreground">
              -15% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="threat-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Malware Detected</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{metrics.malware_detected}</div>
            <p className="text-xs text-muted-foreground">
              -5% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="cyber-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Trust Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{metrics.trust_score_avg}%</div>
            <Progress value={metrics.trust_score_avg} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="cyber-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Monitors</CardTitle>
            <Globe className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{metrics.active_monitors}</div>
            <p className="text-xs text-muted-foreground">
              Real-time protection active
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="cyber-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-primary" />
            <span>Recent Threat Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentThreats.map((threat) => (
              <div
                key={threat.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card/50"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${getSeverityColor(threat.severity)}`}>
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{threat.url}</p>
                    <p className="text-sm text-muted-foreground">{threat.type} • {threat.timestamp}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={threat.severity === 'high' ? 'destructive' : threat.severity === 'medium' ? 'secondary' : 'outline'}
                    className="capitalize"
                  >
                    {threat.severity}
                  </Badge>
                  <Badge variant={threat.blocked ? 'default' : 'secondary'}>
                    {threat.blocked ? 'Blocked' : 'Monitored'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThreatDashboard;