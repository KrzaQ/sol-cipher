/** Per-element Tailwind class sets for consistent color coding. */
export const ELEMENT_COLORS = [
  // 0 = Venus (earth/amber) — muted to distinguish from UI accents
  { heading: 'text-amber-300/70', accent: 'accent-amber-500', link: 'text-amber-300/70 hover:text-amber-200', ring: 'ring-amber-500/70', selectedBg: 'bg-amber-900/30', hoverBg: 'hover:bg-amber-900/20' },
  // 1 = Mercury (water/cyan)
  { heading: 'text-cyan-400', accent: 'accent-cyan-500', link: 'text-cyan-400 hover:text-cyan-300', ring: 'ring-cyan-500', selectedBg: 'bg-cyan-900/30', hoverBg: 'hover:bg-cyan-900/20' },
  // 2 = Mars (fire/red)
  { heading: 'text-red-400', accent: 'accent-red-500', link: 'text-red-400 hover:text-red-300', ring: 'ring-red-500', selectedBg: 'bg-red-900/30', hoverBg: 'hover:bg-red-900/20' },
  // 3 = Jupiter (wind/violet)
  { heading: 'text-violet-400', accent: 'accent-violet-500', link: 'text-violet-400 hover:text-violet-300', ring: 'ring-violet-500', selectedBg: 'bg-violet-900/30', hoverBg: 'hover:bg-violet-900/20' },
] as const;

/** Character index → element colors (Isaac=Venus, Garet=Mars, Ivan=Jupiter, Mia=Mercury). */
export const CHAR_COLORS = [
  ELEMENT_COLORS[0], // Isaac → Venus
  ELEMENT_COLORS[2], // Garet → Mars
  ELEMENT_COLORS[3], // Ivan  → Jupiter
  ELEMENT_COLORS[1], // Mia   → Mercury
] as const;
