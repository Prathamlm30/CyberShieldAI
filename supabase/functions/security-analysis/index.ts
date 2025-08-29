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
const WHOISJSON_API_KEY = Deno.env.get('WHOISJSON_API_KEY');

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
  domainAge: number | null;
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

// Tier 1: DNS & WHOIS Analysis using whoisjson.com
async function performDomainAnalysis(domain: string): Promise<DomainIntel> {
  console.log(`Starting domain analysis for: ${domain}`);
  
  try {
    // Get IP address
    const ipResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
    const ipData = await ipResponse.json();
    const ipAddress = ipData.Answer?.[0]?.data || 'Unknown';

    // WHOIS lookup using whoisjson.com with API key
    let domainAge: number | null = null;
    let whoisData: any = {};
    
    if (WHOISJSON_API_KEY) {
      try {
        console.log(`Making WHOIS request for domain: ${domain}`);
        const whoisResponse = await fetch('https://whoisjson.com/api/v1/whois', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            domain: domain,
            key: WHOISJSON_API_KEY
          })
        });
        
        if (!whoisResponse.ok) {
          console.error(`WHOIS API returned status: ${whoisResponse.status}`);
          throw new Error(`WHOIS API error: ${whoisResponse.status}`);
        }
        
        const responseText = await whoisResponse.text();
        console.log(`WHOIS response: ${responseText.substring(0, 200)}...`);
        
        try {
          whoisData = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Failed to parse WHOIS JSON:', parseError);
          console.log('Raw response:', responseText);
          throw new Error('Invalid JSON response from WHOIS API');
        }
        
        // Calculate domain age if created_date exists
        if (whoisData.created_date) {
          const createdDate = new Date(whoisData.created_date);
          if (!isNaN(createdDate.getTime())) {
            domainAge = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
            console.log(`Domain age calculated: ${domainAge} days`);
          } else {
            console.error('Invalid created_date format:', whoisData.created_date);
          }
        } else {
          console.log('No created_date found in WHOIS response');
        }
      } catch (whoisError) {
        console.error('WHOIS lookup failed:', whoisError);
        domainAge = null;
      }
    } else {
      console.log('WHOISJSON_API_KEY not configured');
    }
    
    return {
      domainAge,
      registrar: whoisData.registrar || 'Unknown',
      createdDate: whoisData.created_date || '',
      updatedDate: whoisData.updated_date || '',
      expiryDate: whoisData.expiry_date || '',
      isPrivacyProtected: whoisData.privacy || false,
      nameservers: whoisData.nameservers || [],
      ipAddress
    };
  } catch (error) {
    console.error('Domain analysis failed:', error);
    return {
      domainAge: null,
      registrar: 'Unknown',
      createdDate: '',
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

// Tier 2: Threat Intelligence using Google Web Risk API
async function performThreatIntelligence(url: string, ipAddress: string): Promise<ThreatFeeds> {
  console.log(`Starting threat intelligence analysis for: ${url}`);
  
  const results: ThreatFeeds = {
    virusTotalReport: null,
    safeBrowsingStatus: 'UNKNOWN',
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

  // Google Web Risk API (replacing Safe Browsing)
  if (GOOGLE_SAFE_BROWSING_API_KEY) {
    try {
      const encodedUrl = encodeURIComponent(url);
      const threatTypes = 'MALWARE,SOCIAL_ENGINEERING,UNWANTED_SOFTWARE';
      const webRiskResponse = await fetch(`https://webrisk.googleapis.com/v1/uris:search?key=${GOOGLE_SAFE_BROWSING_API_KEY}&uri=${encodedUrl}&threatTypes=${threatTypes}`);
      
      if (webRiskResponse.ok) {
        const webRiskData = await webRiskResponse.json();
        // If response contains a threat object, site is dangerous; empty {} means safe
        results.safeBrowsingStatus = webRiskData.threat ? 'DANGEROUS' : 'SAFE';
      } else {
        console.error('Google Web Risk API error:', webRiskResponse.status);
        // Graceful degrade
        results.safeBrowsingStatus = 'UNKNOWN';
      }
    } catch (error) {
      console.error('Google Web Risk analysis failed:', error);
      results.safeBrowsingStatus = 'UNKNOWN';
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

// Central Oracle Verdict Engine - Implements Trusted Domain Override & Error Handling
async function getOracleVerdict(url: string): Promise<OracleVerdict | { status: string; summary: string }> {
  const startTime = Date.now();
  
  try {
    // Extract domain from URL
    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    // Run all API calls in parallel with Promise.allSettled for maximum resilience
    const settled = await Promise.allSettled([
      performDomainAnalysis(domain),
      performSSLAnalysis(domain),
      performThreatIntelligence(url, '')
    ]);

    const domainIntel = settled[0].status === 'fulfilled' ? settled[0].value : {
      domainAge: null,
      registrar: 'Unknown',
      createdDate: '',
      updatedDate: '',
      expiryDate: '',
      isPrivacyProtected: false,
      nameservers: [],
      ipAddress: 'Unknown'
    };
    if (settled[0].status === 'rejected') {
      console.error('ERROR: Domain analysis failed:', settled[0].reason);
    }

    const sslReport = settled[1].status === 'fulfilled' ? settled[1].value : {
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
    if (settled[1].status === 'rejected') {
      console.error('ERROR: SSL analysis failed:', settled[1].reason);
    }

    const threatFeeds = settled[2].status === 'fulfilled' ? settled[2].value : {
      virusTotalReport: null,
      safeBrowsingStatus: 'UNKNOWN',
      abuseIpReport: null
    };
    if (settled[2].status === 'rejected') {
      console.error('ERROR: Threat intelligence aggregation failed:', settled[2].reason);
    }

    // Critical secrets presence check
    const vtMissing = !VIRUSTOTAL_API_KEY;
    const webRiskMissing = !GOOGLE_SAFE_BROWSING_API_KEY;
    if (vtMissing && webRiskMissing) {
      throw new Error('FATAL ERROR: VIRUSTOTAL_API_KEY and GOOGLE_SAFE_BROWSING_API_KEY are not configured');
    }

    // Determine core intelligence availability
    const vtError = vtMissing || !threatFeeds.virusTotalReport;
    const webRiskError = webRiskMissing || threatFeeds.safeBrowsingStatus === 'UNKNOWN';
    if (vtError && webRiskError) {
      throw new Error('Analysis Failed: Core threat intelligence sources are currently unavailable.');
    }

    // Update threat feeds with correct IP
    if (domainIntel.ipAddress !== 'Unknown' && ABUSEIPDB_API_KEY) {
      try {
        const abuseResponse = await fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${domainIntel.ipAddress}&maxAgeInDays=90&verbose`, {
          headers: {
            'Key': ABUSEIPDB_API_KEY,
            'Accept': 'application/json'
          }
        });
        threatFeeds.abuseIpReport = await abuseResponse.json();
      } catch (error) {
        console.error('AbuseIPDB analysis failed:', error);
      }
    }

    // Graceful degradation: don't fail if intel sources error
    if (threatFeeds.safeBrowsingStatus === 'ERROR') {
      console.error('Web Risk returned ERROR; degrading to UNKNOWN and continuing');
      threatFeeds.safeBrowsingStatus = 'UNKNOWN';
    }

    if (VIRUSTOTAL_API_KEY && !threatFeeds.virusTotalReport) {
      console.error('VirusTotal report unavailable; continuing with partial intelligence');
    }

    const { trustScore, confidence, verdict, summary, threatVectors } = calculateVerdict(
      sslReport,
      domainIntel,
      threatFeeds
    );

    return {
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

  } catch (error) {
    console.error('Oracle verdict failed:', error);
    // Bubble up a specific error so the caller can return a structured error response
    throw error instanceof Error ? error : new Error('Analysis failed');
  }
}

// Calculate Trust Score with Trusted Domain Override
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

  // TRUSTED DOMAIN OVERRIDE: Check if VT malicious = 0 AND Google Safe Browsing = SAFE
  const isTrustedDomain = (
    threatFeeds.virusTotalReport?.data?.attributes?.stats?.malicious === 0 &&
    threatFeeds.safeBrowsingStatus === 'SAFE'
  );
  const scoreFloor = isTrustedDomain ? 65 : 0;

  // Critical Penalties
  if (threatFeeds.safeBrowsingStatus === 'DANGEROUS') {
    score = Math.min(score - 70, 40);
    threatVectors.push('GOOGLE_SAFE_BROWSING_FLAGGED');
  }

  if (threatFeeds.virusTotalReport?.data?.attributes?.stats?.malicious > 0) {
    score = Math.min(score - 70, 40);
    threatVectors.push('MALICIOUS_FLAG_VIRUSTOTAL');
  }

  // High Penalties - Only apply if domain age is not null
  if (domainIntel.domainAge !== null && domainIntel.domainAge < 30) {
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

  // Medium Penalties - Only apply if domain age is not null
  if (domainIntel.domainAge !== null && domainIntel.domainAge < 90) {
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

  // Positive Indicators (Bonuses) - Only apply if domain age is not null
  if (domainIntel.domainAge !== null && domainIntel.domainAge > 3650) { // > 10 years
    score += 10;
  }

  if (sslReport.isExtendedValidation) {
    score += 5;
  }

  if (['DigiCert', 'Sectigo', 'GlobalSign'].includes(sslReport.issuer)) {
    score += 5;
  }

  // Apply Trusted Domain Override scoreFloor
  score = Math.max(scoreFloor, Math.min(100, score));

  // Determine confidence based on API availability
  if (!threatFeeds.virusTotalReport && !threatFeeds.abuseIpReport) {
    confidence = 'LOW';
  } else if (!threatFeeds.virusTotalReport || !threatFeeds.abuseIpReport) {
    confidence = 'MEDIUM';
  }

  // Determine verdict and dynamic summary
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

  // Generate dynamic summary based on confirmed threat vectors
  if (threatVectors.length > 0) {
    const topThreat = threatVectors[0];
    if (topThreat.includes('MALICIOUS') || topThreat.includes('FLAGGED')) {
      summary = 'This domain is flagged as malicious by multiple security vendors.';
    } else if (topThreat.includes('RECENTLY_CREATED')) {
      summary = 'This domain was registered recently, which is a common indicator of malicious intent.';
    } else if (topThreat.includes('IP_HIGH_ABUSE')) {
      summary = 'This domain\'s IP address has a high abuse confidence rating.';
    }
  }

  // Override summary for trusted domains
  if (isTrustedDomain && verdict === 'SAFE') {
    summary = 'This URL is verified safe by multiple trusted security sources.';
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
      return new Response(JSON.stringify({ status: 'ERROR', message: 'URL is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate URL early
    try {
      new URL(url);
    } catch {
      return new Response(JSON.stringify({ status: 'ERROR', message: 'Invalid URL provided.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const startTime = Date.now();

    // Check cache first (1 hour)
    const { data: cachedResult } = await supabase
      .from('scan_history')
      .select('*')
      .eq('scanned_url', url)
      .gte('created_at', new Date(Date.now() - 3600000).toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cachedResult) {
      console.log('Cache hit for URL:', url);
      const verdict: OracleVerdict = {
        ...JSON.parse(cachedResult.scan_details),
        cacheHit: true,
        analysisTime: Date.now() - startTime,
      };
      return new Response(JSON.stringify({ status: 'SUCCESS', data: verdict }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Starting fresh analysis for URL:', url);

    // Compute result using the Oracle engine
    let oracleResult: OracleVerdict;
    try {
      const result = await getOracleVerdict(url);
      if ('status' in (result as any)) {
        // Backward compatibility: legacy error object
        const legacy = result as { status: string; summary: string };
        return new Response(JSON.stringify({ status: 'ERROR', message: legacy.summary }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        oracleResult = result as OracleVerdict;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed';
      return new Response(JSON.stringify({ status: 'ERROR', message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Cache the successful result (best-effort)
    try {
      await supabase.from('scan_history').insert({
        scanned_url: url,
        trust_score: oracleResult.trustScore,
        threat_level: oracleResult.verdict.toLowerCase(),
        is_threat: oracleResult.verdict === 'DANGEROUS',
        scan_type: 'comprehensive',
        scan_details: JSON.stringify(oracleResult),
        user_id: '00000000-0000-0000-0000-000000000000'
      });
    } catch (cacheError) {
      console.error('Failed to cache result:', cacheError);
    }

    console.log(`Analysis completed for ${url}: ${oracleResult.trustScore}/100 (${oracleResult.verdict})`);

    return new Response(JSON.stringify({ status: 'SUCCESS', data: oracleResult }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Security analysis failed (top-level):', error);
    const message = error instanceof Error ? error.message : 'Unexpected error during analysis';
    return new Response(JSON.stringify({ status: 'ERROR', message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});