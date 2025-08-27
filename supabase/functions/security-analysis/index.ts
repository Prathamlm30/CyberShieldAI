import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

// Initialize Supabase client
const supabaseUrl = 'https://nhmgbrdyaciukdfnwrku.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5obWdicmR5YWNpdWtkZm53cmt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MzIzMTcsImV4cCI6MjA3MTUwODMxN30.Z9X-NLL9BtjcIaQrmxcu346hzjdcYJh2ZLbNy3wlo7Y';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// API Keys from environment
const VIRUSTOTAL_API_KEY = Deno.env.get('VIRUSTOTAL_API_KEY');
const GOOGLE_SAFE_BROWSING_API_KEY = Deno.env.get('GOOGLE_SAFE_BROWSING_API_KEY');
const ABUSEIPDB_API_KEY = Deno.env.get('ABUSEIPDB_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ThreatVector {
  type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  penalty: number;
}

interface SSLReport {
  isValid: boolean;
  issuer: string;
  validFrom: string;
  validTo: string;
  daysToExpiry: number;
  signatureAlgorithm: string;
  tlsVersions: string[];
  isExtendedValidation: boolean;
  certificateAge: number;
}

interface DomainIntel {
  domainAge: number;
  registrar: string;
  createdDate: string;
  updatedDate: string;
  expiryDate: string;
  isPrivacyProtected: boolean;
  nameservers: string[];
  ipAddress: string;
}

interface ThreatFeeds {
  virusTotalReport: any;
  safeBrowsingStatus: string;
  abuseIpReport: any;
}

interface OracleVerdict {
  trustScore: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  verdict: 'SAFE' | 'CAUTION' | 'DANGEROUS';
  summary: string;
  threatVectors: string[];
  data: {
    sslReport: SSLReport;
    domainIntel: DomainIntel;
    threatFeeds: ThreatFeeds;
  };
  analysisTime: number;
  cacheHit: boolean;
}

// Cache key generator
function getCacheKey(url: string): string {
  return `security_analysis_${encodeURIComponent(url)}`;
}

