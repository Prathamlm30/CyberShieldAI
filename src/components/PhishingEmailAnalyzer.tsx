import { useState } from "react";
import { Mail, Scan, AlertTriangle, CheckCircle, Copy, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EmailAnalysis {
  riskScore: number;
  riskLevel: 'safe' | 'suspicious' | 'dangerous';
  indicators: {
    sender_verification: boolean;
    suspicious_links: string[];
    urgency_language: boolean;
    grammar_issues: boolean;
    spoofed_domain: boolean;
    suspicious_attachments: boolean;
  };
  summary: string;
  recommendations: string[];
}

const PhishingEmailAnalyzer = () => {
  const [emailContent, setEmailContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<EmailAnalysis | null>(null);

  const samplePhishingEmail = `From: security@paypaI-verification.com
Subject: URGENT: Account Suspended - Immediate Action Required

Dear PayPal User,

Your account has been temporarily suspended due to suspicious activity. To restore access, you must verify your identity immediately.

CLICK HERE TO VERIFY NOW: http://paypal-secure-login.tk/verify

Failure to verify within 24 hours will result in permanent account closure. This is for your security.

Best regards,
PayPal Security Team

*This email was sent to protect your account`;

  const mockAnalyzeEmail = async (content: string): Promise<EmailAnalysis> => {
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const suspiciousKeywords = ['urgent', 'suspended', 'verify immediately', 'click here', 'account closure'];
    const hasUrgentLanguage = suspiciousKeywords.some(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    );
    
    const linkRegex = /https?:\/\/[^\s]+/g;
    const links = content.match(linkRegex) || [];
    const suspiciousLinks = links.filter(link => 
      link.includes('.tk') || 
      link.includes('paypal') && !link.includes('paypal.com') ||
      link.includes('secure-login')
    );
    
    const spoofedDomain = content.includes('@paypaI-') || content.includes('paypal-') && !content.includes('@paypal.com');
    
    let riskScore = 20;
    if (hasUrgentLanguage) riskScore += 30;
    if (suspiciousLinks.length > 0) riskScore += 35;
    if (spoofedDomain) riskScore += 25;
    
    const riskLevel: 'safe' | 'suspicious' | 'dangerous' = 
      riskScore >= 70 ? 'dangerous' : riskScore >= 40 ? 'suspicious' : 'safe';
    
    return {
      riskScore: Math.min(riskScore, 95),
      riskLevel,
      indicators: {
        sender_verification: !spoofedDomain,
        suspicious_links: suspiciousLinks,
        urgency_language: hasUrgentLanguage,
        grammar_issues: Math.random() > 0.5,
        spoofed_domain: spoofedDomain,
        suspicious_attachments: Math.random() > 0.7
      },
      summary: riskLevel === 'dangerous' 
        ? "This email exhibits multiple characteristics of a phishing attack. Do not click any links or provide personal information."
        : riskLevel === 'suspicious'
        ? "This email contains several suspicious elements. Exercise caution and verify the sender through official channels."
        : "This email appears to be legitimate, but always remain vigilant.",
      recommendations: riskLevel === 'dangerous' 
        ? [
          "Do not click any links in this email",
          "Do not provide personal or financial information",
          "Report this email as phishing to your email provider",
          "Contact the legitimate organization directly using official contact methods",
          "Check if your accounts are secure through official websites"
        ]
        : riskLevel === 'suspicious'
        ? [
          "Verify the sender through official channels",
          "Check the sender's email address carefully",
          "Hover over links to preview destinations before clicking",
          "Contact the organization directly if urgent action is claimed"
        ]
        : [
          "Always verify urgent requests through official channels",
          "Keep your email security software updated",
          "Be cautious with unexpected emails"
        ]
    };
  };

  const handleAnalyze = async () => {
    if (!emailContent.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const result = await mockAnalyzeEmail(emailContent);
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadSample = () => {
    setEmailContent(samplePhishingEmail);
    setAnalysis(null);
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'safe': return 'text-success';
      case 'suspicious': return 'text-warning';
      case 'dangerous': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case 'safe': return 'default';
      case 'suspicious': return 'secondary';
      case 'dangerous': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto cyber-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mail className="h-6 w-6 text-primary" />
          <span>AI Phishing Email Analyzer</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="analyzer" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="analyzer">Email Analyzer</TabsTrigger>
            <TabsTrigger value="education">Phishing Education</TabsTrigger>
          </TabsList>
          
          <TabsContent value="analyzer" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="email-content" className="text-sm font-medium">
                  Email Content
                </label>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={loadSample}>
                    <Copy className="h-4 w-4 mr-2" />
                    Load Sample
                  </Button>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload .eml
                  </Button>
                </div>
              </div>
              
              <Textarea
                id="email-content"
                placeholder="Paste the suspicious email content here..."
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                rows={8}
                className="font-mono text-sm"
              />
              
              <Button 
                onClick={handleAnalyze}
                disabled={!emailContent.trim() || isAnalyzing}
                className={isAnalyzing ? "scan-pulse" : ""}
                size="lg"
              >
                <Scan className="h-4 w-4 mr-2" />
                {isAnalyzing ? "Analyzing..." : "Analyze Email"}
              </Button>
            </div>

            {isAnalyzing && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Running AI analysis on email content...</p>
                </div>
                <Progress value={60} className="w-full" />
              </div>
            )}

            {analysis && !isAnalyzing && (
              <div className="space-y-6">
                <Card className={analysis.riskLevel === 'dangerous' ? 'threat-border' : analysis.riskLevel === 'suspicious' ? 'border-warning/50' : 'success-border'}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        {analysis.riskLevel === 'safe' && <CheckCircle className="h-5 w-5 text-success" />}
                        {analysis.riskLevel !== 'safe' && <AlertTriangle className="h-5 w-5 text-destructive" />}
                        <span>Analysis Results</span>
                      </span>
                      <Badge variant={getRiskBadgeVariant(analysis.riskLevel) as any} className="capitalize">
                        {analysis.riskLevel}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Risk Score</span>
                        <span className={`font-bold ${getRiskColor(analysis.riskLevel)}`}>
                          {analysis.riskScore}/100
                        </span>
                      </div>
                      <Progress value={analysis.riskScore} className="h-3" />
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Summary</h4>
                      <p className="text-sm text-muted-foreground">{analysis.summary}</p>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Security Indicators</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Sender Verification</span>
                        <Badge variant={analysis.indicators.sender_verification ? "default" : "destructive"}>
                          {analysis.indicators.sender_verification ? "Verified" : "Failed"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Urgency Language</span>
                        <Badge variant={!analysis.indicators.urgency_language ? "default" : "destructive"}>
                          {!analysis.indicators.urgency_language ? "Normal" : "Detected"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Domain Spoofing</span>
                        <Badge variant={!analysis.indicators.spoofed_domain ? "default" : "destructive"}>
                          {!analysis.indicators.spoofed_domain ? "Clean" : "Detected"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Grammar Analysis</span>
                        <Badge variant={!analysis.indicators.grammar_issues ? "default" : "secondary"}>
                          {!analysis.indicators.grammar_issues ? "Professional" : "Issues Found"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {analysis.indicators.suspicious_links.length > 0 && (
                  <Card className="threat-border">
                    <CardHeader>
                      <CardTitle className="text-lg text-destructive">Suspicious Links Detected</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.indicators.suspicious_links.map((link, index) => (
                          <li key={index} className="flex items-center space-x-2 p-2 bg-destructive/10 rounded">
                            <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                            <code className="text-sm break-all">{link}</code>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="education" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-destructive">Common Phishing Red Flags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Urgent Language</p>
                      <p className="text-sm text-muted-foreground">Phrases like "immediate action required" or "account will be closed"</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Suspicious Links</p>
                      <p className="text-sm text-muted-foreground">URLs that don't match the claimed sender or use suspicious domains</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Generic Greetings</p>
                      <p className="text-sm text-muted-foreground">"Dear Customer" instead of your actual name</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Grammar Errors</p>
                      <p className="text-sm text-muted-foreground">Poor spelling and grammar in official communications</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-success">Protection Best Practices</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Verify Sender</p>
                      <p className="text-sm text-muted-foreground">Contact the organization directly using official channels</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Hover Before Clicking</p>
                      <p className="text-sm text-muted-foreground">Preview link destinations before clicking</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Use Official Websites</p>
                      <p className="text-sm text-muted-foreground">Access accounts through official websites, not email links</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Enable 2FA</p>
                      <p className="text-sm text-muted-foreground">Use two-factor authentication on important accounts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PhishingEmailAnalyzer;