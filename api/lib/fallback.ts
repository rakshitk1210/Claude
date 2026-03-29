/**
 * Fallback document content served when the AI API is unavailable.
 * getFallbackHtml() picks the best-matching entry by keyword overlap with the
 * user's prompt, then returns a slice of its paragraphs as ready-to-render HTML.
 */

interface FallbackEntry {
  keywords: string[];
  paragraphs: string[];
}

const ENTRIES: FallbackEntry[] = [
  {
    keywords: ['cover letter', 'job', 'apply', 'position', 'role', 'hire', 'application', 'resume', 'cv', 'opportunity', 'company', 'employer'],
    paragraphs: [
      "I am writing to express my sincere interest in joining your team. Over the past several years I have developed a strong foundation in product thinking, cross-functional collaboration, and delivering work that balances user needs with business goals.",
      "In my most recent role I led the end-to-end redesign of a core user-facing workflow, reducing task completion time by 34% and improving satisfaction scores across three consecutive quarters. I worked closely with engineering, data, and customer success to ensure the changes were grounded in real evidence rather than assumption.",
      "What draws me to your organisation specifically is the clarity of your product vision and the obvious care you put into the details. I have long admired how consistently your team ships work that feels considered and complete. I would be proud to contribute to that standard.",
      "I bring a working style that is direct, curious, and accountable. I ask hard questions early, communicate openly when priorities conflict, and follow through on commitments. I am at my best in environments where people care deeply about the craft and are willing to debate ideas in good faith.",
      "I would welcome the chance to talk in more detail about how my background maps to what you are looking for. Thank you sincerely for your time and consideration.",
      "Warm regards,",
    ],
  },
  {
    keywords: ['essay', 'write', 'short', 'paragraph', 'about', 'topic', 'explain', 'describe', 'overview', 'summary'],
    paragraphs: [
      "Every significant idea begins as a small, quiet observation — a moment where something that seemed obvious suddenly requires a closer look. The history of progress is really a history of people who were willing to sit with that discomfort long enough to find out what it meant.",
      "What makes an idea worth holding onto is not novelty alone, but the way it reorders what you already knew. A good insight does not introduce entirely foreign material; it reveals a pattern that was always present, hidden in plain sight beneath familiar surfaces.",
      "There is a certain discipline required to develop thinking past its first expression. Most ideas arrive half-formed, more feeling than argument. The work is in the refinement — in finding the language that matches the thing itself, not just the impression of it.",
      "Writing is often how that refinement happens. To put words on a page is to commit to a position, however provisional, and commitment surfaces the gaps. You do not truly know what you think until you have tried to say it plainly, and found the places where plainness fails you.",
      "The best essays do not arrive at conclusions so much as they arrive at better questions. They leave the reader with a sharper sense of the problem — and occasionally, if the thinking has gone deep enough, a glimpse of where the next question might lead.",
    ],
  },
  {
    keywords: ['bio', 'about me', 'profile', 'introduction', 'who i am', 'personal', 'background', 'story', 'myself'],
    paragraphs: [
      "I am a designer and builder with a long-standing interest in the space where technology meets human behaviour. My work has spanned product design, strategy, and early-stage development — always with a focus on making complex things feel simple and honest.",
      "I grew up curious about how systems work: not just the mechanics, but the decisions embedded in them. That curiosity led me to study the intersection of people and tools, and eventually to a career spent trying to make that intersection a little less frustrating for everyone involved.",
      "Outside of work I read broadly, spend time outdoors, and pursue the ongoing, mostly futile project of learning to cook without a recipe. I believe that the habits you build in your personal life shape how you approach your professional one — slowly, quietly, but unmistakably.",
      "I care about directness, about doing what you said you would do, and about the kind of craft that shows up in the parts people do not notice. I am drawn to teams that hold themselves to a high standard not because someone is watching, but because they cannot quite help it.",
    ],
  },
  {
    keywords: ['creative', 'story', 'fiction', 'poem', 'scene', 'narrative', 'character', 'imagine', 'write a story', 'short story'],
    paragraphs: [
      "The last train left at eleven, and she was still on the platform at quarter past, watching the red tail-light shrink to a point and then disappear into the dark.",
      "She had missed it on purpose. She was not ready to go back to the apartment, to the particular silence it held now, to the way a room can carry an absence like a held note.",
      "The station attendant swept the same square of floor he had been sweeping since she arrived. He did not look up. There is a kindness in that, she thought — in people who understand that being witnessed is not always what you need.",
      "She sat down on the wooden bench and opened her bag for no reason, closed it again. Outside, the wind moved through the gap in the platform roof and made a sound like someone exhaling slowly. She found that she liked it.",
      "After a while the attendant set down his broom and disappeared into a back room. She was alone. The next train would not come for forty minutes. She decided she would stay for all of them.",
    ],
  },
  {
    keywords: ['letter', 'dear', 'formal', 'professional', 'request', 'proposal', 'memo', 'correspondence', 'official'],
    paragraphs: [
      "I am writing to follow up on our recent conversation and to set out my thinking in a more considered form. I hope this provides useful context as you weigh the next steps.",
      "The core of my proposal is straightforward: a focused engagement over eight weeks, with a defined scope, clear deliverables, and a single point of contact on each side. I have found this structure reduces friction significantly and tends to produce better work than arrangements with more ambiguity built in.",
      "In practical terms, the engagement would begin with a two-day discovery phase during which I would speak with the relevant stakeholders and review existing materials. I would then produce an initial analysis within five working days, followed by a collaborative session to pressure-test the findings before any recommendations are finalised.",
      "I have attached a one-page summary of similar work I have done in this space, along with two brief references who have agreed to speak if that would be helpful. I am happy to adjust the scope or timeline to better fit your situation.",
      "Please do not hesitate to reach out with any questions. I look forward to hearing your thoughts.",
      "Best regards,",
    ],
  },
  {
    keywords: ['statement', 'personal statement', 'university', 'college', 'graduate', 'school', 'academic', 'study', 'research', 'apply'],
    paragraphs: [
      "My interest in this field did not arrive in a single moment of clarity. It built slowly, through a series of questions that kept returning — questions about why systems that were designed to help people so often made their lives harder instead.",
      "During my undergraduate studies I had the opportunity to work on a small applied project that brought those questions into sharp focus. The problem was deceptively simple on the surface, but the more carefully I looked, the more I found it connected to broader structural issues that the existing literature had largely treated as separate.",
      "That experience convinced me that the most interesting work sits at the edges of established categories. I am drawn to problems that do not fit neatly into a single discipline — problems that require you to hold multiple frameworks at once and be willing to discard any of them when the evidence demands it.",
      "I am applying to this programme because of the quality of the faculty and the genuine commitment to rigorous, independent thinking that comes through clearly in the published work. I am particularly interested in contributing to the ongoing conversation around methodology that I see developing across several of the current research groups.",
      "I am a careful and organised researcher, accustomed to managing long projects without close supervision. I take feedback seriously and revise willingly. I would be honoured to bring that disposition to your community.",
    ],
  },
  {
    keywords: ['product', 'description', 'launch', 'feature', 'announce', 'introduce', 'new', 'release', 'update', 'app'],
    paragraphs: [
      "We built this because we kept running into the same problem: the tools that were supposed to help people think were actually getting in the way of thinking. They were optimised for output, not for understanding.",
      "The result is a product designed around a different premise. Rather than pushing you toward a finished result as quickly as possible, it creates space for the kind of iterative, exploratory work that good thinking actually requires.",
      "At its core it is simple: you write, you revise, you explore alternatives. But the details matter, and we have spent a long time on the details. The interface gets out of the way when you are working and surfaces exactly the information you need when you are deciding.",
      "We are releasing this first version to a small group of people who we trust to tell us honestly what is broken and what is missing. If that sounds like you, we would love to have you involved.",
    ],
  },
];

