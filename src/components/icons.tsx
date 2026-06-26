// Minimal inline stroke icons (currentColor). No external icon dependency.
type P = { size?: number; className?: string; strokeWidth?: number };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const CalendarIcon = ({ size = 24, className, strokeWidth = 1.8 }: P) => (
  <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
    <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
    <path d="M3 9h18M8 2.5v4M16 2.5v4" />
  </svg>
);

export const GearIcon = ({ size = 24, className, strokeWidth = 1.8 }: P) => (
  <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

export const PencilIcon = ({ size = 24, className, strokeWidth = 1.8 }: P) => (
  <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

export const BackIcon = ({ size = 24, className, strokeWidth = 1.8 }: P) => (
  <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

export const CloseIcon = ({ size = 24, className, strokeWidth = 1.8 }: P) => (
  <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const ChevronLeft = ({ size = 24, className, strokeWidth = 1.8 }: P) => (
  <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

export const ChevronRight = ({ size = 24, className, strokeWidth = 1.8 }: P) => (
  <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
    <path d="M9 18l6-6-6-6" />
  </svg>
);

export const ImagePlusIcon = ({ size = 24, className, strokeWidth = 1.8 }: P) => (
  <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
    <path d="M21 12.5V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h9" />
    <path d="m3 16 4-4a2 2 0 0 1 2.5-.2L14 14" />
    <circle cx="8.5" cy="9" r="1.2" />
    <path d="M18 15v6M15 18h6" />
  </svg>
);

export const TimelineIcon = ({ size = 24, className, strokeWidth = 1.8 }: P) => (
  <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
    <path d="M3 5.5A1.5 1.5 0 0 1 4.5 4H11v15.5H4.5A1.5 1.5 0 0 1 3 18Z" />
    <path d="M21 5.5A1.5 1.5 0 0 0 19.5 4H13v15.5h6.5a1.5 1.5 0 0 0 1.5-1.5Z" />
  </svg>
);

export const DownloadIcon = ({ size = 24, className, strokeWidth = 1.8 }: P) => (
  <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
    <path d="M12 3v12M7 11l5 4 5-4" />
    <path d="M4 19h16" />
  </svg>
);

export const UploadIcon = ({ size = 24, className, strokeWidth = 1.8 }: P) => (
  <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
    <path d="M12 15V3M7 7l5-4 5 4" />
    <path d="M4 19h16" />
  </svg>
);

export const HistoryIcon = ({ size = 24, className, strokeWidth = 1.8 }: P) => (
  <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 4v4h4" />
    <path d="M12 8v4l3 2" />
  </svg>
);

export const PaletteIcon = ({ size = 24, className, strokeWidth = 1.8 }: P) => (
  <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
    <path d="M12 3a9 9 0 1 0 0 18c.83 0 1.5-.67 1.5-1.5 0-.4-.15-.74-.4-1-.25-.27-.4-.6-.4-1 0-.83.67-1.5 1.5-1.5H16a5 5 0 0 0 5-5c0-4.42-4.03-8-9-8Z" />
    <circle cx="7.5" cy="10.5" r="1" />
    <circle cx="12" cy="7.5" r="1" />
    <circle cx="16.5" cy="10.5" r="1" />
  </svg>
);

export const InfoIcon = ({ size = 24, className, strokeWidth = 1.8 }: P) => (
  <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 7.5h.01" />
  </svg>
);

export const PlusIcon = ({ size = 24, className, strokeWidth = 1.8 }: P) => (
  <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
