export const config = {
  api: {
    bodyParser: { sizeLimit: '20mb' },
    responseLimit: false,
  },
  maxDuration: 60,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Check API key first
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY is not set');
    return res.status(500).json({ error: { type: 'config_error', message: 'ANTHROPIC_API_KEY no configurada en Vercel' } });
  }

  try {
    const body = { ...req.body };
    if (!body.model || body.model.includes('20250514')) body.model = 'claude-sonnet-4-6';

    const hasPDF = JSON.stringify(body).includes('"application/pdf"');
    console.log(`[claude proxy] model=${body.model} hasPDF=${hasPDF} max_tokens=${body.max_tokens}`);

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
      const errMsg = JSON.stringify(data).slice(0, 400);
      console.error(`[claude proxy] Anthropic error ${response.status}:`, errMsg);
      // Return full error so client can show it
      return res.status(response.status).json(data);
    }

    console.log(`[claude proxy] OK input=${data.usage?.input_tokens} output=${data.usage?.output_tokens}`);
    return res.status(200).json(data);

  } catch (err) {
    console.error('[claude proxy] Exception:', err.message);
    return res.status(500).json({ error: { type: 'proxy_error', message: err.message } });
  }
}
