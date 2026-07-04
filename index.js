// index.js - NUM TO INFO API (Single File)

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  // Get phone number from query parameter
  const { num } = req.query;
  
  if (!num) {
    return res.status(400).json({ 
      error: 'Phone number is required',
      usage: '?num=6395954711'
    });
  }

  // Validate phone number
  const cleanNum = num.toString().replace(/[^0-9]/g, '');
  if (cleanNum.length < 10 || cleanNum.length > 15) {
    return res.status(400).json({ 
      error: 'Invalid phone number. Must be 10-15 digits.'
    });
  }

  try {
    // Call external API
    const response = await fetch(
      `https://likeapisemy.gt.tc/num.php/num-info.php?key=m4x&num=${cleanNum}`,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 9; ASUS_Z01QD Build/PI)',
          'Connection': 'Keep-Alive',
          'Accept-Encoding': 'gzip',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }
    );

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
      message: error.message || 'Unknown error occurred'
    });
  }
};