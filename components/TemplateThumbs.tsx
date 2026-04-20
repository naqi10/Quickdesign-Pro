// Shared SVG thumbnail components used by TemplateSelector (small) and TemplateGallery (large).
// Pass width/height to scale — viewBox stays fixed so SVG scales perfectly.

interface ThumbProps {
  active: boolean
  width?: number
  height?: number
}

export function ClassicThumb({ active, width = 48, height = 62 }: ThumbProps) {
  const accent = active ? '#3b82f6' : '#1a365d'
  return (
    <svg width={width} height={height} viewBox="0 0 48 62" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="62" rx="2" fill="white" />
      <rect x="8" y="6" width="32" height="4" rx="1" fill={accent} />
      <rect x="12" y="12" width="24" height="2" rx="1" fill="#94a3b8" />
      <rect x="4" y="17" width="40" height="0.5" fill="#e2e8f0" />
      <rect x="4" y="21" width="16" height="1.5" rx="0.5" fill={accent} />
      <rect x="4" y="25" width="40" height="1.5" rx="0.5" fill="#cbd5e1" />
      <rect x="4" y="28" width="36" height="1.5" rx="0.5" fill="#cbd5e1" />
      <rect x="4" y="33" width="16" height="1.5" rx="0.5" fill={accent} />
      <circle cx="6" cy="38.5" r="1" fill="#94a3b8" />
      <rect x="9" y="37.5" width="33" height="1.5" rx="0.5" fill="#cbd5e1" />
      <circle cx="6" cy="42.5" r="1" fill="#94a3b8" />
      <rect x="9" y="41.5" width="28" height="1.5" rx="0.5" fill="#cbd5e1" />
      <circle cx="6" cy="46.5" r="1" fill="#94a3b8" />
      <rect x="9" y="45.5" width="30" height="1.5" rx="0.5" fill="#cbd5e1" />
      <rect x="4" y="51" width="12" height="1.5" rx="0.5" fill={accent} />
      <rect x="4" y="55" width="38" height="1.5" rx="0.5" fill="#cbd5e1" />
    </svg>
  )
}

export function ModernThumb({ active, width = 48, height = 62 }: ThumbProps) {
  const sidebar = active ? '#1d4ed8' : '#1e3a5f'
  return (
    <svg width={width} height={height} viewBox="0 0 48 62" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="62" rx="2" fill="white" />
      <rect x="0" y="0" width="18" height="62" rx="2" fill={sidebar} />
      <rect x="16" y="0" width="2" height="62" fill={sidebar} />
      <rect x="2" y="6" width="13" height="2.5" rx="0.5" fill="white" />
      <rect x="2" y="10" width="10" height="1.5" rx="0.5" fill="#90cdf4" />
      <rect x="2" y="16" width="8" height="1" rx="0.5" fill="#90cdf4" />
      <rect x="2" y="19" width="13" height="1" rx="0.5" fill="#93c5fd" opacity="0.7" />
      <rect x="2" y="21.5" width="11" height="1" rx="0.5" fill="#93c5fd" opacity="0.7" />
      <rect x="2" y="24" width="12" height="1" rx="0.5" fill="#93c5fd" opacity="0.7" />
      <rect x="2" y="29" width="8" height="1" rx="0.5" fill="#90cdf4" />
      <rect x="2" y="32" width="13" height="1" rx="0.5" fill="white" opacity="0.7" />
      <rect x="2" y="34.5" width="10" height="1" rx="0.5" fill="#90cdf4" opacity="0.7" />
      <rect x="21" y="6" width="20" height="2" rx="0.5" fill={sidebar} />
      <rect x="21" y="9" width="24" height="0.5" fill="#bee3f8" />
      <rect x="21" y="12" width="24" height="1.5" rx="0.5" fill="#cbd5e1" />
      <rect x="21" y="15" width="20" height="1.5" rx="0.5" fill="#cbd5e1" />
      <rect x="21" y="20" width="20" height="2" rx="0.5" fill={sidebar} />
      <rect x="21" y="23" width="24" height="0.5" fill="#bee3f8" />
      <rect x="21" y="26" width="18" height="1.5" rx="0.5" fill="#94a3b8" />
      <rect x="21" y="29" width="24" height="1" rx="0.5" fill="#cbd5e1" />
      <rect x="21" y="31.5" width="22" height="1" rx="0.5" fill="#cbd5e1" />
      <rect x="21" y="34" width="20" height="1" rx="0.5" fill="#cbd5e1" />
    </svg>
  )
}

