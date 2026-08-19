const P = {
  width: 15,
  height: 15,
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconoCheck() {
  return (
    <svg {...P}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function IconoQr() {
  return (
    <svg {...P}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h3v3h-3zM19 14h2v2h-2zM14 19h2v2h-2zM19 19h2v2h-2z" />
    </svg>
  );
}

export function IconoLapiz() {
  return (
    <svg {...P}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

export function IconoX() {
  return (
    <svg {...P}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function IconoMas({ className }: { className?: string }) {
  return (
    <svg {...P} width="16" height="16" className={className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconoHistorial({ className }: { className?: string }) {
  return (
    <svg {...P} width="14" height="14" className={className}>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 5v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}

export function IconoLogout() {
  return (
    <svg {...P} width="14" height="14">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}
