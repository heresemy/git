// index.js - Using CORS Proxy

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { num } = req.query;
  if (!num) {
    return res.status(400).json({ 
      error: 'Phone number required',
      usage: '?num=6395954711'
    });
  }

  const cleanNum = num.toString().replace(/[^0-9]/g, '');
  if (cleanNum.length < 10 || cleanNum.length > 15) {
    return res.status(400).json({ error: 'Invalid phone number.' });
  }

  try {
    // Try multiple proxy services
    const proxies = [
      `https://corsproxy.io/?url=${encodeURIComponent(`https://likeapisemy.gt.tc/num.php/num-info.php?key=m4x&num=${cleanNum}`)}`,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://likeapisemy.gt.tc/num.php/num-info.php?key=m4x&num=${cleanNum}`)}`,
      `https://thingproxy.freeboard.io/fetch/${encodeURIComponent(`https://likeapisemy.gt.tc/num.php/num-info.php?key=m4x&num=${cleanNum}`)}`
    ];

    let lastError = null;

    for (const proxyUrl of proxies) {
      try {
        const response = await fetch(proxyUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json'
          },
          timeout: 10000
        });

        if (response.ok) {
          const text = await response.text();
          
          // Try to parse JSON
          try {
            const data = JSON.parse(text);
            return res.status(200).json(data);
          } catch {
            // If not JSON, try to extract JSON from HTML
            const jsonMatch = text.match(/\{[^{]*"DEVELOPER"[^}]*\}/);
            if (jsonMatch) {
              const data = JSON.parse(jsonMatch[0]);
              return res.status(200).json(data);
            }
            // Return as is
            return res.status(200).json({
              status: 'success',
              response: text
            });
          }
        }
      } catch (e) {
        lastError = e;
        continue;
      }
    }

    throw new Error('All proxies failed: ' + lastError?.message);

  } catch (error) {
    return res.status(500).json({
      error: 'Failed to fetch number information',
      message: error.message,
      suggestion: 'The external API is blocking Vercel IPs. Try using a different platform.'
    });
  }
};
