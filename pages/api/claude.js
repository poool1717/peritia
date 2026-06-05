export const config = {
  api: {
    bodyParser: { sizeLimit: '20mb' },
    responseLimit: false,
  },
  maxDuration: 60,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: { type: 'config_error', message: 'ANTHROPIC_API_KEY no configurada en Vercel' } });
  }

  try {
    const body = { ...req.body };

    // Ensure required fields are always present
    if (!body.model || body.model.includes('20250514')) body.model = 'claude-sonnet-4-6';
    if (!body.max_tokens) body.max_tokens = 1500;
    if (!body.messages || !body.messages.length) {
      return res.status(400).json({ error: { message: 'messages array is required' } });
    }

    const hasPDF = JSON.stringify(body).includes('"application/pdf"');
    console.log(`[proxy] model=${body.model} max_tokens=${body.max_tokens} hasPDF=${hasPDF}`);

    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    };
    if (hasPDF) headers['anthropic-beta'] = 'pdfs-2024-09-25';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data?.error?.message || JSON.stringify(data).slice(0, 300);
      console.error(`[proxy] Anthropic ${response.status}:`, errMsg);
      return res.status(response.status).json(data);
    }

    console.log(`[proxy] OK tokens=${data.usage?.input_tokens}/${data.usage?.output_tokens}`);
    return res.status(200).json(data);

  } catch (err) {
    console.error('[proxy] Exception:', err.message);
    return res.status(500).json({ error: { type: 'proxy_error', message: err.message } });
  }
}