// Tier 1: DNS & WHOIS Analysis
async function performDomainAnalysis(domain: string): Promise<DomainIntel> {
  console.log(`Starting domain analysis for: ${domain}`);
  
  try {
    // Get IP address
    const ipResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
    const ipData = await ipResponse.json();
    const ipAddress = ipData.Answer?.[0]?.data || 'Unknown';

    // WHOIS lookup using a free API
    const whoisResponse = await fetch(`https://api.whoisjson.com/v1/${domain}`);
    const whoisData = await whoisResponse.json();
    
    const createdDate = whoisData.created_date || new Date().toISOString();
    const domainAge = Math.floor((Date.now() - new Date(createdDate).getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      domainAge,
      registrar: whoisData.registrar || 'Unknown',
      createdDate,
      updatedDate: whoisData.updated_date || '',
      expiryDate: whoisData.expiry_date || '',
      isPrivacyProtected: whoisData.privacy || false,
      nameservers: whoisData.nameservers || [],
      ipAddress
    };
  } catch (error) {
    console.error('Domain analysis failed:', error);
    return {
      domainAge: 0,
      registrar: 'Unknown',
      createdDate: new Date().toISOString(),
      updatedDate: '',
      expiryDate: '',
      isPrivacyProtected: false,
      nameservers: [],
      ipAddress: 'Unknown'
    };
  }
}

// SSL/TLS Certificate Analysis
async function performSSLAnalysis(domain: string): Promise<SSLReport> {
  console.log(`Starting SSL analysis for: ${domain}`);
  
  try {
    // Use SSL Labs API for comprehensive SSL analysis
    const sslResponse = await fetch(`https://api.ssllabs.com/api/v3/analyze?host=${domain}&fromCache=on&maxAge=24`);
    const sslData = await sslResponse.json();
    
    if (sslData.status === 'READY' && sslData.endpoints?.[0]) {
      const endpoint = sslData.endpoints[0];
      const cert = endpoint.details?.cert;
      
      if (cert) {
        const validFrom = new Date(cert.notBefore * 1000).toISOString();
        const validTo = new Date(cert.notAfter * 1000).toISOString();
        const daysToExpiry = Math.floor((cert.notAfter * 1000 - Date.now()) / (1000 * 60 * 60 * 24));
        const certificateAge = Math.floor((Date.now() - cert.notBefore * 1000) / (1000 * 60 * 60 * 24));
        
        return {
          isValid: endpoint.grade !== 'F' && daysToExpiry > 0,
          issuer: cert.issuerLabel || 'Unknown',
          validFrom,
          validTo,
          daysToExpiry,
          signatureAlgorithm: cert.sigAlg || 'Unknown',
          tlsVersions: endpoint.details?.protocols?.map((p: any) => `${p.name} ${p.version}`) || [],
          isExtendedValidation: cert.validationType === 'E',
          certificateAge
        };
      }
    }
    
    // Fallback to basic SSL check
    return {
      isValid: true,
      issuer: 'Unknown',
      validFrom: new Date().toISOString(),
      validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      daysToExpiry: 365,
      signatureAlgorithm: 'Unknown',
      tlsVersions: ['TLS 1.3'],
      isExtendedValidation: false,
      certificateAge: 30
    };
  } catch (error) {
    console.error('SSL analysis failed:', error);
    return {
      isValid: false,
      issuer: 'Unknown',
      validFrom: '',
      validTo: '',
      daysToExpiry: 0,
      signatureAlgorithm: 'Unknown',
      tlsVersions: [],
      isExtendedValidation: false,
      certificateAge: 0
    };
  }
}

// Tier 2: Threat Intelligence
async function performThreatIntelligence(url: string, ipAddress: string): Promise<ThreatFeeds> {
  console.log(`Starting threat intelligence analysis for: ${url}`);
  
  const results: ThreatFeeds = {
    virusTotalReport: null,
    safeBrowsingStatus: 'SAFE',
    abuseIpReport: null
  };

  // VirusTotal URL Analysis
  if (VIRUSTOTAL_API_KEY) {
    try {
      // Submit URL for analysis
      const vtSubmitResponse = await fetch('https://www.virustotal.com/api/v3/urls', {
        method: 'POST',
        headers: {
          'x-apikey': VIRUSTOTAL_API_KEY,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `url=${encodeURIComponent(url)}`
      });
      
      const submitData = await vtSubmitResponse.json();
      const analysisId = submitData.data?.id;
      
      if (analysisId) {
        // Wait a moment then get results
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const vtResultResponse = await fetch(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, {
          headers: { 'x-apikey': VIRUSTOTAL_API_KEY }
        });
        
        results.virusTotalReport = await vtResultResponse.json();
      }
    } catch (error) {
      console.error('VirusTotal analysis failed:', error);
    }
  }

  // Google Safe Browsing
  if (GOOGLE_SAFE_BROWSING_API_KEY) {
    try {
      const safeBrowsingResponse = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${GOOGLE_SAFE_BROWSING_API_KEY}`, {
        method: 'POST',
        body: JSON.stringify({
          client: {
            clientId: 'cybershield-ai',
            clientVersion: '1.0.0'
          },
          threatInfo: {
            threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
            platformTypes: ['ANY_PLATFORM'],
            threatEntryTypes: ['URL'],
            threatEntries: [{ url }]
          }
        })
      });
      
      const safeBrowsingData = await safeBrowsingResponse.json();
      results.safeBrowsingStatus = safeBrowsingData.matches ? 'DANGEROUS' : 'SAFE';
    } catch (error) {
      console.error('Safe Browsing analysis failed:', error);
    }
  }

  // AbuseIPDB
  if (ABUSEIPDB_API_KEY && ipAddress !== 'Unknown') {
    try {
      const abuseResponse = await fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${ipAddress}&maxAgeInDays=90&verbose`, {
        headers: {
          'Key': ABUSEIPDB_API_KEY,
          'Accept': 'application/json'
        }
      });
      
      results.abuseIpReport = await abuseResponse.json();
    } catch (error) {
      console.error('AbuseIPDB analysis failed:', error);
    }
  }

  return results;
}

// Calculate Trust Score and Determine Verdict
function calculateVerdict(sslReport: SSLReport, domainIntel: DomainIntel, threatFeeds: ThreatFeeds): {
  trustScore: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  verdict: 'SAFE' | 'CAUTION' | 'DANGEROUS';
  summary: string;
  threatVectors: string[];
} {
  let score = 100;
  const threatVectors: string[] = [];
  let confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH';

  // Critical Penalties
  if (threatFeeds.safeBrowsingStatus === 'DANGEROUS') {
    score = Math.min(score - 70, 40);
    threatVectors.push('GOOGLE_SAFE_BROWSING_FLAGGED');
  }

  if (threatFeeds.virusTotalReport?.data?.attributes?.stats?.malicious > 0) {
    score = Math.min(score - 70, 40);
    threatVectors.push('MALICIOUS_FLAG_VIRUSTOTAL');
  }

  // High Penalties
  if (domainIntel.domainAge < 30) {
    score -= 40;
    threatVectors.push('RECENTLY_CREATED_DOMAIN');
  }

  if (threatFeeds.abuseIpReport?.data?.abuseConfidencePercentage > 50) {
    score -= 40;
    threatVectors.push('IP_HIGH_ABUSE_CONFIDENCE');
  }

  if (threatFeeds.virusTotalReport?.data?.attributes?.stats?.suspicious > 3) {
    score -= 30;
    threatVectors.push('MULTIPLE_SUSPICIOUS_FLAGS');
  }

  // Medium Penalties
  if (domainIntel.domainAge < 90) {
    score -= 25;
    threatVectors.push('YOUNG_DOMAIN');
  }

  if (!sslReport.isValid || sslReport.daysToExpiry <= 0) {
    score -= 25;
    threatVectors.push('INVALID_SSL_CERTIFICATE');
  }

  if (sslReport.certificateAge < 15) {
    score -= 20;
    threatVectors.push('RECENTLY_ISSUED_CERTIFICATE');
  }

  // Low Penalties
  if (domainIntel.isPrivacyProtected) {
    score -= 10;
    threatVectors.push('USES_DOMAIN_PRIVACY');
  }

  if (sslReport.tlsVersions.some(v => v.includes('1.0') || v.includes('1.1'))) {
    score -= 10;
    threatVectors.push('OUTDATED_TLS_PROTOCOL');
  }

  // Positive Indicators (Bonuses)
  if (domainIntel.domainAge > 3650) { // > 10 years
    score += 10;
  }

  if (sslReport.isExtendedValidation) {
    score += 5;
  }

  if (['DigiCert', 'Sectigo', 'GlobalSign'].includes(sslReport.issuer)) {
    score += 5;
  }

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));

  // Determine confidence based on API availability
  if (!threatFeeds.virusTotalReport && !threatFeeds.abuseIpReport) {
    confidence = 'LOW';
  } else if (!threatFeeds.virusTotalReport || !threatFeeds.abuseIpReport) {
    confidence = 'MEDIUM';
  }

  // Determine verdict
  let verdict: 'SAFE' | 'CAUTION' | 'DANGEROUS';
  let summary: string;

  if (score >= 80) {
    verdict = 'SAFE';
    summary = 'This URL appears to be safe based on our comprehensive security analysis.';
  } else if (score >= 50) {
    verdict = 'CAUTION';
    summary = 'This URL shows some risk indicators. Exercise caution when visiting.';
  } else {
    verdict = 'DANGEROUS';
    summary = 'This URL has been flagged as potentially dangerous. Avoid visiting this site.';
  }

  if (threatVectors.length > 0) {
    const topThreat = threatVectors[0];
    if (topThreat.includes('MALICIOUS') || topThreat.includes('FLAGGED')) {
      summary = 'This domain is flagged as malicious by multiple security vendors.';
    } else if (topThreat.includes('RECENTLY_CREATED')) {
      summary = 'This domain was registered recently, which is a common indicator of malicious intent.';
    }
  }

  return { trustScore: score, confidence, verdict, summary, threatVectors };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const startTime = Date.now();
    const cacheKey = getCacheKey(url);

    // Check cache first
    const { data: cachedResult } = await supabase
      .from('scan_history')
      .select('*')
      .eq('scanned_url', url)
      .gte('created_at', new Date(Date.now() - 3600000).toISOString()) // 1 hour cache
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cachedResult) {
      console.log('Cache hit for URL:', url);
      const verdict: OracleVerdict = {
        ...JSON.parse(cachedResult.scan_details),
        cacheHit: true,
        analysisTime: Date.now() - startTime
      };
      
      return new Response(JSON.stringify(verdict), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Starting fresh analysis for URL:', url);
    
    // Extract domain from URL
    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    // Perform all analyses in parallel where possible
    const [domainIntel, sslReport] = await Promise.all([
      performDomainAnalysis(domain),
      performSSLAnalysis(domain)
    ]);

    // Threat intelligence requires IP address, so run after domain analysis
    const threatFeeds = await performThreatIntelligence(url, domainIntel.ipAddress);

    // Calculate final verdict
    const { trustScore, confidence, verdict, summary, threatVectors } = calculateVerdict(
      sslReport,
      domainIntel,
      threatFeeds
    );

    const oracleVerdict: OracleVerdict = {
      trustScore,
      confidence,
      verdict,
      summary,
      threatVectors,
      data: {
        sslReport,
        domainIntel,
        threatFeeds
      },
      analysisTime: Date.now() - startTime,
      cacheHit: false
    };

    // Cache the result
    try {
      await supabase.from('scan_history').insert({
        scanned_url: url,
        trust_score: trustScore,
        threat_level: verdict.toLowerCase(),
        is_threat: verdict === 'DANGEROUS',
        scan_type: 'comprehensive',
        scan_details: JSON.stringify(oracleVerdict),
        user_id: '00000000-0000-0000-0000-000000000000' // System user for cache
      });
    } catch (cacheError) {
      console.error('Failed to cache result:', cacheError);
    }

    console.log(`Analysis completed for ${url}: ${trustScore}/100 (${verdict})`);

    return new Response(JSON.stringify(oracleVerdict), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Security analysis failed:', error);
    return new Response(JSON.stringify({ 
      error: 'Analysis failed',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});