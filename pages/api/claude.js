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
    const body = { ...req.body };

    // Ensure correct current model
    if (!body.model || body.model.includes('20250514')) {
      body.model = 'claude-sonnet-4-6';
    }

    // Detect if request contains PDF documents
    const hasPDF = JSON.stringify(body).includes('"application/pdf"');

    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    };

    // Add PDF beta header only when needed
    if (hasPDF) {
      headers['anthropic-beta'] = 'pdfs-2024-09-25';
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API error:', response.status, JSON.stringify(data).slice(0, 500));
    }

    res.status(response.status).json(data);
  } catch (err) {
    console.error('Proxy error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