export function MinimalThumb({ active, width = 48, height = 62 }: ThumbProps) {
  const line = active ? '#3b82f6' : '#e0e0e0'
  return (
    <svg width={width} height={height} viewBox="0 0 48 62" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="62" rx="2" fill="white" />
      <rect x="4" y="5" width="28" height="3" rx="0.5" fill="#111111" opacity="0.7" />
      <rect x="4" y="10" width="20" height="1.5" rx="0.5" fill="#aaaaaa" />
      <rect x="4" y="13.5" width="36" height="1" rx="0.5" fill="#cccccc" />
      <rect x="4" y="17" width="40" height="0.5" fill={line} />
      <rect x="4" y="20" width="12" height="1" rx="0.5" fill="#aaaaaa" />
      <rect x="4" y="23" width="40" height="1" rx="0.5" fill="#cccccc" />
      <rect x="4" y="25.5" width="36" height="1" rx="0.5" fill="#cccccc" />
      <rect x="4" y="29" width="40" height="0.3" fill="#f0f0f0" />
      <rect x="4" y="32" width="14" height="1" rx="0.5" fill="#aaaaaa" />
      <rect x="4" y="35.5" width="22" height="1.5" rx="0.5" fill="#333333" opacity="0.8" />
      <rect x="4" y="38.5" width="40" height="1" rx="0.5" fill="#cccccc" />
      <rect x="4" y="41" width="36" height="1" rx="0.5" fill="#cccccc" />
      <rect x="4" y="43.5" width="38" height="1" rx="0.5" fill="#cccccc" />
      <rect x="4" y="47" width="40" height="0.3" fill="#f0f0f0" />
      <rect x="4" y="50" width="10" height="1" rx="0.5" fill="#aaaaaa" />
      <rect x="4" y="53" width="38" height="1" rx="0.5" fill="#cccccc" />
    </svg>
  )
}

export function AtsProThumb({ active, width = 48, height = 62 }: ThumbProps) {
  const line = active ? '#3b82f6' : '#111111'
  return (
    <svg width={width} height={height} viewBox="0 0 48 62" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="62" rx="2" fill="white" />
      <rect x="10" y="5" width="28" height="3.5" rx="0.5" fill="#111" opacity="0.85" />
      <rect x="14" y="10" width="20" height="2" rx="0.5" fill="#555" opacity="0.7" />
      <rect x="4" y="14" width="40" height="1.5" rx="0.5" fill="#999" />
      <rect x="4" y="17" width="40" height="0.8" fill={line} />
      <rect x="4" y="21" width="20" height="1.5" rx="0.5" fill="#111" opacity="0.8" />
      <rect x="4" y="24" width="40" height="0.5" fill="#111" opacity="0.5" />
      <rect x="4" y="27" width="22" height="1.5" rx="0.5" fill="#111" opacity="0.7" />
      <rect x="34" y="27" width="10" height="1.5" rx="0.5" fill="#888" />
      <rect x="4" y="30" width="18" height="1" rx="0.5" fill="#666" />
      <circle cx="6.5" cy="34" r="0.8" fill="#555" />
      <rect x="9" y="33.3" width="33" height="1.3" rx="0.4" fill="#ccc" />
      <circle cx="6.5" cy="37" r="0.8" fill="#555" />
      <rect x="9" y="36.3" width="28" height="1.3" rx="0.4" fill="#ccc" />
      <rect x="4" y="41" width="14" height="1.5" rx="0.5" fill="#111" opacity="0.8" />
      <rect x="4" y="44" width="40" height="0.5" fill="#111" opacity="0.5" />
      <rect x="4" y="47" width="26" height="1.3" rx="0.4" fill="#111" opacity="0.7" />
      <rect x="34" y="47" width="10" height="1.3" rx="0.4" fill="#888" />
      <rect x="4" y="51" width="38" height="1" rx="0.4" fill="#ccc" />
      <rect x="4" y="54" width="30" height="1" rx="0.4" fill="#ccc" />
    </svg>
  )
}

