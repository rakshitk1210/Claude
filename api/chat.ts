import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';
import { handleChat } from './lib/handlers';
import { setCors } from './lib/cors';

export const config = {
  maxDuration: 60,
};

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  setCors(res);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY is not set' });
    return;
  }

  const body = (typeof req.body === 'object' && req.body !== null
    ? req.body
    : JSON.parse(String(req.body || '{}'))) as { messages?: { role: string; content: string }[] };

  const client = new Anthropic({ apiKey });
  try {
    await handleChat(req, res, client, body);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (!res.headersSent) {
      res.status(500).json({ error: msg });
    }
  }
}
