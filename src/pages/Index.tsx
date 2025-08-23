import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import ThreatDashboard from "@/components/ThreatDashboard";
import URLScanner from "@/components/URLScanner";
import PhishingEmailAnalyzer from "@/components/PhishingEmailAnalyzer";
import TransactionProtection from "@/components/TransactionProtection";
import ThreatIntelligence from "@/components/ThreatIntelligence";
import CommunityReports from "@/components/CommunityReports";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            CyberShield AI - Digital Sovereignty Protection
          </h1>
          <p className="text-muted-foreground">
            Advanced AI-powered cybersecurity platform for real-time threat detection and digital protection
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="scanner">URL Scanner</TabsTrigger>
            <TabsTrigger value="email">Email Analyzer</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="intelligence">Threat Intel</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <ThreatDashboard />
          </TabsContent>

          <TabsContent value="scanner" className="space-y-6">
            <URLScanner />
          </TabsContent>

          <TabsContent value="email" className="space-y-6">
            <PhishingEmailAnalyzer />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <TransactionProtection />
          </TabsContent>

          <TabsContent value="intelligence" className="space-y-6">
            <ThreatIntelligence />
          </TabsContent>

          <TabsContent value="community" className="space-y-6">
            <CommunityReports />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
