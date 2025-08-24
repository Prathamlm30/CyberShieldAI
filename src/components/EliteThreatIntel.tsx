import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Shield, 
  Globe,
  Zap,
  Target,
  Activity,
  BarChart3
} from 'lucide-react';

export function EliteThreatIntel() {
  // Mock data for demonstration
  const threatStats = {
    globalThreats: 1247382,
    blockedToday: 15847,
    phishingAttempts: 2847,
    malwareDetected: 1205,
    emergingThreats: 47
  };

  const topThreats = [
    { name: 'Cryptocurrency Phishing', count: 12420, trend: '+15%', severity: 'high' },
    { name: 'Banking Trojans', count: 8934, trend: '+8%', severity: 'high' },
    { name: 'Ransomware Variants', count: 5621, trend: '-3%', severity: 'high' },
    { name: 'Social Engineering', count: 4387, trend: '+22%', severity: 'medium' },
    { name: 'Supply Chain Attacks', count: 1849, trend: '+45%', severity: 'high' }
  ];

  const regions = [
    { name: 'North America', threats: 34.2, change: '+2.1%' },
    { name: 'Europe', threats: 28.7, change: '-1.3%' },
    { name: 'Asia Pacific', threats: 21.5, change: '+4.7%' },
    { name: 'South America', threats: 9.4, change: '+1.8%' },
    { name: 'Africa', threats: 6.2, change: '+3.2%' }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground text-glow">AI Analysis</h1>
          <p className="text-muted-foreground">Advanced threat intelligence and predictive analytics</p>
        </div>
        <Badge className="glass cyber-glow px-4 py-2">
          <Brain className="w-4 h-4 mr-2" />
          AI-Powered Intel
        </Badge>
      </div>

      {/* Global Threat Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bento-card glass-hover">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg glass cyber-glow flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground count-up">{threatStats.globalThreats.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Global Threats</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bento-card glass-hover">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg glass flex items-center justify-center">
                <Shield className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground count-up">{threatStats.blockedToday.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Blocked Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bento-card glass-hover">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg glass flex items-center justify-center">
                <Target className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground count-up">{threatStats.phishingAttempts.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Phishing</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bento-card glass-hover">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg glass flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground count-up">{threatStats.malwareDetected.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Malware</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bento-card glass-hover">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg glass flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground count-up">{threatStats.emergingThreats}</p>
                <p className="text-xs text-muted-foreground">Emerging</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Threat Categories */}
        <Card className="bento-card glass-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <BarChart3 className="w-5 h-5 text-primary" />
              Top Threat Categories
            </CardTitle>
            <CardDescription>Most active threats in the past 24 hours</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topThreats.map((threat, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{threat.name}</span>
                    <Badge variant={getSeverityColor(threat.severity) as any} className="text-xs">
                      {threat.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-foreground">{threat.count.toLocaleString()}</span>
                    <span className={`text-xs ${threat.trend.startsWith('+') ? 'text-destructive' : 'text-success'}`}>
                      {threat.trend}
                    </span>
                  </div>
                </div>
                <Progress 
                  value={(threat.count / topThreats[0].count) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Regional Threat Distribution */}
        <Card className="bento-card glass-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Globe className="w-5 h-5 text-primary" />
              Regional Distribution
            </CardTitle>
            <CardDescription>Threat activity by geographic region</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {regions.map((region, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{region.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground">{region.threats}%</span>
                    <span className={`text-xs ${region.change.startsWith('+') ? 'text-destructive' : 'text-success'}`}>
                      {region.change}
                    </span>
                  </div>
                </div>
                <Progress value={region.threats} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="bento-card glass-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Brain className="w-5 h-5 text-primary" />
            AI-Powered Insights
          </CardTitle>
          <CardDescription>Machine learning analysis and predictions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="text-sm font-medium text-foreground">Prediction Accuracy</span>
              </div>
              <p className="text-2xl font-bold text-success">97.3%</p>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </div>

            <div className="glass rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Response Time</span>
              </div>
              <p className="text-2xl font-bold text-primary">0.3ms</p>
              <p className="text-xs text-muted-foreground">Average detection</p>
            </div>

            <div className="glass rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-warning" />
                <span className="text-sm font-medium text-foreground">False Positives</span>
              </div>
              <p className="text-2xl font-bold text-warning">0.02%</p>
              <p className="text-xs text-muted-foreground">Industry leading</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Recent AI Analysis</h4>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 glass rounded-lg">
                <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center mt-1">
                  <Brain className="w-4 h-4 text-success" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Emerging Threat Pattern Detected</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    AI identified a new phishing campaign targeting cryptocurrency exchanges. 
                    Pattern recognition confidence: 94.7%
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">2 minutes ago</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 glass rounded-lg">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Threat Trend Analysis</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Predicted 23% increase in social engineering attacks targeting remote workers 
                    over the next 7 days.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">15 minutes ago</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 glass rounded-lg">
                <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center mt-1">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Anomaly Detection</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Unusual traffic patterns detected from Eastern European IP ranges. 
                    Recommended security level increased.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">1 hour ago</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}