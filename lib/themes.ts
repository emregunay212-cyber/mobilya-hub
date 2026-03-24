export interface ThemePalette {
  brand: string;
  warm: string;
  accent: string;
  gold: string;
  text: string;
  muted: string;
  border: string;
}

export interface Theme {
  id: string;
  name: string;
  desc: string;
  colors: string[];
  tags: string[];
  sectors: string[];
  palette: ThemePalette;
  fonts?: { heading: string; body: string };
}

export const THEMES: Theme[] = [
  {
    id: "classic-warm",
    name: "Klasik Sıcak",
    desc: "Kahverengi, geleneksel mobilya",
    colors: ["#2C2420", "#C8553D", "#D4A03C", "#FAF8F5"],
    tags: ["Geleneksel", "Sıcak"],
    sectors: ["mobilyaci", "kuyumcu", "cafe"],
    palette: {
      brand: "#2C2420",
      warm: "#FAF8F5",
      accent: "#C8553D",
      gold: "#D4A03C",
      text: "#2C2420",
      muted: "#6B5B4E",
      border: "#E8DDD0",
    },
  },
  {
    id: "navy-gold",
    name: "Navy Premium",
    desc: "Lacivert + altın, lüks düğün",
    colors: ["#1B2A4A", "#C9A55C", "#B8464B", "#FFFDF8"],
    tags: ["Premium", "Lüks"],
    sectors: ["mobilyaci", "kuyumcu", "oto-galeri"],
    palette: {
      brand: "#1B2A4A",
      warm: "#FFFDF8",
      accent: "#C9A55C",
      gold: "#C9A55C",
      text: "#1B2A4A",
      muted: "#7A7062",
      border: "#E5DDD0",
    },
  },
  {
    id: "modern-minimal",
    name: "Modern Minimal",
    desc: "Siyah-beyaz, temiz şık",
    colors: ["#111", "#FF4D4D", "#333", "#FAFAFA"],
    tags: ["Modern", "Minimal"],
    sectors: ["mobilyaci", "kuyumcu", "cafe", "oto-galeri"],
    palette: {
      brand: "#111",
      warm: "#FAFAFA",
      accent: "#FF4D4D",
      gold: "#FF4D4D",
      text: "#111",
      muted: "#777",
      border: "#E5E5E5",
    },
  },
  {
    id: "forest-natural",
    name: "Doğal Orman",
    desc: "Yeşil, organik doğal his",
    colors: ["#2D4A2B", "#6B8F3C", "#B8A44C", "#F8FAF5"],
    tags: ["Doğal", "Eko"],
    sectors: ["mobilyaci", "cafe"],
    palette: {
      brand: "#2D4A2B",
      warm: "#F8FAF5",
      accent: "#6B8F3C",
      gold: "#B8A44C",
      text: "#2D3B2A",
      muted: "#6B7A62",
      border: "#D8E5D0",
    },
  },
  {
    id: "cream-elegant",
    name: "Krem Elegant",
    desc: "Krem bordo, sofistike",
    colors: ["#5C1A33", "#8B3A5C", "#C4956A", "#FDF9F4"],
    tags: ["Elegant", "Sofistike"],
    sectors: ["mobilyaci", "kuyumcu", "cafe"],
    palette: {
      brand: "#5C1A33",
      warm: "#FDF9F4",
      accent: "#8B3A5C",
      gold: "#C4956A",
      text: "#3A2030",
      muted: "#8A7A70",
      border: "#E8DDD5",
    },
  },
  // New sector-specific themes
  {
    id: "cafe-cozy",
    name: "Cafe Sıcak",
    desc: "Kahve tonları, sıcak atmosfer",
    colors: ["#3E2723", "#8D6E63", "#FF8F00", "#FFF8E1"],
    tags: ["Cafe", "Sıcak"],
    sectors: ["cafe"],
    palette: {
      brand: "#3E2723",
      warm: "#FFF8E1",
      accent: "#FF8F00",
      gold: "#FF8F00",
      text: "#3E2723",
      muted: "#8D6E63",
      border: "#D7CCC8",
    },
    fonts: { heading: "Playfair Display", body: "DM Sans" },
  },
  {
    id: "auto-dark",
    name: "Auto Koyu",
    desc: "Koyu tema, sportif oto galeri",
    colors: ["#0D1117", "#58A6FF", "#F78166", "#F0F6FC"],
    tags: ["Koyu", "Sportif"],
    sectors: ["oto-galeri"],
    palette: {
      brand: "#0D1117",
      warm: "#F0F6FC",
      accent: "#58A6FF",
      gold: "#F78166",
      text: "#0D1117",
      muted: "#8B949E",
      border: "#30363D",
    },
    fonts: { heading: "DM Sans", body: "DM Sans" },
  },
  {
    id: "jewel-sparkle",
    name: "Mücevher Işıltı",
    desc: "Altın ve siyah, lüks kuyumcu",
    colors: ["#1A1A2E", "#D4AF37", "#C0392B", "#FAF3E0"],
    tags: ["Lüks", "Işıltılı"],
    sectors: ["kuyumcu"],
    palette: {
      brand: "#1A1A2E",
      warm: "#FAF3E0",
      accent: "#D4AF37",
      gold: "#D4AF37",
      text: "#1A1A2E",
      muted: "#7F8C8D",
      border: "#E8D5B5",
    },
    fonts: { heading: "Playfair Display", body: "DM Sans" },
  },
];

export function getThemeById(id: string): Theme {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}

export function getThemesBySector(sectorId: string): Theme[] {
  return THEMES.filter((t) => t.sectors.includes(sectorId));
}
