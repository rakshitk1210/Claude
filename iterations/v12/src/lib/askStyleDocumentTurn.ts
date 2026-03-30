import type { ChatMessage } from '../store/types';

export type StreamChatPayloadMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export function htmlToPlainDocText(html: string): string {
  if (typeof document === 'undefined') return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent?.trim() ?? '';
}

export function buildStreamChatPayload(
  homePrompt: string,
  currentHtml: string,
  allMessages: ChatMessage[]
): StreamChatPayloadMessage[] {
  const docText = htmlToPlainDocText(currentHtml);
  const seedContent = homePrompt.trim() || 'Document request';
  const contextualSeed = docText
    ? `${seedContent}\n\nCurrent document:\n${docText}`
    : seedContent;
  const apiMessages = allMessages
    .filter((m) => !m.deleted && (m.role === 'user' || m.role === 'ai') && m.content)
    .map((m) => ({
      role: (m.role === 'ai' ? 'assistant' : 'user') as 'user' | 'assistant',
      content: m.content,
    }));
  return [{ role: 'user', content: contextualSeed }, ...apiMessages];
}

export function buildRevisionInstruction(
  homePrompt: string,
  userText: string
): string {
  const h = homePrompt.trim();
  return h
    ? `Original document request: ${h}\n\nChange request: ${userText}`
    : userText;
}
