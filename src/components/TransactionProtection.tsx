import { useState } from "react";
import { CreditCard, Shield, AlertTriangle, CheckCircle, DollarSign, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TransactionAnalysis {
  riskScore: number;
  riskLevel: 'safe' | 'medium' | 'high';
  merchant: {
    name: string;
    verified: boolean;
    reputation: number;
    location: string;
    category: string;
  };
  flags: string[];
  recommendations: string[];
  blockchainVerification: boolean;
}

interface TransactionData {
  merchant: string;
  amount: string;
  currency: string;
  location: string;
  cardLast4: string;
}

const TransactionProtection = () => {
  const [transactionData, setTransactionData] = useState<TransactionData>({
    merchant: "",
    amount: "",
    currency: "USD",
    location: "",
    cardLast4: ""
  });
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<TransactionAnalysis | null>(null);

  const mockAnalyzeTransaction = async (data: TransactionData): Promise<TransactionAnalysis> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const suspiciousMerchants = ['crypto-exchange-pro', 'quick-cash-now', 'instant-loans-4u'];
    const trustedMerchants = ['amazon', 'apple', 'google', 'microsoft', 'paypal'];
    
    const merchantLower = data.merchant.toLowerCase();
    const amount = parseFloat(data.amount) || 0;
    
    const isSuspicious = suspiciousMerchants.some(m => merchantLower.includes(m));
    const isTrusted = trustedMerchants.some(m => merchantLower.includes(m));
    const isHighAmount = amount > 1000;
    const isUnusualLocation = data.location.toLowerCase().includes('nigeria') || data.location.toLowerCase().includes('unknown');
    
    let riskScore = 30;
    let flags: string[] = [];
    
    if (isSuspicious) {
      riskScore += 40;
      flags.push('Merchant flagged as high-risk');
    }
    
    if (isHighAmount) {
      riskScore += 20;
      flags.push('High transaction amount');
    }
    
    if (isUnusualLocation) {
      riskScore += 30;
      flags.push('Unusual transaction location');
    }
    
    if (!isTrusted && merchantLower.includes('crypto')) {
      riskScore += 25;
      flags.push('Cryptocurrency-related transaction');
    }
    
    if (isTrusted) {
      riskScore = Math.max(riskScore - 30, 10);
    }
    
    const riskLevel: 'safe' | 'medium' | 'high' = 
      riskScore >= 70 ? 'high' : riskScore >= 40 ? 'medium' : 'safe';
    
    return {
      riskScore: Math.min(riskScore, 95),
      riskLevel,
      merchant: {
        name: data.merchant,
        verified: isTrusted || !isSuspicious,
        reputation: isTrusted ? 95 : isSuspicious ? 25 : 65,
        location: data.location || 'Unknown',
        category: merchantLower.includes('crypto') ? 'Cryptocurrency' : 
                 merchantLower.includes('loan') ? 'Financial Services' :
                 isTrusted ? 'E-commerce' : 'Other'
      },
      flags,
      recommendations: riskLevel === 'high' ? [
        'Consider canceling this transaction',
        'Verify merchant legitimacy through official channels',
        'Check for alternative payment methods',
        'Monitor account for unauthorized charges',
        'Report suspicious activity to your bank'
      ] : riskLevel === 'medium' ? [
        'Verify merchant identity before proceeding',
        'Use secure payment methods',
        'Monitor transaction closely',
        'Keep transaction records'
      ] : [
        'Transaction appears safe to proceed',
        'Continue monitoring account activity',
        'Keep receipts for your records'
      ],
      blockchainVerification: isTrusted || Math.random() > 0.6
    };
  };

  const handleAnalyze = async () => {
    if (!transactionData.merchant || !transactionData.amount) return;
    
    setIsAnalyzing(true);
    try {
      const result = await mockAnalyzeTransaction(transactionData);
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadSampleTransaction = (type: 'safe' | 'suspicious') => {
    if (type === 'safe') {
      setTransactionData({
        merchant: "Amazon.com",
        amount: "49.99",
        currency: "USD",
        location: "Seattle, WA, USA",
        cardLast4: "1234"
      });
    } else {
      setTransactionData({
        merchant: "crypto-exchange-pro.biz",
        amount: "2500.00",
        currency: "USD",
        location: "Lagos, Nigeria",
        cardLast4: "1234"
      });
    }
    setAnalysis(null);
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'safe': return 'text-success';
      case 'medium': return 'text-warning';
      case 'high': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case 'safe': return 'default';
      case 'medium': return 'secondary';
      case 'high': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto cyber-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-6 w-6 text-primary" />
          <span>Transaction Security Analyzer</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="analyzer" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="analyzer">Transaction Analyzer</TabsTrigger>
            <TabsTrigger value="monitor">Real-time Monitor</TabsTrigger>
          </TabsList>
          
          <TabsContent value="analyzer" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Merchant Name</label>
                <Input
                  placeholder="e.g., Amazon.com"
                  value={transactionData.merchant}
                  onChange={(e) => setTransactionData(prev => ({ ...prev, merchant: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount</label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="0.00"
                    value={transactionData.amount}
                    onChange={(e) => setTransactionData(prev => ({ ...prev, amount: e.target.value }))}
                    className="flex-1"
                  />
                  <Input
                    value={transactionData.currency}
                    onChange={(e) => setTransactionData(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-20"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Transaction Location</label>
                <Input
                  placeholder="e.g., New York, NY, USA"
                  value={transactionData.location}
                  onChange={(e) => setTransactionData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Card Last 4 Digits</label>
                <Input
                  placeholder="1234"
                  maxLength={4}
                  value={transactionData.cardLast4}
                  onChange={(e) => setTransactionData(prev => ({ ...prev, cardLast4: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => loadSampleTransaction('safe')}>
                  Load Safe Example
                </Button>
                <Button variant="outline" size="sm" onClick={() => loadSampleTransaction('suspicious')}>
                  Load Suspicious Example
                </Button>
              </div>
              
              <Button 
                onClick={handleAnalyze}
                disabled={!transactionData.merchant || !transactionData.amount || isAnalyzing}
                className={isAnalyzing ? "scan-pulse" : ""}
              >
                <Shield className="h-4 w-4 mr-2" />
                {isAnalyzing ? "Analyzing..." : "Analyze Transaction"}
              </Button>
            </div>

            {isAnalyzing && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Analyzing transaction security...</p>
                </div>
                <Progress value={45} className="w-full" />
              </div>
            )}

            {analysis && !isAnalyzing && (
              <div className="space-y-6">
                <Card className={analysis.riskLevel === 'high' ? 'threat-border' : analysis.riskLevel === 'medium' ? 'border-warning/50' : 'success-border'}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        {analysis.riskLevel === 'safe' && <CheckCircle className="h-5 w-5 text-success" />}
                        {analysis.riskLevel !== 'safe' && <AlertTriangle className="h-5 w-5 text-destructive" />}
                        <span>Security Analysis</span>
                      </span>
                      <Badge variant={getRiskBadgeVariant(analysis.riskLevel) as any} className="capitalize">
                        {analysis.riskLevel} Risk
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
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Merchant Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Merchant</span>
                        <span className="font-medium">{analysis.merchant.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Verification</span>
                        <Badge variant={analysis.merchant.verified ? "default" : "destructive"}>
                          {analysis.merchant.verified ? "Verified" : "Unverified"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Reputation</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={analysis.merchant.reputation} className="w-16 h-2" />
                          <span className="text-sm font-medium">{analysis.merchant.reputation}%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Category</span>
                        <Badge variant="outline">{analysis.merchant.category}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Location</span>
                        <span className="text-sm text-muted-foreground">{analysis.merchant.location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Blockchain Verified</span>
                        <Badge variant={analysis.blockchainVerification ? "default" : "secondary"}>
                          {analysis.blockchainVerification ? "Yes" : "No"}
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

                {analysis.flags.length > 0 && (
                  <Card className="threat-border">
                    <CardHeader>
                      <CardTitle className="text-lg text-destructive">Risk Flags</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.flags.map((flag, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                            <span className="text-sm">{flag}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="monitor" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="cyber-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Transactions Today</CardTitle>
                  <DollarSign className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">247</div>
                  <p className="text-xs text-muted-foreground">+12% from yesterday</p>
                </CardContent>
              </Card>

              <Card className="success-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Secure Transactions</CardTitle>
                  <CheckCircle className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">239</div>
                  <p className="text-xs text-muted-foreground">96.8% success rate</p>
                </CardContent>
              </Card>

              <Card className="threat-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Blocked Transactions</CardTitle>
                  <Shield className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">8</div>
                  <p className="text-xs text-muted-foreground">3.2% blocked for security</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>Recent Transaction Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { merchant: "Amazon.com", amount: "$49.99", status: "approved", risk: "low", time: "2 min ago" },
                    { merchant: "Starbucks", amount: "$12.45", status: "approved", risk: "low", time: "15 min ago" },
                    { merchant: "crypto-quick.biz", amount: "$1,250.00", status: "blocked", risk: "high", time: "23 min ago" },
                    { merchant: "Netflix", amount: "$15.99", status: "approved", risk: "low", time: "1 hr ago" },
                    { merchant: "unknown-vendor.tk", amount: "$89.99", status: "pending", risk: "medium", time: "2 hr ago" }
                  ].map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          transaction.status === 'approved' ? 'bg-success/20 text-success' :
                          transaction.status === 'blocked' ? 'bg-destructive/20 text-destructive' :
                          'bg-warning/20 text-warning'
                        }`}>
                          {transaction.status === 'approved' ? <CheckCircle className="h-4 w-4" /> :
                           transaction.status === 'blocked' ? <Shield className="h-4 w-4" /> :
                           <Clock className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.merchant}</p>
                          <p className="text-sm text-muted-foreground">{transaction.amount} • {transaction.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          transaction.risk === 'low' ? 'default' :
                          transaction.risk === 'medium' ? 'secondary' : 'destructive'
                        }>
                          {transaction.risk} risk
                        </Badge>
                        <Badge variant={
                          transaction.status === 'approved' ? 'default' :
                          transaction.status === 'blocked' ? 'destructive' : 'secondary'
                        }>
                          {transaction.status}
                        </Badge>
                      </div>
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

export default TransactionProtection;