export function SidebarThumb({ active, width = 48, height = 62 }: ThumbProps) {
  const sidebar = active ? '#1d4ed8' : '#1a2744'
  const accent = '#e57c23'
  return (
    <svg width={width} height={height} viewBox="0 0 48 62" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="62" rx="2" fill="white" />
      <rect x="0" y="0" width="18" height="62" rx="2" fill={sidebar} />
      <rect x="16" y="0" width="2" height="62" fill={sidebar} />
      <rect x="2" y="6" width="13" height="2.5" rx="0.5" fill="white" />
      <rect x="2" y="10" width="13" height="1" rx="0.5" fill={accent} />
      <rect x="2" y="14" width="6" height="0.8" rx="0.3" fill={accent} opacity="0.8" />
      <rect x="2" y="16.5" width="13" height="1" rx="0.3" fill="#8fa3cc" />
      <rect x="2" y="18.5" width="11" height="1" rx="0.3" fill="#8fa3cc" />
      <rect x="2" y="23" width="5" height="0.8" rx="0.3" fill={accent} opacity="0.8" />
      <rect x="2" y="25.5" width="13" height="1.2" rx="0.5" fill="#243461" />
      <rect x="2" y="27.5" width="10" height="1.2" rx="0.5" fill="#243461" />
      <rect x="2" y="29.5" width="12" height="1.2" rx="0.5" fill="#243461" />
      <rect x="2" y="34" width="7" height="0.8" rx="0.3" fill={accent} opacity="0.8" />
      <rect x="2" y="36.5" width="13" height="1" rx="0.3" fill="white" opacity="0.6" />
      <rect x="2" y="39" width="8" height="1" rx="0.3" fill={accent} opacity="0.6" />
      <rect x="21" y="6" width="16" height="2" rx="0.5" fill={sidebar} />
      <rect x="21" y="9" width="24" height="0.5" fill={accent} />
      <rect x="21" y="12" width="24" height="1" rx="0.3" fill="#94a3b8" />
      <rect x="21" y="14" width="20" height="1" rx="0.3" fill="#94a3b8" />
      <rect x="21" y="19" width="18" height="2" rx="0.5" fill={sidebar} />
      <rect x="21" y="22" width="24" height="0.5" fill={accent} />
      <rect x="21" y="25" width="16" height="1.5" rx="0.3" fill="#1a1a2e" opacity="0.8" />
      <rect x="36" y="25" width="9" height="1.5" rx="3" fill={accent} />
      <rect x="21" y="28" width="12" height="1" rx="0.3" fill={accent} opacity="0.6" />
      <rect x="21" y="31" width="24" height="1" rx="0.3" fill="#94a3b8" />
      <rect x="21" y="33.5" width="21" height="1" rx="0.3" fill="#94a3b8" />
    </svg>
  )
}

