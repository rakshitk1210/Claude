import Anthropic from '@anthropic-ai/sdk';
import { createServer, IncomingMessage, ServerResponse } from 'node:http';

const PORT = parseInt(process.env.API_PORT || '3131', 10);

const CHAT_SYSTEM = `You are a helpful writing assistant. The first user message contains the original request and the current document. Use it as context for all replies.
Your tone is simple, clean, humble, and to the point. Keep every reply under 100 words. Be direct — no filler, no preamble.
Reply in plain text only (no markdown, no HTML, no bullet lists).`;

const DOCUMENT_SYSTEM = `You write documents as HTML for an in-app editor.

Rules:
- Output ONLY HTML. No markdown, no code fences, no preamble or explanation before or after the HTML.
- Use <p> elements for every paragraph. For multi-line sign-offs or stacked lines, use one <p> with <br> between lines.
- Match the genre, tone, and length the user requests — essay, short bio, personal statement, creative piece, professional letter, etc. Only use letter conventions (salutation, sign-off) when the user is asking for a letter or something that clearly calls for them.
- Tone: simple, clean, humble, and to the point unless the request calls for a different register.
- Write complete, specific content. Do NOT use bracket placeholders like [X] or [Your Name]. Invent plausible details when the user does not provide them, aligned with their request.`;

const INLINE_EDIT_SYSTEM = `You are an inline text editor. The user selected some text in a document and gave an instruction.
Rewrite ONLY the selected text according to the instruction.
Output ONLY the replacement HTML (using <p> tags for paragraphs). No preamble, no explanation, no markdown fences.
Keep the same general length unless the instruction asks for more or less.
Tone: simple, clean, humble, and to the point.`;

const DOCUMENT_REVISE_SYSTEM = `You revise documents as HTML for an in-app editor.

Rules:
- You receive the current document HTML and the user's change request.
- Output ONLY the full revised document HTML. No markdown, no code fences, no preamble or explanation.
- Use <p> elements for every paragraph. For multi-line sign-offs or stacked lines, use one <p> with <br> between lines.
- Tone: simple, clean, humble, and to the point unless the document calls for a different register.
- Do NOT use bracket placeholders like [X] or [Your Name].
- Apply the requested changes while keeping the rest of the document intact.`;

