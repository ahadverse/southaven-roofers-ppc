import type { IconName } from "@/components/Icon";

/**
 * Human-friendly names for every icon in components/Icon.tsx.
 * Typed as Record<IconName, string>, so TypeScript flags this list when an icon is added or removed.
 */
export const ICON_LABELS: Record<IconName, string> = {
  wrench: "Wrench (repair)",
  replace: "House with check (replacement)",
  hail: "Hail cloud",
  wind: "Wind",
  droplet: "Water drop (leaks)",
  alert: "Warning (emergency)",
  search: "Magnifier (inspection)",
  file: "Document (claims)",
  clipboard: "Clipboard checklist",
  layers: "Layers (shingles)",
  metal: "Metal roof",
  building: "Building (commercial)",
  home: "House",
  shield: "Shield",
  dollar: "Dollar (cost)",
  pin: "Map pin",
  clock: "Clock",
  users: "People",
  sun: "Sun (heat)",
  book: "Book",
  phone: "Phone",
  check: "Check mark",
  arrowRight: "Arrow right",
  arrowUp: "Arrow up",
  chevronRight: "Chevron right",
  chevronDown: "Chevron down",
  menu: "Menu",
  close: "Close (X)",
};

export const ICON_NAMES = Object.keys(ICON_LABELS) as IconName[];