export function TechCleanThumb({ active, width = 48, height = 62 }: ThumbProps) {
  const accent = active ? '#3b82f6' : '#0070f3'
  return (
    <svg width={width} height={height} viewBox="0 0 48 62" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="62" rx="2" fill="white" />
      <rect x="4" y="4" width="30" height="4" rx="0.5" fill="#0f172a" opacity="0.9" />
      <rect x="4" y="10" width="20" height="2" rx="0.5" fill={accent} opacity="0.9" />
      <rect x="4" y="14" width="40" height="0.5" fill="#e2e8f0" />
      <rect x="4" y="16" width="38" height="1.2" rx="0.3" fill="#94a3b8" />
      <rect x="4" y="18" width="40" height="0.5" fill="#e2e8f0" />
      <rect x="4" y="22" width="3" height="1.5" rx="0.3" fill={accent} />
      <rect x="9" y="22" width="14" height="1.5" rx="0.3" fill="#0f172a" opacity="0.8" />
      <rect x="26" y="23.2" width="18" height="0.5" fill="#e2e8f0" />
      <rect x="4" y="25" width="40" height="1" rx="0.3" fill="#94a3b8" />
      <rect x="4" y="27" width="36" height="1" rx="0.3" fill="#94a3b8" />
      <rect x="4" y="31" width="3" height="1.5" rx="0.3" fill={accent} />
      <rect x="9" y="31" width="18" height="1.5" rx="0.3" fill="#0f172a" opacity="0.8" />
      <rect x="30" y="32.2" width="14" height="0.5" fill="#e2e8f0" />
      <rect x="4" y="34.5" width="22" height="1.5" rx="0.3" fill="#0f172a" opacity="0.7" />
      <rect x="38" y="34.5" width="6" height="1.5" rx="0.3" fill="#94a3b8" />
      <rect x="4" y="37" width="14" height="1" rx="0.3" fill={accent} opacity="0.6" />
      <rect x="4" y="39.5" width="38" height="1" rx="0.3" fill="#cbd5e1" />
      <rect x="4" y="42" width="32" height="1" rx="0.3" fill="#cbd5e1" />
      <rect x="4" y="46" width="3" height="1.5" rx="0.3" fill={accent} />
      <rect x="9" y="46" width="10" height="1.5" rx="0.3" fill="#0f172a" opacity="0.8" />
      <rect x="22" y="47.2" width="22" height="0.5" fill="#e2e8f0" />
      <rect x="4" y="50" width="10" height="3" rx="1.5" fill="#f0f9ff" stroke="#bae6fd" strokeWidth="0.5" />
      <rect x="16" y="50" width="8" height="3" rx="1.5" fill="#f0f9ff" stroke="#bae6fd" strokeWidth="0.5" />
      <rect x="26" y="50" width="12" height="3" rx="1.5" fill="#f0f9ff" stroke="#bae6fd" strokeWidth="0.5" />
    </svg>
  )
}

// ── Week 4 templates ─────────────────────────────────────────────────────────

export function HarvardThumb({ active, width = 48, height = 62 }: ThumbProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 48 62" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="62" rx="2" fill="white" />
      {/* Centered name */}
      <rect x="9" y="5" width="30" height="3.5" rx="0.5" fill="#111" opacity="0.85" />
      {/* Centered job title italic */}
      <rect x="14" y="10" width="20" height="1.8" rx="0.5" fill="#666" opacity="0.7" />
      {/* Contact row */}
      <rect x="4" y="13.5" width="40" height="1.2" rx="0.5" fill="#aaa" />
      {/* Double rule */}
      <rect x="4" y="17" width="40" height="1" fill="#000" opacity="0.9" />
      <rect x="4" y="18.5" width="40" height="0.4" fill="#000" opacity="0.4" />
      {/* Section CAPS */}
      <rect x="4" y="22" width="14" height="1.2" rx="0.3" fill="#111" opacity="0.8" />
      <rect x="4" y="24.5" width="40" height="0.5" fill="#111" opacity="0.3" />
      {/* Role + company + date */}
      <rect x="4" y="27" width="24" height="1.5" rx="0.4" fill="#111" opacity="0.75" />
      <rect x="36" y="27" width="8" height="1.5" rx="0.4" fill="#888" />
      {/* Bullets */}
      <circle cx="6" cy="31.5" r="0.8" fill="#555" />
      <rect x="9" y="30.8" width="33" height="1.2" rx="0.3" fill="#ccc" />
      <circle cx="6" cy="34.5" r="0.8" fill="#555" />
      <rect x="9" y="33.8" width="28" height="1.2" rx="0.3" fill="#ccc" />
      {/* Section 2 */}
      <rect x="4" y="39" width="14" height="1.2" rx="0.3" fill="#111" opacity="0.8" />
      <rect x="4" y="41.5" width="40" height="0.5" fill="#111" opacity="0.3" />
      <rect x="4" y="44.5" width="26" height="1.5" rx="0.4" fill="#111" opacity="0.7" />
      <rect x="36" y="44.5" width="8" height="1.5" rx="0.4" fill="#888" />
      <rect x="4" y="48" width="38" height="1" rx="0.3" fill="#ccc" />
    </svg>
  )
}