const DEFAULT_PARAGRAPHS: string[] = [
  "This is a demonstration document generated as a fallback while the AI service is temporarily unavailable.",
  "The content you requested would normally be produced by a language model responding to your specific prompt. In its absence, this placeholder illustrates how the document editor formats and displays text.",
  "Each paragraph is separated cleanly, the typography is set for readability, and the editing tools above are fully functional. You can select any section of this text and ask for a revision once the service is restored.",
  "We appreciate your patience. The AI service will be available again shortly.",
];

function score(entry: FallbackEntry, prompt: string): number {
  const lower = prompt.toLowerCase();
  return entry.keywords.reduce((n, kw) => (lower.includes(kw) ? n + 1 : n), 0);
}

function toParagraphHtml(paragraphs: string[], maxParagraphs = 6): string {
  return paragraphs
    .slice(0, maxParagraphs)
    .map((p) => `<p>${p}</p>`)
    .join('\n');
}

export function getFallbackHtml(userPrompt: string): string {
  let best: FallbackEntry | null = null;
  let bestScore = 0;

  for (const entry of ENTRIES) {
    const s = score(entry, userPrompt);
    if (s > bestScore) {
      bestScore = s;
      best = entry;
    }
  }

  const paragraphs = best ? best.paragraphs : DEFAULT_PARAGRAPHS;
  return toParagraphHtml(paragraphs);
}
