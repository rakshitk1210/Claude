interface StreamChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface StreamChatOptions {
  signal?: AbortSignal;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}

export async function streamChat(
  messages: StreamChatMessage[],
  { signal, onDelta, onDone, onError }: StreamChatOptions
) {
  let res: Response;
  try {
    res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
      signal,
    });
  } catch (err) {
    if (signal?.aborted) return;
    onError(err instanceof Error ? err.message : 'Network error');
    return;
  }

  if (!res.ok) {
    try {
      const body = await res.json();
      onError(body.error || `HTTP ${res.status}`);
    } catch {
      onError(`HTTP ${res.status}`);
    }
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) {
    onError('No response stream');
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const payload = line.slice(6).trim();
        if (payload === '[DONE]') {
          onDone();
          return;
        }
        try {
          const parsed = JSON.parse(payload);
          if (parsed.error) {
            onError(parsed.error);
            return;
          }
          if (parsed.text) {
            onDelta(parsed.text);
          }
        } catch {
          // skip malformed SSE lines
        }
      }
    }
    onDone();
  } catch (err) {
    if (signal?.aborted) return;
    onError(err instanceof Error ? err.message : 'Stream read error');
  }
}