export function ExecutiveThumb({ active, width = 48, height = 62 }: ThumbProps) {
  const dark = '#1a1f2e'
  const gold = active ? '#c9a84c' : '#c9a84c'
  return (
    <svg width={width} height={height} viewBox="0 0 48 62" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="62" rx="2" fill="white" />
      {/* Dark header */}
      <rect x="0" y="0" width="48" height="22" rx="2" fill={dark} />
      {/* Gold top stripe */}
      <rect x="0" y="0" width="48" height="1.5" fill={gold} opacity="0.9" />
      {/* Name */}
      <rect x="4" y="5" width="28" height="3.5" rx="0.5" fill="white" opacity="0.9" />
      {/* Gold rule */}
      <rect x="4" y="10" width="20" height="1" fill={gold} />
      {/* Job title */}
      <rect x="4" y="13" width="22" height="2" rx="0.5" fill={gold} opacity="0.8" />
      {/* Contact dots */}
      <circle cx="5" cy="19" r="0.8" fill={gold} opacity="0.7" />
      <rect x="7" y="18.2" width="12" height="1.5" rx="0.3" fill="#8fa0b4" />
      <circle cx="22" cy="19" r="0.8" fill={gold} opacity="0.7" />
      <rect x="24" y="18.2" width="14" height="1.5" rx="0.3" fill="#8fa0b4" />
      {/* Gold bottom stripe */}
      <rect x="0" y="20.5" width="48" height="1.5" fill={gold} opacity="0.8" />
      {/* Body sections */}
      <rect x="4" y="25" width="3" height="14" rx="1.5" fill={gold} opacity="0.5" />
      {/* Section heading with gold bar */}
      <rect x="9" y="25" width="16" height="1.5" rx="0.4" fill={dark} opacity="0.8" />
      <rect x="9" y="28" width="34" height="0.5" fill={gold} opacity="0.4" />
      <rect x="9" y="31" width="22" height="1.5" rx="0.4" fill="#444" opacity="0.7" />
      <rect x="9" y="34" width="30" height="1" rx="0.3" fill="#ccc" />
      <rect x="9" y="36.5" width="26" height="1" rx="0.3" fill="#ccc" />
      {/* Section 2 */}
      <rect x="4" y="42" width="3" height="10" rx="1.5" fill={gold} opacity="0.5" />
      <rect x="9" y="42" width="14" height="1.5" rx="0.4" fill={dark} opacity="0.8" />
      <rect x="9" y="45" width="34" height="0.5" fill={gold} opacity="0.4" />
      <rect x="9" y="48" width="38" height="1" rx="0.3" fill="#ccc" />
      <rect x="9" y="51" width="30" height="1" rx="0.3" fill="#ccc" />
      {/* Gold bottom */}
      <rect x="0" y="60" width="48" height="2" fill={gold} opacity="0.8" />
    </svg>
  )
}

