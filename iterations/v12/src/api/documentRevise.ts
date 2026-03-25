export async function documentRevise(
  currentHtml: string,
  instruction: string
): Promise<string> {
  const res = await fetch('/api/document-revise', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentHtml, instruction }),
  });

  const data = (await res.json()) as { html?: string; error?: string };

  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }

  if (!data.html?.trim()) {
    throw new Error(data.error || 'Empty response');
  }

  return data.html.trim();
}
