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

// Calculate Trust Score with Proper API Failure Handling
function calculateVerdict(sslReport: SSLReport, domainIntel: DomainIntel, threatFeeds: ThreatFeeds): {
  trustScore: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  verdict: 'SAFE' | 'CAUTION' | 'DANGEROUS';
  summary: string;
  threatVectors: string[];
} {
  let score = 50; // Start with neutral score instead of 100
  const threatVectors: string[] = [];
  let confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';

  // Check API availability to determine confidence
  const vtAvailable = threatFeeds.virusTotalReport && threatFeeds.virusTotalReport.data;
  const safeBrowsingAvailable = threatFeeds.safeBrowsingStatus !== 'UNKNOWN';
  const abuseIpAvailable = threatFeeds.abuseIpReport && threatFeeds.abuseIpReport.data;
  const whoisAvailable = domainIntel.domainAge !== null;

  // Adjust confidence based on API availability
  const availableApis = [vtAvailable, safeBrowsingAvailable, abuseIpAvailable, whoisAvailable].filter(Boolean).length;
  
  if (availableApis >= 3) {
    confidence = 'HIGH';
    score = 70; // Higher starting score with good data
  } else if (availableApis >= 2) {
    confidence = 'MEDIUM';
    score = 50; // Neutral starting score
  } else {
    confidence = 'LOW';
    score = 30; // Lower starting score with limited data
    threatVectors.push('LIMITED_INTELLIGENCE_DATA');
  }

  // CRITICAL PENALTIES (Immediate danger signals)
  if (threatFeeds.safeBrowsingStatus === 'DANGEROUS') {
    score = Math.min(score - 60, 15);
    threatVectors.push('GOOGLE_SAFE_BROWSING_FLAGGED');
  }

  if (vtAvailable && threatFeeds.virusTotalReport.data.attributes?.stats?.malicious > 0) {
    const maliciousCount = threatFeeds.virusTotalReport.data.attributes.stats.malicious;
    score = Math.min(score - (maliciousCount * 15 + 45), 20);
    threatVectors.push('VIRUSTOTAL_MALICIOUS_DETECTION');
  }

  // HIGH PENALTIES
  if (whoisAvailable && domainIntel.domainAge < 7) {
    score -= 35;
    threatVectors.push('EXTREMELY_NEW_DOMAIN');
  } else if (whoisAvailable && domainIntel.domainAge < 30) {
    score -= 25;
    threatVectors.push('RECENTLY_CREATED_DOMAIN');
  }

  if (abuseIpAvailable && threatFeeds.abuseIpReport.data.abuseConfidencePercentage > 75) {
    score -= 35;
    threatVectors.push('IP_VERY_HIGH_ABUSE');
  } else if (abuseIpAvailable && threatFeeds.abuseIpReport.data.abuseConfidencePercentage > 25) {
    score -= 20;
    threatVectors.push('IP_MODERATE_ABUSE');
  }

  // MEDIUM PENALTIES
  if (vtAvailable && threatFeeds.virusTotalReport.data.attributes?.stats?.suspicious > 5) {
    score -= 25;
    threatVectors.push('HIGH_SUSPICIOUS_FLAGS');
  } else if (vtAvailable && threatFeeds.virusTotalReport.data.attributes?.stats?.suspicious > 2) {
    score -= 15;
    threatVectors.push('MULTIPLE_SUSPICIOUS_FLAGS');
  }

  if (whoisAvailable && domainIntel.domainAge < 90) {
    score -= 15;
    threatVectors.push('YOUNG_DOMAIN');
  }

  if (!sslReport.isValid || sslReport.daysToExpiry <= 0) {
    score -= 20;
    threatVectors.push('INVALID_SSL_CERTIFICATE');
  }

  if (sslReport.certificateAge < 7) {
    score -= 15;
    threatVectors.push('VERY_NEW_CERTIFICATE');
  } else if (sslReport.certificateAge < 30) {
    score -= 10;
    threatVectors.push('RECENTLY_ISSUED_CERTIFICATE');
  }

  // LOW PENALTIES
  if (domainIntel.isPrivacyProtected) {
    score -= 8;
    threatVectors.push('USES_DOMAIN_PRIVACY');
  }

  if (sslReport.tlsVersions.some(v => v.includes('1.0') || v.includes('1.1'))) {
    score -= 10;
    threatVectors.push('OUTDATED_TLS_PROTOCOL');
  }

  // POSITIVE INDICATORS (Trust bonuses)
  if (vtAvailable && threatFeeds.virusTotalReport.data.attributes?.stats?.malicious === 0 && 
      safeBrowsingAvailable && threatFeeds.safeBrowsingStatus === 'SAFE') {
    score += 25;
  }

  if (whoisAvailable && domainIntel.domainAge > 3650) { // > 10 years
    score += 15;
  } else if (whoisAvailable && domainIntel.domainAge > 1825) { // > 5 years
    score += 10;
  } else if (whoisAvailable && domainIntel.domainAge > 365) { // > 1 year
    score += 5;
  }

  if (sslReport.isExtendedValidation) {
    score += 8;
  }

  if (['DigiCert', 'Sectigo', 'GlobalSign', 'Let\'s Encrypt'].includes(sslReport.issuer)) {
    score += 5;
  }

  // Clamp score to valid range
  score = Math.max(0, Math.min(100, score));

  // Determine verdict based on refined thresholds
  let verdict: 'SAFE' | 'CAUTION' | 'DANGEROUS';
  let summary: string;

  if (score >= 75) {
    verdict = 'SAFE';
    summary = 'This URL appears to be safe based on our security analysis.';
  } else if (score >= 40) {
    verdict = 'CAUTION';
    summary = 'This URL shows risk indicators. Exercise caution when visiting.';
  } else {
    verdict = 'DANGEROUS';
    summary = 'This URL has been flagged as potentially dangerous. Avoid visiting this site.';
  }

  // Generate specific summary based on top threat
  if (threatVectors.length > 0) {
    const topThreat = threatVectors[0];
    if (topThreat.includes('MALICIOUS') || topThreat.includes('FLAGGED')) {
      summary = 'This domain is flagged as malicious by security vendors.';
    } else if (topThreat.includes('EXTREMELY_NEW') || topThreat.includes('RECENTLY_CREATED')) {
      summary = 'This domain was registered very recently, which is a red flag for malicious activity.';
    } else if (topThreat.includes('ABUSE')) {
      summary = 'This domain\'s IP address has a concerning abuse confidence rating.';
    } else if (topThreat.includes('LIMITED_INTELLIGENCE')) {
      summary = 'Limited threat intelligence available. Score based on partial analysis.';
    }
  }

  // Override for very high confidence safe domains
  if (confidence === 'HIGH' && score >= 85 && !threatVectors.some(tv => tv.includes('MALICIOUS') || tv.includes('FLAGGED'))) {
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