export function FresherThumb({ active, width = 48, height = 62 }: ThumbProps) {
  const blue = active ? '#3b82f6' : '#2563eb'
  return (
    <svg width={width} height={height} viewBox="0 0 48 62" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="62" rx="2" fill="white" />
      {/* Light blue header bg */}
      <rect x="0" y="0" width="48" height="18" rx="2" fill="#eff6ff" />
      {/* Blue left accent bar */}
      <rect x="0" y="0" width="3" height="18" rx="1" fill={blue} />
      {/* Blue bottom border */}
      <rect x="0" y="17" width="48" height="1.5" fill={blue} />
      {/* Name */}
      <rect x="6" y="4" width="24" height="3.5" rx="0.5" fill="#0f172a" opacity="0.85" />
      {/* Blue job title */}
      <rect x="6" y="9.5" width="18" height="2" rx="0.5" fill={blue} opacity="0.9" />
      {/* Contact dots */}
      <circle cx="7" cy="15.5" r="0.7" fill={blue} opacity="0.7" />
      <rect x="9" y="14.8" width="10" height="1.3" rx="0.3" fill="#94a3b8" />
      <circle cx="22" cy="15.5" r="0.7" fill={blue} opacity="0.7" />
      <rect x="24" y="14.8" width="14" height="1.3" rx="0.3" fill="#94a3b8" />
      {/* EDUCATION section (first) */}
      <rect x="4" y="22" width="12" height="1.2" rx="0.3" fill={blue} opacity="0.9" />
      <rect x="18" y="22.6" width="26" height="0.5" fill={blue} opacity="0.4" />
      {/* Education cards */}
      <rect x="4" y="25" width="40" height="7" rx="2" fill="#eff6ff" />
      <rect x="4" y="25" width="2.5" height="7" rx="1" fill={blue} />
      <rect x="8" y="27" width="22" height="1.5" rx="0.4" fill="#0f172a" opacity="0.75" />
      <rect x="8" y="29.5" width="16" height="1" rx="0.3" fill="#94a3b8" />
      {/* SKILLS section */}
      <rect x="4" y="35" width="10" height="1.2" rx="0.3" fill={blue} opacity="0.9" />
      <rect x="16" y="35.6" width="28" height="0.5" fill={blue} opacity="0.4" />
      {/* Skill pills */}
      <rect x="4" y="38.5" width="10" height="3.5" rx="1.75" fill="#eff6ff" stroke="#93c5fd" strokeWidth="0.5" />
      <rect x="16" y="38.5" width="8" height="3.5" rx="1.75" fill="#eff6ff" stroke="#93c5fd" strokeWidth="0.5" />
      <rect x="26" y="38.5" width="12" height="3.5" rx="1.75" fill="#eff6ff" stroke="#93c5fd" strokeWidth="0.5" />
      {/* Experience section */}
      <rect x="4" y="45" width="18" height="1.2" rx="0.3" fill={blue} opacity="0.9" />
      <rect x="24" y="45.6" width="20" height="0.5" fill={blue} opacity="0.4" />
      <rect x="4" y="48.5" width="20" height="1.5" rx="0.4" fill="#0f172a" opacity="0.7" />
      <rect x="36" y="48.5" width="8" height="1.5" rx="0.4" fill="#94a3b8" />
      <rect x="4" y="52" width="38" height="1" rx="0.3" fill="#ccc" />
    </svg>
  )
}

export function GoogleStyleThumb({ active, width = 48, height = 62 }: ThumbProps) {
  const blue = active ? '#3b82f6' : '#1a73e8'
  return (
    <svg width={width} height={height} viewBox="0 0 48 62" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="62" rx="2" fill="white" />
      {/* Large light name */}
      <rect x="4" y="4" width="30" height="5" rx="0.5" fill="#202124" opacity="0.8" />
      {/* Blue job title */}
      <rect x="4" y="11" width="22" height="2.5" rx="0.5" fill={blue} opacity="0.9" />
      {/* Contact dots row */}
      <rect x="4" y="15" width="40" height="0.5" fill="#dadce0" />
      <rect x="4" y="16.5" width="38" height="1.2" rx="0.3" fill="#9aa0a6" />
      <rect x="4" y="18.5" width="40" height="0.5" fill="#dadce0" />
      {/* Blue section heading */}
      <rect x="4" y="22" width="14" height="1.5" rx="0.3" fill={blue} opacity="0.85" />
      <rect x="20" y="22.7" width="24" height="0.5" fill="#dadce0" />
      {/* Summary lines */}
      <rect x="4" y="25.5" width="40" height="1" rx="0.3" fill="#9aa0a6" />
      <rect x="4" y="27.5" width="34" height="1" rx="0.3" fill="#9aa0a6" />
      {/* Experience heading */}
      <rect x="4" y="31" width="18" height="1.5" rx="0.3" fill={blue} opacity="0.85" />
      <rect x="24" y="31.7" width="20" height="0.5" fill="#dadce0" />
      {/* Job row */}
      <rect x="4" y="34.5" width="22" height="1.5" rx="0.4" fill="#202124" opacity="0.75" />
      <rect x="38" y="34.5" width="6" height="1.5" rx="0.4" fill="#9aa0a6" />
      <rect x="4" y="37" width="14" height="1.2" rx="0.3" fill={blue} opacity="0.5" />
      <rect x="4" y="39.5" width="38" height="1" rx="0.3" fill="#e0e0e0" />
      <rect x="4" y="41.5" width="32" height="1" rx="0.3" fill="#e0e0e0" />
      {/* Skills heading */}
      <rect x="4" y="45.5" width="20" height="1.5" rx="0.3" fill={blue} opacity="0.85" />
      <rect x="26" y="46.2" width="18" height="0.5" fill="#dadce0" />
      {/* Chip skills */}
      <rect x="4" y="49.5" width="10" height="3" rx="1" fill="#f8f9fa" stroke="#dadce0" strokeWidth="0.5" />
      <rect x="16" y="49.5" width="8" height="3" rx="1" fill="#f8f9fa" stroke="#dadce0" strokeWidth="0.5" />
      <rect x="26" y="49.5" width="13" height="3" rx="1" fill="#f8f9fa" stroke="#dadce0" strokeWidth="0.5" />
    </svg>
  )
}

