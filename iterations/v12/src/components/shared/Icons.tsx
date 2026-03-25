import React from 'react';

type P = React.SVGProps<SVGSVGElement> & { size?: number };

const defaults = (size: number): Partial<React.SVGProps<SVGSVGElement>> => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const ChevronDown = ({ size = 16, ...p }: P) => (
  <svg {...defaults(size)} {...p}><path d="m6 9 6 6 6-6" /></svg>
);
export const ChevronLeft = ({ size = 16, ...p }: P) => (
  <svg {...defaults(size)} {...p}><path d="m15 18-6-6 6-6" /></svg>
);
export const ChevronRight = ({ size = 16, ...p }: P) => (
  <svg {...defaults(size)} {...p}><path d="m9 18 6-6-6-6" /></svg>
);
export const ArrowUp = ({ size = 15, ...p }: P) => (
  <svg {...defaults(size)} strokeWidth={2.2} {...p}>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);
export const StopIcon = ({ size = 14, ...p }: P) => (
  <svg {...defaults(size)} fill="currentColor" stroke="none" {...p}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
  </svg>
);
export const PlusIcon = ({ size = 14, ...p }: P) => (
  <svg
    {...defaults(size)}
    strokeWidth={size >= 20 ? 2 : 1.8}
    {...p}
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const MinusIcon = ({ size = 14, ...p }: P) => (
  <svg {...defaults(size)} strokeWidth={2} {...p}><path d="M5 12h14" /></svg>
);
export const VoiceIcon = ({ size = 22, ...p }: P) => (
  <svg {...defaults(size)} strokeWidth={1.2} {...p}>
    <path d="M2 10v3" /><path d="M6 6v11" /><path d="M10 3v18" />
    <path d="M14 8v7" /><path d="M18 5v13" /><path d="M22 10v3" />
  </svg>
);
export const LayoutIcon = ({ size = 20, ...p }: P) => (
  <svg {...defaults(size)} strokeWidth={1.2} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18" />
  </svg>
);
export const SearchIcon = ({ size = 20, ...p }: P) => (
  <svg {...defaults(size)} strokeWidth={1.2} {...p}>
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
  </svg>
);
export const FolderIcon = ({ size = 20, ...p }: P) => (
  <svg {...defaults(size)} strokeWidth={1.2} {...p}>
    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    <path d="M2 10h20" />
  </svg>
);
export const ChatIcon = ({ size = 20, ...p }: P) => (
  <svg {...defaults(size)} strokeWidth={1.2} {...p}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
export const CursorIcon = ({ size = 20, ...p }: P) => (
  <svg {...defaults(size)} {...p}>
    <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" /><path d="M13 13l6 6" />
  </svg>
);
export const MarqueeIcon = ({ size = 20, ...p }: P) => (
  <svg {...defaults(size)} {...p}>
    <path d="M5 3h2M11 3h2M17 3h2M3 5v2M21 5v2M3 11v2M21 11v2M3 17v2M21 17v2M5 21h2M11 21h2M17 21h2" />
  </svg>
);
export const HandIcon = ({ size = 20, ...p }: P) => (
  <svg {...defaults(size)} {...p}>
    <path d="M18 11V6a2 2 0 0 0-4 0v5" /><path d="M14 10V4a2 2 0 0 0-4 0v6" />
    <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
  </svg>
);
export const NoteIcon = ({ size = 20, ...p }: P) => (
  <svg {...defaults(size)} {...p}>
    <path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3z" />
    <path d="M14 3v4a2 2 0 0 0 2 2h4" />
  </svg>
);
export const AttachIcon = ({ size = 20, ...p }: P) => (
  <svg {...defaults(size)} {...p}>
    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);
export const DocIcon = ({ size = 24, ...p }: P) => (
  <svg {...defaults(size)} strokeWidth={1.2} {...p}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
export const FileDocIcon = ({ size = 20, ...p }: P) => (
  <svg {...defaults(size)} strokeWidth={1.2} {...p}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <path d="M14 2v6h6" /><path d="M16 13H8M16 17H8M10 9H8" />
  </svg>
);
export const CopyIcon = ({ size = 18, ...p }: P) => (
  <svg {...defaults(size)} strokeWidth={1.3} {...p}>
    <rect width="14" height="14" x="8" y="8" rx="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);
export const RefreshIcon = ({ size = 18, ...p }: P) => (
  <svg {...defaults(size)} strokeWidth={1.3} {...p}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" />
  </svg>
);
export const TrashIcon = ({ size = 18, ...p }: P) => (
  <svg {...defaults(size)} strokeWidth={1.3} {...p}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);
export const UndoIcon = ({ size = 20, ...p }: P) => (
  <svg {...defaults(size)} strokeWidth={1.3} {...p}>
    <polyline points="9 17 4 12 9 7" /><path d="M20 18v-2a4 4 0 0 0-4-4H4" />
  </svg>
);
export const EditIcon = ({ size = 14, ...p }: P) => (
  <svg {...defaults(size)} strokeWidth={1.2} {...p}>
    <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);
export const ReplyIcon = ({ size = 14, ...p }: P) => (
  <svg {...defaults(size)} strokeWidth={1.2} {...p}>
    <polyline points="9 17 4 12 9 7" /><path d="M20 18v-2a4 4 0 0 0-4-4H4" />
  </svg>
);
export const HelpIcon = ({ size = 16, ...p }: P) => (
  <svg {...defaults(size)} {...p}>
    <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" />
  </svg>
);
export const XIcon = ({ size = 20, ...p }: P) => (
  <svg {...defaults(size)} {...p}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
);
export const LinkIcon = ({ size = 20, ...p }: P) => (
  <svg {...defaults(size)} strokeWidth={1.2} {...p}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

export const ClaudeLogo = ({ size = 44 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="currentColor">
    <path d="m19.6 66.5 19.7-11 .3-1-.3-.5h-1l-3.3-.2-11.2-.3L14 53l-9.5-.5-2.4-.5L0 49l.2-1.5 2-1.3 2.9.2 6.3.5 9.5.6 6.9.4L38 49.1h1.6l.2-.7-.5-.4-.4-.4L29 41l-10.6-7-5.6-4.1-3-2-1.5-2-.6-4.2 2.7-3 3.7.3.9.2 3.7 2.9 8 6.1L37 36l1.5 1.2.6-.4.1-.3-.7-1.1L33 25l-6-10.4-2.7-4.3-.7-2.6c-.3-1-.4-2-.4-3l3-4.2L28 0l4.2.6L33.8 2l2.6 6 4.1 9.3L47 29.9l2 3.8 1 3.4.3 1h.7v-.5l.5-7.2 1-8.7 1-11.2.3-3.2 1.6-3.8 3-2L61 2.6l2 2.9-.3 1.8-1.1 7.7L59 27.1l-1.5 8.2h.9l1-1.1 4.1-5.4 6.9-8.6 3-3.5L77 13l2.3-1.8h4.3l3.1 4.7-1.4 4.9-4.4 5.6-3.7 4.7-5.3 7.1-3.2 5.7.3.4h.7l12-2.6 6.4-1.1 7.6-1.3 3.5 1.6.4 1.6-1.4 3.4-8.2 2-9.6 2-14.3 3.3-.2.1.2.3 6.4.6 2.8.2h6.8l12.6 1 3.3 2 1.9 2.7-.3 2-5.1 2.6-6.8-1.6-16-3.8-5.4-1.3h-.8v.4l4.6 4.5 8.3 7.5L89 80.1l.5 2.4-1.3 2-1.4-.2-9.2-7-3.6-3-8-6.8h-.5v.7l1.8 2.7 9.8 14.7.5 4.5-.7 1.4-2.6 1-2.7-.6-5.8-8-6-9-4.7-8.2-.5.4-2.9 30.2-1.3 1.5-3 1.2-2.5-2-1.4-3 1.4-6.2 1.6-8 1.3-6.4 1.2-7.9.7-2.6v-.2H49L43 72l-9 12.3-7.2 7.6-1.7.7-3-1.5.3-2.8L24 86l10-12.8 6-7.9 4-4.6-.1-.5h-.3L17.2 77.4l-4.7.6-2-2 .2-3 1-1 8-5.5Z" />
  </svg>
);
