import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

// Initialize Supabase client
const supabaseUrl = 'https://nhmgbrdyaciukdfnwrku.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI_ciOiJzdXBhYmFzZSIsInJlZiI6Im5obWdicmR5YWNpdWtkZm53cmt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MzIzMTcsImV4cCI6MjA3MTUwODMxN30.Z9X-NLL9BtjcIaQrmxcu346hzjdcYJh2ZLbNy3wlo7Y';
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

// --- Interfaces for type clarity (optional but good practice) ---
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


// Tier 1: DNS & WHOIS Analysis using whoisjson.com
async function performDomainAnalysis(domain: string): Promise<DomainIntel> {
  console.log(`Starting domain analysis for: ${domain}`);
  
  try {
    const ipResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
    const ipData = await ipResponse.json();
    const ipAddress = ipData.Answer?.[0]?.data || 'Unknown';

    let domainAge: number | null = null;
    let whoisData: any = {};
    
    if (WHOISJSON_API_KEY) {
      try {
        console.log(`Making WHOIS request for domain: ${domain}`);
        // +++ FIX #1: Corrected the URL by adding 'www.' +++
        const whoisResponse = await fetch('https://www.whoisjson.com/api/v1/whois', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            domain: domain,
            key: WHOISJSON_API_KEY
          })
        });
        
        if (!whoisResponse.ok) {
          console.error(`WHOIS API returned status: ${whoisResponse.status}`);
          throw new Error(`WHOIS API error: ${whoisResponse.status}`);
        }
        
        whoisData = await whoisResponse.json();
        
        if (whoisData.created_date) {
          const createdDate = new Date(whoisData.created_date);
          if (!isNaN(createdDate.getTime())) {
            domainAge = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
            console.log(`Domain age calculated: ${domainAge} days`);
          }
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
      domainAge: null, registrar: 'Unknown', createdDate: '', updatedDate: '',
      expiryDate: '', isPrivacyProtected: false, nameservers: [], ipAddress: 'Unknown'
    };
  }
}

// SSL/TLS Certificate Analysis
async function performSSLAnalysis(domain: string): Promise<SSLReport> {
    console.log(`Starting SSL analysis for: ${domain}`);
  try {
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
          validFrom, validTo, daysToExpiry,
          signatureAlgorithm: cert.sigAlg || 'Unknown',
          tlsVersions: endpoint.details?.protocols?.map((p: any) => `${p.name} ${p.version}`) || [],
          isExtendedValidation: cert.validationType === 'E',
          certificateAge
        };
      }
    }
    return {
      isValid: true, issuer: 'Unknown', validFrom: new Date().toISOString(), 
      validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      daysToExpiry: 365, signatureAlgorithm: 'Unknown', tlsVersions: ['TLS 1.3'],
      isExtendedValidation: false, certificateAge: 30
    };
  } catch (error) {
    console.error('SSL analysis failed:', error);
    return {
      isValid: false, issuer: 'Unknown', validFrom: '', validTo: '',
      daysToExpiry: 0, signatureAlgorithm: 'Unknown', tlsVersions: [],
      isExtendedValidation: false, certificateAge: 0
    };
  }
}

