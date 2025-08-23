import { useState } from "react";
import { Search, Shield, AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ScanResult {
  url: string;
  trustScore: number;
  riskLevel: 'safe' | 'warning' | 'danger';
  threats: string[];
  analysis: {
    ssl: boolean;
    reputation: number;
    phishing: boolean;
    malware: boolean;
    blockchain_verified: boolean;
  };
}

const URLScanner = () => {
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  const mockScan = async (inputUrl: string): Promise<ScanResult> => {
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const suspicious_domains = ['phishing-test.com', 'fake-bank.net', 'malware-site.org'];
    const safe_domains = ['google.com', 'github.com', 'stackoverflow.com'];
    
    const domain = inputUrl.replace(/^https?:\/\//, '').split('/')[0];
    const isSuspicious = suspicious_domains.some(d => domain.includes(d));
    const isSafe = safe_domains.some(d => domain.includes(d));
    
    let riskLevel: 'safe' | 'warning' | 'danger' = 'warning';
    let trustScore = Math.floor(Math.random() * 40) + 30; // 30-70 for unknown
    let threats: string[] = [];
    
    if (isSuspicious) {
      riskLevel = 'danger';
      trustScore = Math.floor(Math.random() * 30) + 10; // 10-40 for dangerous
      threats = ['Phishing attempt detected', 'Suspicious redirect patterns', 'Unverified SSL certificate'];
    } else if (isSafe) {
      riskLevel = 'safe';
      trustScore = Math.floor(Math.random() * 20) + 80; // 80-100 for safe
      threats = [];
    }
    
    return {
      url: inputUrl,
      trustScore,
      riskLevel,
      threats,
      analysis: {
        ssl: !isSuspicious,
        reputation: trustScore,
        phishing: isSuspicious,
        malware: isSuspicious && Math.random() > 0.5,
        blockchain_verified: isSafe
      }
    };
  };

  const handleScan = async () => {
    if (!url) return;
    
    setIsScanning(true);
    try {
      const result = await mockScan(url);
      setScanResult(result);
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const getThreatColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'safe': return 'success';
      case 'warning': return 'warning';
      case 'danger': return 'destructive';
      default: return 'secondary';
    }
  };

  const getThreatIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'safe': return <CheckCircle className="h-5 w-5 text-success" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'danger': return <Shield className="h-5 w-5 text-destructive" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto cyber-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-primary" />
          <span>AI URL Scanner</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex space-x-2">
          <Input
            placeholder="Enter URL to scan (e.g., https://example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && handleScan()}
          />
          <Button 
            onClick={handleScan} 
            disabled={!url || isScanning}
            className={isScanning ? "scan-pulse" : ""}
          >
            <Search className="h-4 w-4 mr-2" />
            {isScanning ? "Scanning..." : "Scan"}
          </Button>
        </div>

        {isScanning && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="mt-2 text-sm text-muted-foreground">Analyzing with AI threat detection...</p>
            </div>
            <Progress value={33} className="w-full" />
          </div>
        )}

        {scanResult && !isScanning && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-card border">
              <div className="flex items-center space-x-3">
                {getThreatIcon(scanResult.riskLevel)}
                <div>
                  <p className="font-semibold text-foreground">{scanResult.url}</p>
                  <p className="text-sm text-muted-foreground">Scan completed</p>
                </div>
              </div>
              <Badge variant={getThreatColor(scanResult.riskLevel) as any}>
                {scanResult.riskLevel.toUpperCase()}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Trust Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Overall Score</span>
                      <span className="font-bold">{scanResult.trustScore}/100</span>
                    </div>
                    <Progress value={scanResult.trustScore} className="h-3" />
                    <p className="text-sm text-muted-foreground">
                      Based on AI analysis and blockchain verification
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Security Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">SSL Certificate</span>
                      <Badge variant={scanResult.analysis.ssl ? "default" : "destructive"}>
                        {scanResult.analysis.ssl ? "Valid" : "Invalid"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Phishing Detection</span>
                      <Badge variant={!scanResult.analysis.phishing ? "default" : "destructive"}>
                        {!scanResult.analysis.phishing ? "Clean" : "Detected"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Malware Scan</span>
                      <Badge variant={!scanResult.analysis.malware ? "default" : "destructive"}>
                        {!scanResult.analysis.malware ? "Clean" : "Detected"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Blockchain Verified</span>
                      <Badge variant={scanResult.analysis.blockchain_verified ? "default" : "secondary"}>
                        {scanResult.analysis.blockchain_verified ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {scanResult.threats.length > 0 && (
              <Card className="threat-border">
                <CardHeader>
                  <CardTitle className="text-lg text-destructive">Threats Detected</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {scanResult.threats.map((threat, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <span className="text-sm">{threat}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-center">
              <Button variant="outline" className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4" />
                <span>View Detailed Report</span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default URLScanner;