export async function inlineEdit(
  selectedText: string,
  instruction: string,
  surroundingContext?: string
): Promise<string> {
  const res = await fetch('/api/inline-edit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ selectedText, instruction, surroundingContext }),
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