export function DubaiGoldThumb({ active, width = 48, height = 62 }: ThumbProps) {
  const navy = '#0c1b33'
  const gold = active ? '#e8c96d' : '#c9a84c'
  return (
    <svg width={width} height={height} viewBox="0 0 48 62" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="62" rx="2" fill="#f8f5ee" />
      {/* Navy header */}
      <rect x="0" y="0" width="48" height="21" rx="2" fill={navy} />
      {/* Gold shimmer top */}
      <rect x="0" y="0" width="48" height="1.5" fill={gold} opacity="0.8" />
      {/* Name */}
      <rect x="4" y="5" width="26" height="3.5" rx="0.5" fill="white" opacity="0.9" />
      {/* Gold underline */}
      <rect x="4" y="9.5" width="14" height="1" fill={gold} />
      {/* Gold job title */}
      <rect x="4" y="12" width="22" height="2" rx="0.5" fill={gold} opacity="0.85" />
      {/* Contact pills */}
      <rect x="4" y="15.5" width="16" height="3" rx="1.5" fill={gold} opacity="0.15" stroke={gold} strokeWidth="0.3" />
      <rect x="22" y="15.5" width="18" height="3" rx="1.5" fill={gold} opacity="0.15" stroke={gold} strokeWidth="0.3" />
      {/* Gold bottom shimmer */}
      <rect x="0" y="19" width="48" height="2" fill={gold} opacity="0.7" />
      {/* Body sections with gold diamond markers */}
      <circle cx="5.5" cy="25.5" r="1.2" fill={gold} />
      <rect x="9" y="24.5" width="14" height="1.5" rx="0.4" fill={navy} opacity="0.8" />
      <rect x="25" y="25.2" width="19" height="0.5" fill={gold} opacity="0.5" />
      {/* Gold left bar on experience */}
      <rect x="4" y="28.5" width="2" height="12" rx="1" fill={gold} opacity="0.5" />
      <rect x="8" y="29" width="20" height="1.5" rx="0.4" fill="#111" opacity="0.75" />
      <rect x="36" y="29" width="8" height="1.5" rx="3" fill={navy} />
      <rect x="8" y="32" width="14" height="1.2" rx="0.3" fill={gold} opacity="0.7" />
      <rect x="8" y="35" width="34" height="1" rx="0.3" fill="#ccc" />
      <rect x="8" y="37.5" width="28" height="1" rx="0.3" fill="#ccc" />
      {/* Section 2 */}
      <circle cx="5.5" cy="43" r="1.2" fill={gold} />
      <rect x="9" y="42" width="12" height="1.5" rx="0.4" fill={navy} opacity="0.8" />
      <rect x="23" y="42.7" width="21" height="0.5" fill={gold} opacity="0.5" />
      <rect x="9" y="46" width="36" height="1" rx="0.3" fill="#ccc" />
      <rect x="9" y="48.5" width="30" height="1" rx="0.3" fill="#ccc" />
      {/* Gold footer */}
      <rect x="0" y="60" width="48" height="2" fill={gold} opacity="0.7" />
    </svg>
  )
}

export const THUMB_COMPONENTS: Record<string, React.ComponentType<ThumbProps>> = {
  classic: ClassicThumb,
  modern: ModernThumb,
  minimal: MinimalThumb,
  'ats-pro': AtsProThumb,
  sidebar: SidebarThumb,
  'tech-clean': TechCleanThumb,
  harvard: HarvardThumb,
  executive: ExecutiveThumb,
  fresher: FresherThumb,
  'google-style': GoogleStyleThumb,
  'dubai-gold': DubaiGoldThumb,
}
