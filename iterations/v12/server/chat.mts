import Anthropic from '@anthropic-ai/sdk';
import { createServer, IncomingMessage, ServerResponse } from 'node:http';

const PORT = parseInt(process.env.API_PORT || '3131', 10);

const CHAT_SYSTEM = `You are a helpful writing assistant. Your tone is simple, clean, humble, and to the point.
Keep every reply under 100 words. Be direct — no filler, no preamble.
You are helping the user with a cover letter or similar professional document.
Reply in plain text only (no markdown, no HTML, no bullet lists).`;

const DOCUMENT_SYSTEM = `You write professional cover letters as HTML for an in-app editor.

Rules:
- Output ONLY HTML. No markdown, no code fences, no preamble or explanation before or after the HTML.
- Use <p> elements for every paragraph. For the sign-off, use one <p> with <br> between lines if needed (e.g. "Warm regards,<br>Rakshit").
- Tone: simple, clean, humble, and to the point.
- Write a complete, believable letter. Do NOT use bracket placeholders like [X], [Company], or [Your Name]. Invent plausible, specific experience and outcomes when the user does not provide them, aligned with their request.
- Match the role and company implied by the user's request (e.g. Anthropic, product design).`;

const INLINE_EDIT_SYSTEM = `You are an inline text editor. The user selected some text in a document and gave an instruction.
Rewrite ONLY the selected text according to the instruction.
Output ONLY the replacement HTML (using <p> tags for paragraphs). No preamble, no explanation, no markdown fences.
Keep the same general length unless the instruction asks for more or less.
Tone: simple, clean, humble, and to the point.`;

const DOCUMENT_REVISE_SYSTEM = `You revise professional cover letters as HTML for an in-app editor.

Rules:
- You receive the current document HTML and the user's change request.
- Output ONLY the full revised document HTML. No markdown, no code fences, no preamble or explanation.
- Use <p> elements for every paragraph. For the sign-off, use one <p> with <br> between lines if needed.
- Tone: simple, clean, humble, and to the point.
- Do NOT use bracket placeholders like [X], [Company], or [Your Name].
- Apply the requested changes while keeping the rest of the letter intact.`;

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString()));
    req.on('error', reject);
  });
}

function extractDocumentHtml(raw: string): string {
  const trimmed = raw.trim();
  const fence = trimmed.match(/```(?:html)?\s*([\s\S]*?)```/i);
  if (fence) return fence[1].trim();
  return trimmed;
}

function textFromMessage(msg: Anthropic.Message): string {
  const parts: string[] = [];
  for (const block of msg.content) {
    if (block.type === 'text') parts.push(block.text);
  }
  return parts.join('');
}

async function handleChat(
  req: IncomingMessage,
  res: ServerResponse,
  client: Anthropic,
  body: { messages?: { role: string; content: string }[] }
) {
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'messages array is required' }));
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  const stream = client.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    system: CHAT_SYSTEM,
    messages: body.messages.map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    })),
  });

  stream.on('text', (text) => {
    res.write(`data: ${JSON.stringify({ text })}\n\n`);
  });

  stream.on('error', (err) => {
    const msg = err instanceof Error ? err.message : 'Stream error';
    res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  });

  stream.on('end', () => {
    res.write('data: [DONE]\n\n');
    res.end();
  });

  req.on('close', () => {
    stream.abort();
  });
}

async function handleDocument(
  res: ServerResponse,
  client: Anthropic,
  body: { userPrompt?: string }
) {
  const userPrompt = typeof body.userPrompt === 'string' ? body.userPrompt.trim() : '';
  if (!userPrompt) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'userPrompt is required' }));
    return;
  }

  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: DOCUMENT_SYSTEM,
      messages: [
        {
          role: 'user',
          content: `Write the full cover letter HTML for this request:\n\n${userPrompt}`,
        },
      ],
    });

    const raw = textFromMessage(msg);
    const html = extractDocumentHtml(raw);
    if (!html.includes('<p')) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          error: 'Model did not return valid paragraph HTML',
        })
      );
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ html }));
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: msg }));
  }
}

async function handleInlineEdit(
  res: ServerResponse,
  client: Anthropic,
  body: { selectedText?: string; instruction?: string; surroundingContext?: string }
) {
  const selectedText = typeof body.selectedText === 'string' ? body.selectedText.trim() : '';
  const instruction = typeof body.instruction === 'string' ? body.instruction.trim() : '';
  if (!selectedText || !instruction) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'selectedText and instruction are required' }));
    return;
  }

  const context = typeof body.surroundingContext === 'string' ? body.surroundingContext : '';
  const userContent = context
    ? `Document context:\n${context}\n\nSelected text:\n${selectedText}\n\nInstruction: ${instruction}`
    : `Selected text:\n${selectedText}\n\nInstruction: ${instruction}`;

  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: INLINE_EDIT_SYSTEM,
      messages: [{ role: 'user', content: userContent }],
    });

    const raw = textFromMessage(msg);
    const html = extractDocumentHtml(raw);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ html }));
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: msg }));
  }
}

async function handleDocumentRevise(
  res: ServerResponse,
  client: Anthropic,
  body: { currentHtml?: string; instruction?: string }
) {
  const currentHtml = typeof body.currentHtml === 'string' ? body.currentHtml.trim() : '';
  const instruction = typeof body.instruction === 'string' ? body.instruction.trim() : '';
  if (!currentHtml || !instruction) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'currentHtml and instruction are required' }));
    return;
  }

  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: DOCUMENT_REVISE_SYSTEM,
      messages: [
        {
          role: 'user',
          content: `Current document:\n${currentHtml}\n\nRequested change: ${instruction}`,
        },
      ],
    });

    const raw = textFromMessage(msg);
    const html = extractDocumentHtml(raw);
    if (!html.includes('<p')) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Model did not return valid paragraph HTML' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ html }));
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: msg }));
  }
}

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  const path = req.url?.split('?')[0] || '';
  const validRoutes = ['/api/chat', '/api/document', '/api/inline-edit', '/api/document-revise'];
  if (!validRoutes.includes(path)) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'ANTHROPIC_API_KEY is not set in .env' }));
    return;
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(await readBody(req));
  } catch {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid JSON body' }));
    return;
  }

  const client = new Anthropic({ apiKey });

  try {
    if (path === '/api/chat') {
      await handleChat(req, res, client, body as { messages?: { role: string; content: string }[] });
      return;
    }
    if (path === '/api/document') {
      await handleDocument(res, client, body as { userPrompt?: string });
      return;
    }
    if (path === '/api/inline-edit') {
      await handleInlineEdit(res, client, body as { selectedText?: string; instruction?: string; surroundingContext?: string });
      return;
    }
    if (path === '/api/document-revise') {
      await handleDocumentRevise(res, client, body as { currentHtml?: string; instruction?: string });
      return;
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: msg }));
    }
  }
});

server.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
