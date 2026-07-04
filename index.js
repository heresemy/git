// index.js - Handle Anti-Bot Protection

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

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
    // First, try to get the page with cookies
    const cookieJar = [];
    
    // Step 1: Make initial request to get cookies
    const initialResponse = await fetch(
      `https://likeapisemy.gt.tc/num.php/num-info.php?key=m4x&num=${cleanNum}`,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Upgrade-Insecure-Requests': '1'
        },
        redirect: 'manual'
      }
    );

    // Get cookies from response
    const setCookie = initialResponse.headers.get('set-cookie');
    if (setCookie) {
      cookieJar.push(setCookie.split(';')[0]);
    }

    // Step 2: Try with cookies and proper headers
    const response = await fetch(
      `https://likeapisemy.gt.tc/num.php/num-info.php?key=m4x&num=${cleanNum}`,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache',
          'Cookie': cookieJar.join('; '),
          'Referer': 'https://likeapisemy.gt.tc/',
          'Origin': 'https://likeapisemy.gt.tc',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin'
        }
      }
    );

    const responseText = await response.text();
    
    // Check if we got HTML (anti-bot protection)
    if (responseText.includes('<html') || responseText.includes('script')) {
      // Try one more time with a different approach
      const retryResponse = await fetch(
        `https://likeapisemy.gt.tc/num.php/num-info.php?key=m4x&num=${cleanNum}`,
        {
          method: 'GET',
          headers: {
            'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 9; ASUS_Z01QD Build/PI)',
            'Accept': 'application/json',
            'Connection': 'Keep-Alive',
            'Accept-Encoding': 'gzip',
            'X-Requested-With': 'XMLHttpRequest'
          }
        }
      );
      
      const retryText = await retryResponse.text();
      
      if (retryText.includes('<html')) {
        return res.status(503).json({
          error: 'Service unavailable - Anti-bot protection detected',
          message: 'The external API requires JavaScript execution which cannot be done server-side',
          suggestion: 'Try using this API from a browser instead of server',
          raw: retryText.substring(0, 500) + '...'
        });
      }
      
      try {
        const data = JSON.parse(retryText);
        return res.status(200).json(data);
      } catch {
        return res.status(200).json({
          status: 'success',
          raw: retryText,
          note: 'Response received'
        });
      }
    }

    // Try to parse as JSON
    try {
      const data = JSON.parse(responseText);
      return res.status(200).json(data);
    } catch {
      return res.status(200).json({
        status: 'success',
        raw: responseText,
        note: 'Response received but not in JSON format'
      });
    }

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      error: 'Failed to fetch number information',
      message: error.message,
      suggestion: 'Try again later or use a different API'
    });
  }
};
