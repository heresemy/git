// index.js - NUM TO INFO API (Fixed 403 Error)

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  const { num } = req.query;
  
  if (!num) {
    return res.status(400).json({ 
      error: 'Phone number is required',
      usage: '?num=6395954711'
    });
  }

  const cleanNum = num.toString().replace(/[^0-9]/g, '');
  if (cleanNum.length < 10 || cleanNum.length > 15) {
    return res.status(400).json({ 
      error: 'Invalid phone number. Must be 10-15 digits.'
    });
  }

  try {
    // Multiple User-Agents to avoid blocking
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
      'Dalvik/2.1.0 (Linux; U; Android 9; ASUS_Z01QD Build/PI)',
      'Mozilla/5.0 (Linux; Android 11; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.230 Mobile Safari/537.36'
    ];
    
    const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];

    // Call external API with more headers
    const response = await fetch(
      `https://likeapisemy.gt.tc/num.php/num-info.php?key=m4x&num=${cleanNum}`,
      {
        method: 'GET',
        headers: {
          'User-Agent': randomUA,
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'cross-site',
          'Referer': 'https://google.com/',
          'Origin': 'https://likeapisemy.gt.tc'
        }
      }
    );

    // If still 403, try alternative approach
    if (response.status === 403) {
      // Try with different headers
      const altResponse = await fetch(
        `https://likeapisemy.gt.tc/num.php/num-info.php?key=m4x&num=${cleanNum}`,
        {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
            'Connection': 'keep-alive',
            'Referer': 'https://likeapisemy.gt.tc/',
            'X-Requested-With': 'XMLHttpRequest'
          }
        }
      );
      
      if (altResponse.ok) {
        const data = await altResponse.json();
        return res.status(200).json(data);
      }
      
      throw new Error('API access denied (403). Try using a VPN or proxy.');
    }

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      return res.status(200).json({
        status: 'success',
        raw: responseText,
        note: 'Response received but not in JSON format'
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error('Error fetching number info:', error);
    return res.status(500).json({
      error: 'Failed to fetch number information',
      message: error.message || 'Unknown error occurred',
      suggestion: 'Try using a different IP or VPN'
    });
  }
};