// ---------------------------------------------------------------------------
// Fallback content — served when the AI API is unavailable
// ---------------------------------------------------------------------------
const FALLBACK_ENTRIES: { keywords: string[]; paragraphs: string[] }[] = [
  {
    keywords: ['cover letter', 'job', 'apply', 'position', 'role', 'hire', 'application', 'resume', 'cv', 'opportunity', 'company', 'employer'],
    paragraphs: [
      "I am writing to express my sincere interest in joining your team. Over the past several years I have developed a strong foundation in product thinking, cross-functional collaboration, and delivering work that balances user needs with business goals.",
      "In my most recent role I led the end-to-end redesign of a core user-facing workflow, reducing task completion time by 34% and improving satisfaction scores across three consecutive quarters. I worked closely with engineering, data, and customer success to ensure the changes were grounded in real evidence rather than assumption.",
      "What draws me to your organisation specifically is the clarity of your product vision and the obvious care you put into the details. I would be proud to contribute to that standard.",
      "I bring a working style that is direct, curious, and accountable. I ask hard questions early, communicate openly when priorities conflict, and follow through on commitments.",
      "I would welcome the chance to talk in more detail about how my background maps to what you are looking for. Thank you sincerely for your time and consideration.",
      "Warm regards,",
    ],
  },
  {
    keywords: ['essay', 'write', 'short', 'paragraph', 'about', 'topic', 'explain', 'describe', 'overview', 'summary'],
    paragraphs: [
      "Every significant idea begins as a small, quiet observation — a moment where something that seemed obvious suddenly requires a closer look. The history of progress is really a history of people who were willing to sit with that discomfort long enough to find out what it meant.",
      "What makes an idea worth holding onto is not novelty alone, but the way it reorders what you already knew. A good insight reveals a pattern that was always present, hidden in plain sight beneath familiar surfaces.",
      "There is a certain discipline required to develop thinking past its first expression. Most ideas arrive half-formed, more feeling than argument. The work is in the refinement — in finding the language that matches the thing itself.",
      "Writing is often how that refinement happens. To put words on a page is to commit to a position, however provisional, and commitment surfaces the gaps.",
      "The best essays do not arrive at conclusions so much as they arrive at better questions — leaving the reader with a sharper sense of the problem, and occasionally a glimpse of where the next question might lead.",
    ],
  },
  {
    keywords: ['bio', 'about me', 'profile', 'introduction', 'who i am', 'personal', 'background', 'story', 'myself'],
    paragraphs: [
      "I am a designer and builder with a long-standing interest in the space where technology meets human behaviour. My work has spanned product design, strategy, and early-stage development — always with a focus on making complex things feel simple and honest.",
      "I grew up curious about how systems work: not just the mechanics, but the decisions embedded in them. That curiosity led me to a career spent trying to make the intersection of people and tools a little less frustrating.",
      "Outside of work I read broadly, spend time outdoors, and pursue the ongoing, mostly futile project of learning to cook without a recipe.",
      "I care about directness, about doing what you said you would do, and about the kind of craft that shows up in the parts people do not notice.",
    ],
  },
  {
    keywords: ['creative', 'story', 'fiction', 'poem', 'scene', 'narrative', 'character', 'imagine', 'write a story', 'short story'],
    paragraphs: [
      "The last train left at eleven, and she was still on the platform at quarter past, watching the red tail-light shrink to a point and then disappear into the dark.",
      "She had missed it on purpose. She was not ready to go back to the apartment, to the particular silence it held now, to the way a room can carry an absence like a held note.",
      "The station attendant swept the same square of floor he had been sweeping since she arrived. He did not look up. There is a kindness in that — in people who understand that being witnessed is not always what you need.",
      "After a while the attendant set down his broom and disappeared into a back room. She was alone. The next train would not come for forty minutes. She decided she would stay for all of them.",
    ],
  },
  {
    keywords: ['letter', 'dear', 'formal', 'professional', 'request', 'proposal', 'memo', 'correspondence', 'official'],
    paragraphs: [
      "I am writing to follow up on our recent conversation and to set out my thinking in a more considered form. I hope this provides useful context as you weigh the next steps.",
      "The core of my proposal is straightforward: a focused engagement over eight weeks, with a defined scope, clear deliverables, and a single point of contact on each side.",
      "In practical terms the engagement would begin with a discovery phase during which I would speak with the relevant stakeholders and review existing materials, followed by an initial analysis and a collaborative session to pressure-test the findings.",
      "Please do not hesitate to reach out with any questions. I look forward to hearing your thoughts.",
      "Best regards,",
    ],
  },
  {
    keywords: ['statement', 'personal statement', 'university', 'college', 'graduate', 'school', 'academic', 'study', 'research'],
    paragraphs: [
      "My interest in this field did not arrive in a single moment of clarity. It built slowly, through a series of questions that kept returning — questions about why systems designed to help people so often made their lives harder instead.",
      "During my undergraduate studies I had the opportunity to work on a small applied project that brought those questions into sharp focus. The problem was deceptively simple on the surface, but the more carefully I looked the more it connected to broader issues the existing literature had treated as separate.",
      "I am applying to this programme because of the quality of the faculty and the genuine commitment to rigorous, independent thinking that comes through clearly in the published work.",
      "I am a careful and organised researcher, accustomed to managing long projects without close supervision. I take feedback seriously and revise willingly. I would be honoured to bring that disposition to your community.",
    ],
  },
];

const FALLBACK_DEFAULT = [
  "This is a demonstration document generated as a fallback while the AI service is temporarily unavailable.",
  "The content you requested would normally be produced by a language model responding to your specific prompt. In its absence, this placeholder illustrates how the document editor formats and displays text.",
  "Each paragraph is separated cleanly, the typography is set for readability, and the editing tools are fully functional. You can select any section and ask for a revision once the service is restored.",
];

function getFallbackHtml(userPrompt: string): string {
  const lower = userPrompt.toLowerCase();
  let best: { keywords: string[]; paragraphs: string[] } | null = null;
  let bestScore = 0;
  for (const entry of FALLBACK_ENTRIES) {
    const s = entry.keywords.reduce((n, kw) => (lower.includes(kw) ? n + 1 : n), 0);
    if (s > bestScore) { bestScore = s; best = entry; }
  }
  return (best ? best.paragraphs : FALLBACK_DEFAULT).map((p) => `<p>${p}</p>`).join('\n');
}
// ---------------------------------------------------------------------------

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
