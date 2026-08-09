const PROPS = {
  width: 26,
  height: 26,
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconoComercial() {
  return (
    <svg {...PROPS}>
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="17" cy="20" r="1.4" />
      <path d="M2.5 3h2l2.4 12.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L20.5 7H6" />
    </svg>
  );
}

export function IconoAlmacen() {
  return (
    <svg {...PROPS}>
      <path d="M3 17V9l5-2 5 2v8" />
      <rect x="3" y="17" width="10" height="2.5" rx="0.5" />
      <circle cx="6" cy="20.5" r="1.2" />
      <circle cx="11" cy="20.5" r="1.2" />
      <path d="M13 13h4l3 3v3.5a1 1 0 0 1-1 1h-1" />
      <circle cx="17.5" cy="20.5" r="1.2" />
    </svg>
  );
}

export function IconoVigilancia() {
  return (
    <svg {...PROPS}>
      <path d="M3 9.5 12 6l9 3.5" />
      <rect x="7" y="9.5" width="10" height="7" rx="1.2" />
      <circle cx="12" cy="13" r="2" />
      <path d="M9 20h6M12 16v4" />
    </svg>
  );
}

export function IconoAdministracion() {
  return (
    <svg {...PROPS}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13.5a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V19.5a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.04-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.04H4.5a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1.04 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H10.5a1.7 1.7 0 0 0 1.04-1.56V4.5a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.04 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V10.5a1.7 1.7 0 0 0 1.56 1.04h.09a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.56 1.04Z" />
    </svg>
  );
}

export function IconoPantallaPublica() {
  return (
    <svg {...PROPS}>
      <rect x="3" y="4.5" width="18" height="12" rx="1.5" />
      <path d="M8 20h8M12 16.5V20" />
    </svg>
  );
}
