import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  AlertTriangle, 
  Send, 
  Globe,
  Clock,
  CheckCircle,
  Shield,
  Zap
} from 'lucide-react';

interface CommunityReport {
  id: string;
  submitted_by_email: string;
  reported_url: string;
  threat_type: string;
  severity: string;
  notes?: string;
  verified: boolean;
  created_at: string;
}

export function EliteCommunity() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Report form state
  const [reportUrl, setReportUrl] = useState('');
  const [threatType, setThreatType] = useState('');
  const [severity, setSeverity] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadReports();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('community-reports')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'community_reports' 
        }, 
        (payload) => {
          const newReport = payload.new as CommunityReport;
          setReports(prev => [newReport, ...prev]);
          
          toast({
            title: "New Threat Report",
            description: `Community member reported: ${new URL(newReport.reported_url).hostname}`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadReports = async () => {
    try {
      const { data, error } = await supabase
        .from('community_reports')
        .select('*')
        .eq('verified', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast({
        title: "Error",
        description: "Failed to load community reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    if (!reportUrl || !threatType || !severity) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate URL
    let fullUrl = reportUrl.trim();
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

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('community_reports')
        .insert({
          submitted_by_email: user.email!,
          reported_url: fullUrl,
          threat_type: threatType,
          severity,
          notes: notes.trim() || null
        });

      if (error) throw error;

      toast({
        title: "Report Submitted",
        description: "Thank you for contributing to community security",
      });

      // Reset form
      setReportUrl('');
      setThreatType('');
      setSeverity('');
      setNotes('');
      
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Submission Failed",
        description: "Unable to submit threat report",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const getThreatTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'phishing': return AlertTriangle;
      case 'malware': return Shield;
      case 'scam': return Globe;
      default: return AlertTriangle;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground text-glow">Intel Network</h1>
          <p className="text-muted-foreground">Community-driven threat intelligence and reporting</p>
        </div>
        <Badge className="glass cyber-glow px-4 py-2">
          <Users className="w-4 h-4 mr-2" />
          Real-time Feed
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submit Report Form */}
        <Card className="bento-card glass-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Send className="w-5 h-5 text-primary" />
              Submit Threat Report
            </CardTitle>
            <CardDescription>
              Help protect the community by reporting suspicious URLs and activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reportUrl" className="text-foreground">
                  Suspicious URL *
                </Label>
                <Input
                  id="reportUrl"
                  type="url"
                  placeholder="https://suspicious-domain.com"
                  value={reportUrl}
                  onChange={(e) => setReportUrl(e.target.value)}
                  className="glass"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="threatType" className="text-foreground">
                  Threat Type *
                </Label>
                <Select value={threatType} onValueChange={setThreatType}>
                  <SelectTrigger className="glass">
                    <SelectValue placeholder="Select threat type" />
                  </SelectTrigger>
                  <SelectContent className="glass">
                    <SelectItem value="phishing">Phishing</SelectItem>
                    <SelectItem value="malware">Malware</SelectItem>
                    <SelectItem value="scam">Scam/Fraud</SelectItem>
                    <SelectItem value="spam">Spam</SelectItem>
                    <SelectItem value="ransomware">Ransomware</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="severity" className="text-foreground">
                  Severity Level *
                </Label>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger className="glass">
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent className="glass">
                    <SelectItem value="low">Low - Suspicious activity</SelectItem>
                    <SelectItem value="medium">Medium - Likely threat</SelectItem>
                    <SelectItem value="high">High - Active threat</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-foreground">
                  Additional Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Describe what you observed (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="glass min-h-[100px]"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full cyber-glow" 
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
                <Send className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Community Stats */}
        <Card className="bento-card glass-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Zap className="w-5 h-5 text-primary" />
              Network Statistics
            </CardTitle>
            <CardDescription>Community intelligence overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="glass rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary count-up">{reports.length}</div>
                <div className="text-xs text-muted-foreground">Verified Reports</div>
              </div>
              <div className="glass rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-success count-up">
                  {reports.filter(r => r.severity === 'high').length}
                </div>
                <div className="text-xs text-muted-foreground">Critical Threats</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Recent Activity</h4>
              {reports.slice(0, 3).map((report) => {
                const ThreatIcon = getThreatTypeIcon(report.threat_type);
                return (
                  <div key={report.id} className="flex items-center justify-between p-3 glass rounded-lg">
                    <div className="flex items-center space-x-3">
                      <ThreatIcon className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {report.threat_type.charAt(0).toUpperCase() + report.threat_type.slice(1)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(report.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getSeverityColor(report.severity) as any} className="text-xs">
                      {report.severity.toUpperCase()}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Threat Feed */}
      <Card className="bento-card glass-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Globe className="w-5 h-5 text-primary" />
            Live Threat Intelligence Feed
          </CardTitle>
          <CardDescription>Real-time community reports from security researchers worldwide</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-4 p-4 glass rounded-lg">
                    <div className="w-8 h-8 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : reports.length > 0 ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {reports.map((report) => {
                const ThreatIcon = getThreatTypeIcon(report.threat_type);
                return (
                  <div key={report.id} className="glass rounded-lg p-4 glass-hover">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`w-10 h-10 rounded-full glass flex items-center justify-center ${
                          report.severity === 'high' ? 'threat-border' : 
                          report.severity === 'medium' ? 'border-warning' : 'success-border'
                        }`}>
                          <ThreatIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-foreground">
                              {report.threat_type.charAt(0).toUpperCase() + report.threat_type.slice(1)} Detected
                            </p>
                            <Badge variant={getSeverityColor(report.severity) as any} className="text-xs">
                              {report.severity.toUpperCase()}
                            </Badge>
                            {report.verified && (
                              <Badge variant="success" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground break-all mb-2">
                            {new URL(report.reported_url).hostname}
                          </p>
                          {report.notes && (
                            <p className="text-sm text-foreground">{report.notes}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(report.created_at).toLocaleString()}
                            </span>
                            <span>
                              Reported by {report.submitted_by_email.split('@')[0]}***
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">No reports yet</p>
              <p className="text-xs text-muted-foreground mt-1">Be the first to contribute to community security</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}