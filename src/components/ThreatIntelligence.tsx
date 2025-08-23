import { useState, useEffect } from "react";
import { Brain, Zap, Globe, TrendingUp, AlertCircle, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ThreatIntel {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  source: string;
  confidence: number;
  affected_regions: string[];
  timestamp: string;
  tags: string[];
}

interface AIInsight {
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  confidence: number;
}

const ThreatIntelligence = () => {
  const [threatIntel, setThreatIntel] = useState<ThreatIntel[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadThreatIntelligence = async () => {
      setIsLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setThreatIntel([
        {
          id: '1',
          type: 'Phishing Campaign',
          severity: 'critical',
          description: 'Large-scale phishing campaign targeting cryptocurrency exchanges with fake 2FA bypass pages',
          source: 'CyberShield AI Network',
          confidence: 95,
          affected_regions: ['North America', 'Europe', 'Asia'],
          timestamp: '3 minutes ago',
          tags: ['crypto', 'phishing', '2fa-bypass', 'targeted']
        },
        {
          id: '2',
          type: 'Malware Distribution',
          severity: 'high',
          description: 'New banking trojan variant detected spreading through fake software update notifications',
          source: 'Community Reports',
          confidence: 88,
          affected_regions: ['Europe', 'Australia'],
          timestamp: '18 minutes ago',
          tags: ['banking-trojan', 'fake-updates', 'malware']
        },
        {
          id: '3',
          type: 'Domain Spoofing',
          severity: 'medium',
          description: 'Multiple typosquatting domains registered targeting popular e-commerce platforms',
          source: 'Domain Monitoring',
          confidence: 82,
          affected_regions: ['Global'],
          timestamp: '45 minutes ago',
          tags: ['typosquatting', 'e-commerce', 'domain-abuse']
        },
        {
          id: '4',
          type: 'Social Engineering',
          severity: 'high',
          description: 'Sophisticated tech support scam using AI-generated voices targeting elderly users',
          source: 'User Reports',
          confidence: 76,
          affected_regions: ['North America'],
          timestamp: '1 hour ago',
          tags: ['social-engineering', 'ai-voice', 'elderly-targeting']
        }
      ]);

      setAiInsights([
        {
          title: 'Cryptocurrency Threat Surge',
          description: 'AI analysis detects 300% increase in crypto-related phishing attacks over the past 48 hours',
          impact: 'High risk for cryptocurrency users and exchanges',
          recommendation: 'Enable additional verification for crypto transactions',
          confidence: 94
        },
        {
          title: 'AI-Generated Phishing Content',
          description: 'Machine learning models identify increasing use of AI tools to create convincing phishing emails',
          impact: 'Traditional email filters may be less effective',
          recommendation: 'Implement behavioral analysis and user education programs',
          confidence: 87
        },
        {
          title: 'Mobile Banking Vulnerabilities',
          description: 'Pattern analysis reveals targeting of mobile banking apps through fake security updates',
          impact: 'Mobile users at increased risk of credential theft',
          recommendation: 'Verify all app updates through official stores only',
          confidence: 91
        }
      ]);
      
      setIsLoading(false);
    };

    loadThreatIntelligence();

    const interval = setInterval(() => {
      loadThreatIntelligence();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cyber-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {threatIntel.filter(t => t.severity === 'critical' || t.severity === 'high').length}
            </div>
            <p className="text-xs text-muted-foreground">Critical & High severity</p>
          </CardContent>
        </Card>

        <Card className="cyber-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
            <Brain className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{aiInsights.length}</div>
            <p className="text-xs text-muted-foreground">New intelligence detected</p>
          </CardContent>
        </Card>

        <Card className="cyber-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Global Coverage</CardTitle>
            <Globe className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">187</div>
            <p className="text-xs text-muted-foreground">Countries monitored</p>
          </CardContent>
        </Card>
      </div>

      <Card className="cyber-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <span>AI-Powered Threat Intelligence</span>
            <Badge variant="outline" className="ml-auto">Live Feed</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {threatIntel.map((threat) => (
              <div
                key={threat.id}
                className="p-4 rounded-lg border bg-card/50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${getSeverityColor(threat.severity)}`}>
                      <AlertCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{threat.type}</h4>
                      <p className="text-sm text-muted-foreground">{threat.source} • {threat.timestamp}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getSeverityBadge(threat.severity) as any} className="capitalize">
                      {threat.severity}
                    </Badge>
                    <div className="text-right">
                      <div className="text-sm font-medium">{threat.confidence}%</div>
                      <div className="text-xs text-muted-foreground">confidence</div>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">{threat.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {threat.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Regions: {threat.affected_regions.join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="cyber-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>AI Security Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {aiInsights.map((insight, index) => (
              <div key={index} className="space-y-4 p-4 rounded-lg border bg-card/30">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">{insight.title}</h4>
                  <div className="flex items-center space-x-2">
                    <Progress value={insight.confidence} className="w-16 h-2" />
                    <span className="text-xs text-muted-foreground">{insight.confidence}%</span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">{insight.description}</p>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-xs font-medium text-warning">Impact: </span>
                    <span className="text-xs text-muted-foreground">{insight.impact}</span>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-primary">Recommendation: </span>
                    <span className="text-xs text-muted-foreground">{insight.recommendation}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="cyber-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <span>Community Threat Sharing</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-card/30">
              <div className="text-2xl font-bold text-primary">1,247</div>
              <div className="text-sm text-muted-foreground">Active Contributors</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-card/30">
              <div className="text-2xl font-bold text-primary">5,832</div>
              <div className="text-sm text-muted-foreground">Threats Reported</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-card/30">
              <div className="text-2xl font-bold text-success">98.7%</div>
              <div className="text-sm text-muted-foreground">Accuracy Rate</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-card/30">
              <div className="text-2xl font-bold text-primary">42s</div>
              <div className="text-sm text-muted-foreground">Avg Response Time</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThreatIntelligence;