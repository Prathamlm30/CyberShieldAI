// src/pages/api/scan.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 1. Get the URL to check from the request body
  const { urlToCheck } = req.body;
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY; // Store your key in an .env.local file

  if (!urlToCheck) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // 2. Prepare the request for the Google Web Risk API
  const apiUrl = `https://webrisk.googleapis.com/v1/uris:search?key=${GOOGLE_API_KEY}`;

  try {
    const googleResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uri: urlToCheck,
        threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"]
      })
    });

    const data = await googleResponse.json();

    // 3. Send a response back to your frontend
    // If 'data.threat' exists, the URL is dangerous. Otherwise, it's considered safe.
    if (data.threat) {
      res.status(200).json({ isSafe: false, threatType: data.threat.threatTypes[0] });
    } else {
      res.status(200).json({ isSafe: true, threatType: null });
    }

  } catch (error) {
    console.error('Error calling Google API:', error);
    res.status(500).json({ error: 'Failed to scan URL' });
  }
}
