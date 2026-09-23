function base(size, className) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
  };
}

export function UserIcon({ size = 20, className }) {
  return (
    <svg {...base(size, className)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
    </svg>
  );
}

export function BagIcon({ size = 20, className }) {
  return (
    <svg {...base(size, className)}>
      <path d="M6 8h12l-1 12H7L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

export function SparkleIcon({ size = 22, className }) {
  return (
    <svg {...base(size, className)}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.5 5.5l2.5 2.5M16 16l2.5 2.5M18.5 5.5 16 8M8 16l-2.5 2.5" />
    </svg>
  );
}

export function TruckIcon({ size = 22, className }) {
  return (
    <svg {...base(size, className)}>
      <rect x="1.5" y="7" width="12" height="9" rx="1" />
      <path d="M13.5 10h4l3 3v3h-7z" />
      <circle cx="6" cy="18.5" r="1.6" />
      <circle cx="17" cy="18.5" r="1.6" />
    </svg>
  );
}

export function LockIcon({ size = 22, className }) {
  return (
    <svg {...base(size, className)}>
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function ChatIcon({ size = 22, className }) {
  return (
    <svg {...base(size, className)}>
      <path d="M4 5h16v11H9l-4 4V5Z" />
    </svg>
  );
}

export function HeartIcon({ size = 22, className, filled = false }) {
  return (
    <svg {...base(size, className)} fill={filled ? "currentColor" : "none"}>
      <path d="M12 20s-7-4.4-9.5-8.6C.7 8 2 4.5 5.4 4c2-.3 3.7.7 4.6 2.2C10.9 4.7 12.6 3.7 14.6 4 18 4.5 19.3 8 17.5 11.4 15 15.6 12 20 12 20Z" />
    </svg>
  );
}

export function StarIcon({ size = 16, className, filled = true }) {
  return (
    <svg {...base(size, className)} fill={filled ? "currentColor" : "none"}>
      <path d="M12 3.5l2.4 5 5.5.6-4 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4-4-3.8 5.5-.6L12 3.5Z" />
    </svg>
  );
}

export function RocketIcon({ size = 22, className }) {
  return (
    <svg {...base(size, className)}>
      <path d="M12 2c3 2 5 6 4.5 11-1.5.5-3 .5-4.5 0s-3-.5-4.5 0C7 8 9 4 12 2Z" />
      <circle cx="12" cy="10" r="1.6" />
      <path d="M9 16.5 7 21l3-1.5M15 16.5 17 21l-3-1.5" />
    </svg>
  );
}

export function ShieldIcon({ size = 22, className }) {
  return (
    <svg {...base(size, className)}>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function MailIcon({ size = 22, className }) {
  return (
    <svg {...base(size, className)}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 6 8 6 8-6" />
    </svg>
  );
}

export function PinIcon({ size = 18, className }) {
  return (
    <svg {...base(size, className)}>
      <path d="M12 21s-6.5-5.6-6.5-11A6.5 6.5 0 0 1 18.5 10c0 5.4-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.3" />
    </svg>
  );
}

export function PhoneIcon({ size = 18, className }) {
  return (
    <svg {...base(size, className)}>
      <path d="M5 4h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3c0 1-1 1.7-2 1.5C9.5 18.7 5.3 14.5 4 8c-.2-1 .5-2 1-2Z" />
    </svg>
  );
}

export function CameraIcon({ size = 18, className }) {
  return (
    <svg {...base(size, className)}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <circle cx="12" cy="13.5" r="3.5" />
      <path d="M9 7l1.2-2h3.6L15 7" />
    </svg>
  );
}

export function MusicIcon({ size = 18, className }) {
  return (
    <svg {...base(size, className)}>
      <path d="M9 18V5l10-2v13" />
      <circle cx="6.5" cy="18" r="2.5" />
      <circle cx="16.5" cy="16" r="2.5" />
    </svg>
  );
}

export function GhostIcon({ size = 18, className }) {
  return (
    <svg {...base(size, className)}>
      <path d="M5 20V11a7 7 0 0 1 14 0v9l-2.5-2-2 2-2.5-2-2 2-2.5-2L5 20Z" />
      <circle cx="9.5" cy="11" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="11" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FlowerIcon({ size = 26, className }) {
  return (
    <svg {...base(size, className)}>
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="6" r="2.5" />
      <circle cx="12" cy="18" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="12" r="2.5" />
    </svg>
  );
}

export function TreeIcon({ size = 26, className }) {
  return (
    <svg {...base(size, className)}>
      <path d="M12 3 7 10h3l-4 6h5v4M12 3l5 7h-3l4 6h-5" />
    </svg>
  );
}

export function SunsetIcon({ size = 26, className }) {
  return (
    <svg {...base(size, className)}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M4.2 6.2l2 2M2 14h3M19 14h3M17.8 6.2l-2 2M6 19h12" />
    </svg>
  );
}

export function CitrusIcon({ size = 26, className }) {
  return (
    <svg {...base(size, className)}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4c2 2 3 5 3 8s-1 6-3 8M12 4c-2 2-3 5-3 8s1 6 3 8M4 12h16" />
    </svg>
  );
}

export function DropletIcon({ size = 26, className }) {
  return (
    <svg {...base(size, className)}>
      <path d="M12 3c3.5 4.5 6 8 6 11.5A6 6 0 0 1 6 14.5C6 11 8.5 7.5 12 3Z" />
    </svg>
  );
}

export function SpaIcon({ size = 26, className }) {
  return (
    <svg {...base(size, className)}>
      <path d="M12 21c-4-2-7-5-7-9a7 7 0 0 1 14 0c0 4-3 7-7 9Z" />
      <path d="M12 12V7" />
    </svg>
  );
}

export function GemIcon({ size = 26, className }) {
  return (
    <svg {...base(size, className)}>
      <path d="M6 8h12l-6 12L6 8Z" />
      <path d="M3 8l3-5h12l3 5M3 8h18" />
    </svg>
  );
}

// Logo WhatsApp (glyphe plein).
export function WhatsAppIcon({ size = 22, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35Z" />
      <path d="M12.04 2C6.57 2 2.12 6.45 2.12 11.92c0 1.75.46 3.46 1.33 4.96L2.04 22l5.24-1.37a9.9 9.9 0 0 0 4.75 1.21h.01c5.47 0 9.92-4.45 9.92-9.92 0-2.65-1.03-5.14-2.9-7.01A9.86 9.86 0 0 0 12.04 2Zm0 18.16h-.01a8.23 8.23 0 0 1-4.2-1.15l-.3-.18-3.11.82.83-3.03-.2-.31a8.2 8.2 0 0 1-1.26-4.39c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Z" />
    </svg>
  );
}