// Tier 2: Threat Intelligence using Google Web Risk API
async function performThreatIntelligence(url: string, ipAddress: string): Promise<ThreatFeeds> {
  console.log(`Starting threat intelligence analysis for: ${url}`);
  const results: ThreatFeeds = { virusTotalReport: null, safeBrowsingStatus: 'UNKNOWN', abuseIpReport: null };

  if (VIRUSTOTAL_API_KEY) {
      try {
        const vtSubmitResponse = await fetch('https://www.virustotal.com/api/v3/urls', {
            method: 'POST',
            headers: { 'x-apikey': VIRUSTOTAL_API_KEY, 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `url=${encodeURIComponent(url)}`
        });
        const submitData = await vtSubmitResponse.json();
        const analysisId = submitData.data?.id;
        if (analysisId) {
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

  if (GOOGLE_SAFE_BROWSING_API_KEY) {
    try {
        // +++ FIX #2: Corrected the fetch call to use POST with a JSON body +++
        const webRiskResponse = await fetch(`https://webrisk.googleapis.com/v1/uris:search?key=${GOOGLE_SAFE_BROWSING_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                uri: url,
                threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"]
            })
        });

      if (webRiskResponse.ok) {
        const webRiskData = await webRiskResponse.json();
        results.safeBrowsingStatus = webRiskData.threat ? 'DANGEROUS' : 'SAFE';
      } else {
        console.error('Google Web Risk API error:', webRiskResponse.status, await webRiskResponse.text());
        results.safeBrowsingStatus = 'UNKNOWN';
      }
    } catch (error) {
      console.error('Google Web Risk analysis failed:', error);
      results.safeBrowsingStatus = 'UNKNOWN';
    }
  }

  if (ABUSEIPDB_API_KEY && ipAddress !== 'Unknown') {
      try {
        const abuseResponse = await fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${ipAddress}&maxAgeInDays=90&verbose`, {
            headers: { 'Key': ABUSEIPDB_API_KEY, 'Accept': 'application/json' }
        });
        results.abuseIpReport = await abuseResponse.json();
      } catch (error) {
        console.error('AbuseIPDB analysis failed:', error);
      }
  }
  return results;
}

// Central Oracle Verdict Engine
async function getOracleVerdict(url: string): Promise<OracleVerdict> {
    const startTime = Date.now();
    try {
        const urlObj = new URL(url);
        const domain = urlObj.hostname;
        const settled = await Promise.allSettled([
            performDomainAnalysis(domain),
            performSSLAnalysis(domain),
        ]);
        const domainIntel = settled[0].status === 'fulfilled' ? settled[0].value as DomainIntel : {
            domainAge: null, registrar: 'Unknown', createdDate: '', updatedDate: '',
            expiryDate: '', isPrivacyProtected: false, nameservers: [], ipAddress: 'Unknown'
        };
        const sslReport = settled[1].status === 'fulfilled' ? settled[1].value as SSLReport : {
            isValid: false, issuer: 'Unknown', validFrom: '', validTo: '',
            daysToExpiry: 0, signatureAlgorithm: 'Unknown', tlsVersions: [],
            isExtendedValidation: false, certificateAge: 0
        };
        // Run threat intelligence after getting IP
        const threatFeeds = await performThreatIntelligence(url, domainIntel.ipAddress);
        const { trustScore, confidence, verdict, summary, threatVectors } = calculateVerdict(
            sslReport, domainIntel, threatFeeds
        );
        return {
            trustScore, confidence, verdict, summary, threatVectors,
            data: { sslReport, domainIntel, threatFeeds },
            analysisTime: Date.now() - startTime,
            cacheHit: false
        };
    } catch (error) {
        console.error('Oracle verdict failed:', error);
        throw error instanceof Error ? error : new Error('Analysis failed');
    }
}


// Calculate Trust Score
function calculateVerdict(sslReport: SSLReport, domainIntel: DomainIntel, threatFeeds: ThreatFeeds): {
  trustScore: number; confidence: 'HIGH' | 'MEDIUM' | 'LOW'; verdict: 'SAFE' | 'CAUTION' | 'DANGEROUS';
  summary: string; threatVectors: string[];
} {
    let score = 50;
    const threatVectors: string[] = [];
    const vtAvailable = threatFeeds.virusTotalReport && threatFeeds.virusTotalReport.data;
    const safeBrowsingAvailable = threatFeeds.safeBrowsingStatus !== 'UNKNOWN';
    const abuseIpAvailable = threatFeeds.abuseIpReport && threatFeeds.abuseIpReport.data;
    const whoisAvailable = domainIntel.domainAge !== null;
    const availableApis = [vtAvailable, safeBrowsingAvailable, abuseIpAvailable, whoisAvailable].filter(Boolean).length;
    let confidence: 'HIGH' | 'MEDIUM' | 'LOW';

    if (availableApis >= 3) {
        confidence = 'HIGH'; score = 70;
    } else if (availableApis >= 2) {
        confidence = 'MEDIUM'; score = 50;
    } else {
        confidence = 'LOW'; score = 30;
        threatVectors.push('LIMITED_INTELLIGENCE_DATA');
    }

    if (threatFeeds.safeBrowsingStatus === 'DANGEROUS') {
        score = Math.min(score - 60, 15);
        threatVectors.push('GOOGLE_SAFE_BROWSING_FLAGGED');
    }
    if (vtAvailable && threatFeeds.virusTotalReport.data.attributes?.stats?.malicious > 0) {
        const maliciousCount = threatFeeds.virusTotalReport.data.attributes.stats.malicious;
        score = Math.min(score - (maliciousCount * 15 + 45), 20);
        threatVectors.push('VIRUSTOTAL_MALICIOUS_DETECTION');
    }
    if (whoisAvailable && domainIntel.domainAge! < 7) {
        score -= 35; threatVectors.push('EXTREMELY_NEW_DOMAIN');
    } else if (whoisAvailable && domainIntel.domainAge! < 30) {
        score -= 25; threatVectors.push('RECENTLY_CREATED_DOMAIN');
    }
    if (abuseIpAvailable && threatFeeds.abuseIpReport.data.abuseConfidenceScore > 75) {
        score -= 35; threatVectors.push('IP_VERY_HIGH_ABUSE');
    } else if (abuseIpAvailable && threatFeeds.abuseIpReport.data.abuseConfidenceScore > 25) {
        score -= 20; threatVectors.push('IP_MODERATE_ABUSE');
    }
    if (!sslReport.isValid || sslReport.daysToExpiry <= 0) {
        score -= 20; threatVectors.push('INVALID_SSL_CERTIFICATE');
    }
    if (domainIntel.isPrivacyProtected) {
        score -= 8; threatVectors.push('USES_DOMAIN_PRIVACY');
    }
    if (vtAvailable && threatFeeds.virusTotalReport.data.attributes?.stats?.malicious === 0 && safeBrowsingAvailable && threatFeeds.safeBrowsingStatus === 'SAFE') {
        score += 25;
    }
    if (whoisAvailable && domainIntel.domainAge! > 3650) {
        score += 15;
    } else if (whoisAvailable && domainIntel.domainAge! > 1825) {
        score += 10;
    }

    score = Math.max(0, Math.min(100, score));

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
    if (threatVectors.length > 0) {
        const topThreat = threatVectors[0];
        if (topThreat.includes('MALICIOUS') || topThreat.includes('FLAGGED')) {
            summary = 'This domain is flagged as malicious by security vendors.';
        } else if (topThreat.includes('EXTREMELY_NEW') || topThreat.includes('RECENTLY_CREATED')) {
            summary = 'This domain was registered very recently, a common red flag.';
        } else if (topThreat.includes('LIMITED_INTELLIGENCE')) {
            summary = 'Limited threat intelligence available. Score based on partial analysis.';
        }
    }

    return { trustScore: Math.round(score), confidence, verdict, summary, threatVectors };
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
    try { new URL(url); } catch {
      return new Response(JSON.stringify({ status: 'ERROR', message: 'Invalid URL provided.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    const startTime = Date.now();

    // Cache check
    const { data: cachedResult } = await supabase
      .from('scan_history')
      .select('*')
      .eq('scanned_url', url)
      .gte('created_at', new Date(Date.now() - 3600000).toISOString())
      .order('created_at', { ascending: false }).limit(1).maybeSingle();
    
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
    const oracleResult = await getOracleVerdict(url);
    
    // Cache result
    try {
        await supabase.from('scan_history').insert({
            scanned_url: url,
            trust_score: (oracleResult as OracleVerdict).trustScore,
            threat_level: (oracleResult as OracleVerdict).verdict.toLowerCase(),
            is_threat: (oracleResult as OracleVerdict).verdict === 'DANGEROUS',
            scan_type: 'comprehensive',
            scan_details: JSON.stringify(oracleResult),
            user_id: '00000000-0000-0000-0000-000000000000'
        });
    } catch (cacheError) {
        console.error('Failed to cache result:', cacheError);
    }

    console.log(`Analysis completed for ${url}: ${(oracleResult as OracleVerdict).trustScore}/100 (${(oracleResult as OracleVerdict).verdict})`);
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

