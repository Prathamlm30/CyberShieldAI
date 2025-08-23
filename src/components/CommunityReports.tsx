import { useState } from "react";
import { Users, Flag, MessageSquare, ThumbsUp, Send, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ThreatReport {
  id: string;
  type: string;
  url: string;
  description: string;
  reporter: string;
  timestamp: string;
  status: 'pending' | 'verified' | 'false_positive';
  votes: number;
  severity: 'low' | 'medium' | 'high';
  tags: string[];
}

const CommunityReports = () => {
  const [reports, setReports] = useState<ThreatReport[]>([
    {
      id: '1',
      type: 'Phishing',
      url: 'fake-paypal-security.net',
      description: 'Convincing PayPal phishing site with identical design. Asks for login credentials and credit card info.',
      reporter: 'CyberGuardian_42',
      timestamp: '15 minutes ago',
      status: 'verified',
      votes: 23,
      severity: 'high',
      tags: ['paypal', 'phishing', 'credit-card']
    },
    {
      id: '2',
      type: 'Malware',
      url: 'free-antivirus-download.tk',
      description: 'Site offering fake antivirus software that installs ransomware instead.',
      reporter: 'SecurityExpert99',
      timestamp: '1 hour ago',
      status: 'pending',
      votes: 17,
      severity: 'high',
      tags: ['ransomware', 'fake-antivirus', 'malware']
    },
    {
      id: '3',
      type: 'Scam',
      url: 'crypto-investment-pro.biz',
      description: 'Fake cryptocurrency investment platform promising 500% returns. Uses fake testimonials.',
      reporter: 'CryptoWatcher',
      timestamp: '2 hours ago',
      status: 'verified',
      votes: 31,
      severity: 'medium',
      tags: ['crypto', 'investment-scam', 'fake-testimonials']
    },
    {
      id: '4',
      type: 'Suspicious',
      url: 'urgent-account-verify.com',
      description: 'Generic phishing page targeting multiple services. Poor grammar and suspicious domain age.',
      reporter: 'ThreatHunter',
      timestamp: '4 hours ago',
      status: 'false_positive',
      votes: 5,
      severity: 'low',
      tags: ['generic-phishing', 'multiple-targets']
    }
  ]);

  const [newReport, setNewReport] = useState({
    type: '',
    url: '',
    description: '',
    severity: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReport = async () => {
    if (!newReport.type || !newReport.url || !newReport.description) return;
    
    setIsSubmitting(true);
    
    // Simulate API submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const report: ThreatReport = {
      id: Date.now().toString(),
      type: newReport.type,
      url: newReport.url,
      description: newReport.description,
      reporter: 'You',
      timestamp: 'Just now',
      status: 'pending',
      votes: 1,
      severity: newReport.severity as 'low' | 'medium' | 'high',
      tags: []
    };
    
    setReports(prev => [report, ...prev]);
    setNewReport({ type: '', url: '', description: '', severity: '' });
    setIsSubmitting(false);
  };

  const handleVote = (reportId: string) => {
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, votes: report.votes + 1 }
        : report
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-success/20 text-success border-success/30';
      case 'pending': return 'bg-warning/20 text-warning border-warning/30';
      case 'false_positive': return 'bg-muted/20 text-muted-foreground border-muted/30';
      default: return 'bg-secondary/20 text-secondary-foreground border-secondary/30';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified': return 'default';
      case 'pending': return 'secondary';
      case 'false_positive': return 'outline';
      default: return 'outline';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto cyber-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-6 w-6 text-primary" />
          <span>Community Threat Reports</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="reports" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reports">Recent Reports</TabsTrigger>
            <TabsTrigger value="submit">Submit Report</TabsTrigger>
            <TabsTrigger value="stats">Community Stats</TabsTrigger>
          </TabsList>
          
          <TabsContent value="reports" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>{reports.filter(r => r.status === 'verified').length} Verified</span>
                </Badge>
                <Badge variant="outline" className="flex items-center space-x-1">
                  <AlertTriangle className="h-3 w-3" />
                  <span>{reports.filter(r => r.status === 'pending').length} Pending</span>
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 rounded-lg border bg-card/50 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${getStatusColor(report.status)}`}>
                        <Flag className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-foreground">{report.type}</h4>
                          <Badge variant={getSeverityBadge(report.severity) as any} className="text-xs capitalize">
                            {report.severity}
                          </Badge>
                          <Badge variant={getStatusBadge(report.status) as any} className="text-xs capitalize">
                            {report.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          <span className="font-mono">{report.url}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{report.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>Reported by {report.reporter}</span>
                      <span>•</span>
                      <span>{report.timestamp}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {report.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVote(report.id)}
                        className="flex items-center space-x-1"
                      >
                        <ThumbsUp className="h-3 w-3" />
                        <span>{report.votes}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="submit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Report a New Threat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Threat Type</label>
                    <Select value={newReport.type} onValueChange={(value) => setNewReport(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select threat type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="phishing">Phishing</SelectItem>
                        <SelectItem value="malware">Malware</SelectItem>
                        <SelectItem value="scam">Scam</SelectItem>
                        <SelectItem value="fraud">Fraud</SelectItem>
                        <SelectItem value="suspicious">Suspicious Activity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Severity Level</label>
                    <Select value={newReport.severity} onValueChange={(value) => setNewReport(prev => ({ ...prev, severity: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Suspicious URL or Domain</label>
                  <Input
                    placeholder="e.g., suspicious-site.com"
                    value={newReport.url}
                    onChange={(e) => setNewReport(prev => ({ ...prev, url: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Describe the threat, what makes it suspicious, and any evidence you have..."
                    rows={4}
                    value={newReport.description}
                    onChange={(e) => setNewReport(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                <Button 
                  onClick={handleSubmitReport}
                  disabled={!newReport.type || !newReport.url || !newReport.description || isSubmitting}
                  className={isSubmitting ? "scan-pulse" : ""}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Submitting..." : "Submit Report"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">2,847</div>
                    <div className="text-sm text-muted-foreground">Total Reports</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">1,923</div>
                    <div className="text-sm text-muted-foreground">Verified Threats</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">347</div>
                    <div className="text-sm text-muted-foreground">Active Contributors</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">94.3%</div>
                    <div className="text-sm text-muted-foreground">Accuracy Rate</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Contributors This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'CyberGuardian_42', reports: 23, accuracy: 98, reputation: 'Expert' },
                    { name: 'SecurityExpert99', reports: 18, accuracy: 94, reputation: 'Advanced' },
                    { name: 'ThreatHunter', reports: 15, accuracy: 91, reputation: 'Advanced' },
                    { name: 'CryptoWatcher', reports: 12, accuracy: 89, reputation: 'Intermediate' },
                    { name: 'PhishingFinder', reports: 10, accuracy: 96, reputation: 'Intermediate' }
                  ].map((contributor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded border bg-card/30">
                      <div className="flex items-center space-x-3">
                        <div className="text-lg font-bold text-primary">#{index + 1}</div>
                        <div>
                          <div className="font-medium">{contributor.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {contributor.reports} reports • {contributor.accuracy}% accuracy
                          </div>
                        </div>
                      </div>
                      <Badge variant={
                        contributor.reputation === 'Expert' ? 'default' :
                        contributor.reputation === 'Advanced' ? 'secondary' : 'outline'
                      }>
                        {contributor.reputation}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CommunityReports;