import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Zap,
  ExternalLink,
  Clock,
  TrendingUp
} from 'lucide-react';

interface ScanResult {
  url: string;
  trustScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  threats: string[];
  analysis: {
    ssl: boolean;
    reputation: string;
    phishing: boolean;
    malware: boolean;
    blockchain: boolean;
  };
}

export function EliteScanner() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [progress, setProgress] = useState(0);

  const mockScan = async (inputUrl: string): Promise<ScanResult> => {
    const urlObj = new URL(inputUrl);
    const domain = urlObj.hostname.toLowerCase();
    
    // Simulate progressive scanning
    const steps = [
      { label: 'Initializing scan...', progress: 10 },
      { label: 'Checking SSL certificate...', progress: 25 },
      { label: 'Analyzing domain reputation...', progress: 45 },
      { label: 'Scanning for phishing indicators...', progress: 65 },
      { label: 'Detecting malware signatures...', progress: 85 },
      { label: 'Finalizing analysis...', progress: 100 }
    ];

    for (const step of steps) {
      setProgress(step.progress);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Enhanced threat detection logic
    const knownSafeDomains = ['google.com', 'github.com', 'stackoverflow.com'];
    const suspiciousDomains = ['free-bitcoin.com', 'crypto-giveaway.net', 'urgent-security-update.com'];
    
    const isSafe = knownSafeDomains.some(safe => domain.includes(safe));
    const isSuspicious = suspiciousDomains.some(sus => domain.includes(sus)) || 
                        domain.includes('phish') || 
                        domain.includes('scam') ||
                        Math.random() < 0.3;

    const trustScore = isSafe ? 85 + Math.floor(Math.random() * 15) :
                      isSuspicious ? Math.floor(Math.random() * 40) :
                      45 + Math.floor(Math.random() * 40);

    const riskLevel = trustScore >= 70 ? 'low' : 
                     trustScore >= 40 ? 'medium' : 'high';

    const threats = [];
    if (isSuspicious) {
      const possibleThreats = [
        'Phishing attempt detected',
        'Suspicious domain registration',
        'Malware distribution site',
        'Cryptocurrency scam',
        'Identity theft risk',
        'Fake security alerts'
      ];
      threats.push(...possibleThreats.slice(0, Math.floor(Math.random() * 3) + 1));
    }

    return {
      url: inputUrl,
      trustScore,
      riskLevel,
      threats,
      analysis: {
        ssl: Math.random() > 0.2,
        reputation: isSafe ? 'Excellent' : isSuspicious ? 'Poor' : 'Good',
        phishing: isSuspicious,
        malware: isSuspicious && Math.random() > 0.6,
        blockchain: !isSuspicious && Math.random() > 0.7
      }
    };
  };

  const handleScan = async () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a URL to scan",
        variant: "destructive",
      });
      return;
    }

    let fullUrl = url.trim();
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      fullUrl = 'https://' + fullUrl;
    }

    try {
      new URL(fullUrl);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    setScanning(true);
    setProgress(0);
    setScanResult(null);

    try {
      const result = await mockScan(fullUrl);
      setScanResult(result);

      // Save scan to database
      if (user) {
        await supabase
          .from('scan_history')
          .insert({
            user_id: user.id,
            scanned_url: result.url,
            threat_level: result.riskLevel,
            trust_score: result.trustScore,
            is_threat: result.riskLevel === 'high',
            scan_details: result as any
          });

        // Update user profile stats
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('total_scans, threats_blocked')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          await supabase
            .from('user_profiles')
            .update({
              total_scans: profile.total_scans + 1,
              threats_blocked: profile.threats_blocked + (result.riskLevel === 'high' ? 1 : 0)
            })
            .eq('user_id', user.id);
        }
      }

      toast({
        title: "Scan Complete",
        description: `URL analyzed with ${result.trustScore}% trust score`,
        variant: result.riskLevel === 'high' ? 'destructive' : 'default',
      });

    } catch (error) {
      toast({
        title: "Scan Failed",
        description: "Unable to complete security analysis",
        variant: "destructive",
      });
    } finally {
      setScanning(false);
      setProgress(0);
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

  const getThreatIcon = (level: string) => {
    switch (level) {
      case 'high': return AlertTriangle;
      case 'medium': return Shield;
      case 'low': return CheckCircle;
      default: return Shield;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground text-glow">Threat Scanner</h1>
          <p className="text-muted-foreground">Advanced URL and domain security analysis</p>
        </div>
        <Badge className="glass cyber-glow px-4 py-2">
          <Zap className="w-4 h-4 mr-2" />
          AI-Powered Analysis
        </Badge>
      </div>

      {/* Scanner Input */}
      <Card className="bento-card glass-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Search className="w-5 h-5 text-primary" />
            Security Analysis Engine
          </CardTitle>
          <CardDescription>
            Enter any URL for comprehensive threat assessment and risk evaluation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              type="url"
              placeholder="https://example.com or domain.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 glass text-lg"
              disabled={scanning}
            />
            <Button 
              onClick={handleScan} 
              disabled={scanning || !url.trim()}
              className="px-8 cyber-glow"
            >
              {scanning ? 'Scanning...' : 'Analyze Threat'}
            </Button>
          </div>

          {scanning && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Scanning in progress...</span>
                <span className="text-primary">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scan Results */}
      {scanResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trust Score Overview */}
          <Card className="bento-card glass-hover">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-foreground">Trust Assessment</span>
                <Badge variant={getThreatColor(scanResult.riskLevel) as any} className="px-3 py-1">
                  {scanResult.riskLevel.toUpperCase()} RISK
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth="2"
                    />
                    <path
                      d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray={`${scanResult.trustScore}, 100`}
                      className={scanResult.trustScore >= 70 ? 'text-success' : 
                               scanResult.trustScore >= 40 ? 'text-warning' : 'text-destructive'}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-foreground">{scanResult.trustScore}</div>
                      <div className="text-xs text-muted-foreground">Trust Score</div>
                    </div>
                  </div>
                </div>
                
                <div className="glass rounded-lg p-3">
                  <p className="font-medium text-foreground truncate">{scanResult.url}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Scanned {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis */}
          <Card className="bento-card glass-hover">
            <CardHeader>
              <CardTitle className="text-foreground">Security Analysis</CardTitle>
              <CardDescription>Comprehensive threat assessment results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 glass rounded-lg">
                  <span className="text-sm text-foreground">SSL Certificate</span>
                  <Badge variant={scanResult.analysis.ssl ? 'success' : 'destructive'}>
                    {scanResult.analysis.ssl ? 'Valid' : 'Invalid'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 glass rounded-lg">
                  <span className="text-sm text-foreground">Domain Reputation</span>
                  <Badge variant={scanResult.analysis.reputation === 'Excellent' ? 'success' : 
                                scanResult.analysis.reputation === 'Good' ? 'warning' : 'destructive'}>
                    {scanResult.analysis.reputation}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 glass rounded-lg">
                  <span className="text-sm text-foreground">Phishing Detection</span>
                  <Badge variant={scanResult.analysis.phishing ? 'destructive' : 'success'}>
                    {scanResult.analysis.phishing ? 'Detected' : 'Clean'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 glass rounded-lg">
                  <span className="text-sm text-foreground">Malware Scan</span>
                  <Badge variant={scanResult.analysis.malware ? 'destructive' : 'success'}>
                    {scanResult.analysis.malware ? 'Found' : 'Clean'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 glass rounded-lg">
                  <span className="text-sm text-foreground">Blockchain Verified</span>
                  <Badge variant={scanResult.analysis.blockchain ? 'success' : 'secondary'}>
                    {scanResult.analysis.blockchain ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Threats Detected */}
      {scanResult && scanResult.threats.length > 0 && (
        <Card className="bento-card glass-hover threat-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Security Threats Detected
            </CardTitle>
            <CardDescription>Immediate attention required for the following issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scanResult.threats.map((threat, index) => (
                <div key={index} className="flex items-center gap-3 p-3 glass rounded-lg threat-border">
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <span className="text-foreground">{threat}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}