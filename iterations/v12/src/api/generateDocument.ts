export async function generateDocument(userPrompt: string): Promise<string> {
  const res = await fetch('/api/document', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userPrompt }),
  });

  const data = (await res.json()) as { html?: string; error?: string };

  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }

  if (!data.html?.trim()) {
    throw new Error(data.error || 'Empty document response');
  }

  return data.html.trim();
}
