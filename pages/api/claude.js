export const config = {
  api: {
    bodyParser: { sizeLimit: '20mb' },
    responseLimit: false,
  },
  maxDuration: 60,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Forward the request to Anthropic, injecting the API key server-side
    const body = { ...req.body };

    // Ensure correct model
    if (!body.model || body.model === 'claude-sonnet-4-20250514') {
      body.model = 'claude-sonnet-4-6';
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // Log errors server-side for debugging
    if (!response.ok) {
      console.error('Anthropic API error:', response.status, JSON.stringify(data));
    }

    res.status(response.status).json(data);
  } catch (err) {
    console.error('Proxy error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
