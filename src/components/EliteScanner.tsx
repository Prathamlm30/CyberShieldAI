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

interface OracleVerdict {
  trustScore: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  verdict: 'SAFE' | 'CAUTION' | 'DANGEROUS';
  summary: string;
  threatVectors: string[];
  data: {
    sslReport: {
      isValid: boolean;
      issuer: string;
      validFrom: string;
      validTo: string;
      daysToExpiry: number;
      signatureAlgorithm: string;
      tlsVersions: string[];
      isExtendedValidation: boolean;
      certificateAge: number;
    };
    domainIntel: {
      domainAge: number;
      registrar: string;
      createdDate: string;
      updatedDate: string;
      expiryDate: string;
      isPrivacyProtected: boolean;
      nameservers: string[];
      ipAddress: string;
    };
    threatFeeds: {
      virusTotalReport: any;
      safeBrowsingStatus: string;
      abuseIpReport: any;
    };
  };
  analysisTime: number;
  cacheHit: boolean;
}

export function EliteScanner() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<OracleVerdict | null>(null);
  const [progress, setProgress] = useState(0);

  const performSecurityAnalysis = async (inputUrl: string): Promise<OracleVerdict> => {
    // Simulate progressive scanning UI
    const steps = [
      { label: 'Initializing Project Oracle...', progress: 10 },
      { label: 'Analyzing SSL/TLS certificate...', progress: 25 },
      { label: 'Querying threat intelligence feeds...', progress: 45 },
      { label: 'Cross-referencing security databases...', progress: 65 },
      { label: 'Computing trust score...', progress: 85 },
      { label: 'Finalizing analysis...', progress: 100 }
    ];

    for (const step of steps) {
      setProgress(step.progress);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Call the sophisticated backend analysis
    const response = await supabase.functions.invoke('security-analysis', {
      body: { url: inputUrl }
    });

    if (response.error) {
      throw new Error(response.error.message || 'Analysis failed');
    }

    // Structured response contract
    const payload = response.data as any;
    if (payload?.status === 'ERROR') {
      throw new Error(payload?.message || 'Analysis failed');
    }
    if (payload?.status === 'SUCCESS' && payload?.data) {
      return payload.data as OracleVerdict;
    }

    throw new Error('Unexpected response from analysis engine');
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
      const result = await performSecurityAnalysis(fullUrl);
      setScanResult(result);

      // Save scan to database
      if (user) {
        const riskLevel = result.verdict.toLowerCase();
        await supabase
          .from('scan_history')
          .insert({
            user_id: user.id,
            scanned_url: fullUrl,
            threat_level: riskLevel,
            trust_score: result.trustScore,
            is_threat: result.verdict === 'DANGEROUS',
            scan_details: result as any
          });

        // Update user profile stats
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('total_scans, threats_blocked')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profile) {
          await supabase
            .from('user_profiles')
            .update({
              total_scans: profile.total_scans + 1,
              threats_blocked: profile.threats_blocked + (result.verdict === 'DANGEROUS' ? 1 : 0)
            })
            .eq('user_id', user.id);
        }
      }

      toast({
        title: "Analysis Complete",
        description: `${result.summary} (Trust Score: ${result.trustScore}%)`,
        variant: result.verdict === 'DANGEROUS' ? 'destructive' : 'default',
      });

    } catch (error) {
      console.error('Security analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to complete security analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setScanning(false);
      setProgress(0);
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'DANGEROUS': return 'destructive';
      case 'CAUTION': return 'warning';
      case 'SAFE': return 'success';
      default: return 'secondary';
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'DANGEROUS': return AlertTriangle;
      case 'CAUTION': return Shield;
      case 'SAFE': return CheckCircle;
      default: return Shield;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground text-glow">Project Oracle</h1>
          <p className="text-muted-foreground">Enterprise-grade threat intelligence & security analysis</p>
        </div>
        <Badge className="glass cyber-glow px-4 py-2">
          <Zap className="w-4 h-4 mr-2" />
          Multi-Vector Analysis
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
              {scanning ? 'Analyzing...' : 'Run Analysis'}
            </Button>
          </div>

          {scanning && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Oracle analysis in progress...</span>
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
                <span className="text-foreground">Oracle Verdict</span>
                <Badge variant={getVerdictColor(scanResult.verdict) as any} className="px-3 py-1">
                  {scanResult.verdict} • {scanResult.confidence}
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
                  <p className="font-medium text-foreground truncate">{url}</p>
                  <p className="text-sm text-muted-foreground mt-1">{scanResult.summary}</p>
                  <div className="flex items-center justify-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {scanResult.analysisTime}ms
                      </span>
                    </div>
                    {scanResult.cacheHit && (
                      <Badge variant="secondary" className="text-xs">Cached</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis */}
          <Card className="bento-card glass-hover">
            <CardHeader>
              <CardTitle className="text-foreground">Technical Analysis</CardTitle>
              <CardDescription>Multi-source intelligence assessment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 glass rounded-lg">
                  <span className="text-sm text-foreground">SSL Certificate</span>
                  <Badge variant={scanResult.data.sslReport.isValid ? 'success' : 'destructive'}>
                    {scanResult.data.sslReport.isValid ? 
                      `Valid (${scanResult.data.sslReport.issuer})` : 'Invalid'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 glass rounded-lg">
                  <span className="text-sm text-foreground">Domain Age</span>
                  <Badge variant={scanResult.data.domainIntel.domainAge > 365 ? 'success' : 
                               scanResult.data.domainIntel.domainAge > 90 ? 'warning' : 'destructive'}>
                    {scanResult.data.domainIntel.domainAge} days
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 glass rounded-lg">
                  <span className="text-sm text-foreground">Safe Browsing</span>
                  <Badge variant={scanResult.data.threatFeeds.safeBrowsingStatus === 'SAFE' ? 'success' : 'destructive'}>
                    {scanResult.data.threatFeeds.safeBrowsingStatus}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 glass rounded-lg">
                  <span className="text-sm text-foreground">VirusTotal</span>
                  <Badge variant={
                    scanResult.data.threatFeeds.virusTotalReport?.data?.attributes?.stats?.malicious > 0 ? 'destructive' :
                    scanResult.data.threatFeeds.virusTotalReport?.data?.attributes?.stats?.suspicious > 0 ? 'warning' : 'success'
                  }>
                    {scanResult.data.threatFeeds.virusTotalReport ? 
                      `${scanResult.data.threatFeeds.virusTotalReport.data?.attributes?.stats?.malicious || 0} malicious` : 'N/A'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 glass rounded-lg">
                  <span className="text-sm text-foreground">IP Reputation</span>
                  <Badge variant={
                    scanResult.data.threatFeeds.abuseIpReport?.data?.abuseConfidencePercentage > 50 ? 'destructive' :
                    scanResult.data.threatFeeds.abuseIpReport?.data?.abuseConfidencePercentage > 10 ? 'warning' : 'success'
                  }>
                    {scanResult.data.threatFeeds.abuseIpReport ? 
                      `${scanResult.data.threatFeeds.abuseIpReport.data?.abuseConfidencePercentage || 0}% abuse` : 'Clean'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Threat Vectors Detected */}
      {scanResult && scanResult.threatVectors.length > 0 && (
        <Card className="bento-card glass-hover threat-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Threat Vectors Detected
            </CardTitle>
            <CardDescription>Security indicators requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scanResult.threatVectors.map((vector, index) => (
                <div key={index} className="flex items-center gap-3 p-3 glass rounded-lg threat-border">
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <span className="text-foreground">{vector.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}