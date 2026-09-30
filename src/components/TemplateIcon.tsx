export function TemplateIcon({ id, accent }: { id: string; accent: string }) {
  const common = { width: 28, height: 36, className: "rounded-sm border border-[#E4E0D8] bg-white shrink-0" };
  switch (id) {
    case "modern":
      return (
        <svg {...common} viewBox="0 0 28 36">
          <rect x="0" y="0" width="10" height="36" fill="#1B2430" />
          <rect x="13" y="4" width="12" height="2" fill={accent} />
          <rect x="13" y="9" width="12" height="1.5" fill="#D9D5CC" />
          <rect x="13" y="12" width="8" height="1.5" fill="#D9D5CC" />
        </svg>
      );
    case "classic":
      return (
        <svg {...common} viewBox="0 0 28 36">
          <rect x="4" y="3" width="20" height="2" fill="#1B2430" />
          <rect x="6" y="9" width="16" height="1" fill={accent} />
          <rect x="4" y="13" width="20" height="1" fill="#D9D5CC" />
          <rect x="4" y="16" width="20" height="1" fill="#D9D5CC" />
        </svg>
      );
    case "minimal":
      return (
        <svg {...common} viewBox="0 0 28 36">
          <rect x="4" y="5" width="14" height="2" fill="#1B2430" />
          <rect x="4" y="9" width="10" height="1" fill={accent} />
          <rect x="4" y="16" width="20" height="1" fill="#D9D5CC" />
        </svg>
      );
    case "timeline":
      return (
        <svg {...common} viewBox="0 0 28 36">
          <circle cx="6" cy="10" r="4" fill={accent} opacity="0.3" />
          <rect x="8" y="16" width="1.5" height="16" fill="#D9D5CC" />
          <circle cx="8.75" cy="18" r="1.5" fill={accent} />
          <rect x="13" y="17" width="12" height="1.5" fill="#1B2430" />
          <circle cx="8.75" cy="25" r="1.5" fill={accent} />
          <rect x="13" y="24" width="10" height="1.5" fill="#D9D5CC" />
        </svg>
      );
    case "compact":
      return (
        <svg {...common} viewBox="0 0 28 36">
          <rect x="4" y="4" width="20" height="2" fill="#000" />
          <rect x="4" y="9" width="20" height="0.8" fill="#000" />
          <rect x="4" y="12" width="16" height="0.8" fill="#666" />
          <rect x="4" y="15" width="18" height="0.8" fill="#666" />
        </svg>
      );
    case "bold":
      return (
        <svg {...common} viewBox="0 0 28 36">
          <rect x="0" y="0" width="28" height="10" fill={accent} />
          <circle cx="6" cy="5" r="3" fill="#fff" opacity="0.6" />
          <rect x="4" y="15" width="20" height="1.5" fill="#1B2430" />
          <rect x="4" y="19" width="14" height="1" fill="#D9D5CC" />
        </svg>
      );
    case "corporate":
      return (
        <svg {...common} viewBox="0 0 28 36">
          <rect x="4" y="3" width="16" height="2" fill="#1B2430" />
          <rect x="22" y="3" width="3" height="3" fill={accent} opacity="0.4" />
          <rect x="0" y="8" width="28" height="1" fill={accent} />
          <rect x="4" y="12" width="12" height="1" fill="#D9D5CC" />
          <rect x="18" y="12" width="7" height="1" fill="#D9D5CC" />
        </svg>
      );
    case "creative":
      return (
        <svg {...common} viewBox="0 0 28 36">
          <circle cx="6" cy="6" r="4" fill={accent} opacity="0.5" />
          <rect x="12" y="5" width="12" height="2" fill={accent} />
          <rect x="4" y="14" width="20" height="5" rx="1.5" fill={accent} opacity="0.12" />
          <rect x="6" y="16" width="12" height="1" fill="#1B2430" />
        </svg>
      );
    case "dark":
      return (
        <svg {...common} viewBox="0 0 28 36">
          <rect x="0" y="0" width="28" height="36" fill="#1B2430" />
          <circle cx="6" cy="7" r="3" fill={accent} opacity="0.6" />
          <rect x="11" y="6" width="13" height="2" fill="#fff" />
          <rect x="4" y="15" width="20" height="1" fill={accent} opacity="0.7" />
        </svg>
      );
    default:
      return (
        <svg {...common} viewBox="0 0 28 36">
          <rect x="4" y="4" width="20" height="28" fill="#F1EFEA" />
        </svg>
      );
  }
}
