export type ScreenMode = 'home' | 'ask' | 'iterate';

export type CanvasTool = 'select' | 'marquee' | 'hand';

export interface Version {
  html: string;
  label: string;
  revisions: string[];
  currentRevision: number;
}

export interface CanvasCardData {
  id: string;
  type: 'note' | 'file' | 'link' | 'context';
  x: number;
  y: number;
  data: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai' | 'doc-card';
  content: string;
  deleted?: boolean;
  versionIdx?: number;
  label?: string;
}

export interface IterSidebarPanel {
  id: string;
  prompt: string;
  verIdx: number;
  x: number;
  needsStream?: boolean;
}
