import Anthropic from '@anthropic-ai/sdk';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { getFallbackHtml } from './fallback';

export const CHAT_SYSTEM = `You are a helpful writing assistant. The first user message contains the original request and the current document. Use it as context for all replies.
Your tone is simple, clean, humble, and to the point. Keep every reply under 100 words. Be direct — no filler, no preamble.
Reply in plain text only (no markdown, no HTML, no bullet lists).`;

export const DOCUMENT_SYSTEM = `You write documents as HTML for an in-app editor.

Rules:
- Output ONLY HTML. No markdown, no code fences, no preamble or explanation before or after the HTML.
- Use <p> elements for every paragraph. For multi-line sign-offs or stacked lines, use one <p> with <br> between lines.
- Match the genre, tone, and length the user requests — essay, short bio, personal statement, creative piece, professional letter, etc. Only use letter conventions (salutation, sign-off) when the user is asking for a letter or something that clearly calls for them.
- Tone: simple, clean, humble, and to the point unless the request calls for a different register.
- Write complete, specific content. Do NOT use bracket placeholders like [X] or [Your Name]. Invent plausible details when the user does not provide them, aligned with their request.`;

export const INLINE_EDIT_SYSTEM = `You are an inline text editor. The user selected some text in a document and gave an instruction.
Rewrite ONLY the selected text according to the instruction.
Output ONLY the replacement HTML (using <p> tags for paragraphs). No preamble, no explanation, no markdown fences.
Keep the same general length unless the instruction asks for more or less.
Tone: simple, clean, humble, and to the point.`;

export const DOCUMENT_REVISE_SYSTEM = `You revise documents as HTML for an in-app editor.

Rules:
- You receive the current document HTML and the user's change request.
- Output ONLY the full revised document HTML. No markdown, no code fences, no preamble or explanation.
- Use <p> elements for every paragraph. For multi-line sign-offs or stacked lines, use one <p> with <br> between lines.
- Tone: simple, clean, humble, and to the point unless the document calls for a different register.
- Do NOT use bracket placeholders like [X] or [Your Name].
- Apply the requested changes while keeping the rest of the document intact.
- Never ask for clarification or additional information. If the instruction is ambiguous, apply a reasonable interpretation and output the full revised document.`;

export function extractDocumentHtml(raw: string): string {
  const trimmed = raw.trim();
  const fence = trimmed.match(/```(?:html)?\s*([\s\S]*?)```/i);
  if (fence) return fence[1].trim();
  return trimmed;
}

export function textFromMessage(msg: { content: { type: string; text?: string }[] }): string {
  const parts: string[] = [];
  for (const block of msg.content) {
    if (block.type === 'text' && block.text != null) parts.push(block.text);
  }
  return parts.join('');
}

export async function handleChat(
  req: IncomingMessage,
  res: ServerResponse,
  client: Anthropic,
  body: { messages?: { role: string; content: string }[] }
): Promise<void> {
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

  await new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    stream.on('text', (text) => {
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    });

    stream.on('error', (err) => {
      const msg = err instanceof Error ? err.message : 'Stream error';
      res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
      finish();
    });

    stream.on('end', () => {
      res.write('data: [DONE]\n\n');
      res.end();
      finish();
    });

    req.on('close', () => {
      stream.abort();
      finish();
    });
  });
}

export async function handleDocument(
  res: ServerResponse,
  client: Anthropic,
  body: { userPrompt?: string }
): Promise<void> {
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
          content: `Write the full document HTML for this request:\n\n${userPrompt}`,
        },
      ],
    });

    const raw = textFromMessage(msg);
    const html = extractDocumentHtml(raw);
    if (!html.includes('<p')) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ html: getFallbackHtml(userPrompt), fallback: true }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ html }));
  } catch {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ html: getFallbackHtml(userPrompt), fallback: true }));
  }
}

export async function handleInlineEdit(
  res: ServerResponse,
  client: Anthropic,
  body: { selectedText?: string; instruction?: string; surroundingContext?: string }
): Promise<void> {
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

export async function handleDocumentRevise(
  res: ServerResponse,
  client: Anthropic,
  body: { currentHtml?: string; instruction?: string }
): Promise<void> {
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
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ html: currentHtml, fallback: true }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ html }));
  } catch {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ html: currentHtml, fallback: true }));
  }
}
