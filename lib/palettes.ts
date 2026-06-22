// Paleta de referência aproximada de cores de contas (estilo Hama/Perler "midi").
// Os nomes e hex são aproximações para fins de criação de padrão — sempre confira
// com o catálogo da marca/fornecedor que você for comprar antes de fechar o pedido.

export type BeadColor = {
  id: string;
  name: string;
  hex: string;
};

export const BEAD_PALETTE: BeadColor[] = [
  { id: "white", name: "Branco", hex: "#FAFAF7" },
  { id: "cream", name: "Creme", hex: "#F2E2C4" },
  { id: "yellow", name: "Amarelo", hex: "#F7D417" },
  { id: "yellow-light", name: "Amarelo claro", hex: "#FBE98A" },
  { id: "orange", name: "Laranja", hex: "#F2851C" },
  { id: "orange-light", name: "Laranja claro", hex: "#F7B26A" },
  { id: "red", name: "Vermelho", hex: "#D81E2C" },
  { id: "red-dark", name: "Vermelho escuro", hex: "#9B1B26" },
  { id: "pink", name: "Rosa", hex: "#F25C9A" },
  { id: "pink-light", name: "Rosa claro", hex: "#F9B8D2" },
  { id: "magenta", name: "Magenta", hex: "#C71F76" },
  { id: "purple", name: "Roxo", hex: "#7A3B9E" },
  { id: "purple-light", name: "Lilás", hex: "#B79CD6" },
  { id: "blue-dark", name: "Azul marinho", hex: "#1B3F8C" },
  { id: "blue", name: "Azul", hex: "#2469C4" },
  { id: "blue-light", name: "Azul claro", hex: "#7FC4E8" },
  { id: "turquoise", name: "Turquesa", hex: "#1FB6B0" },
  { id: "teal", name: "Verde-água", hex: "#0E8C7F" },
  { id: "green-dark", name: "Verde escuro", hex: "#1E6B3A" },
  { id: "green", name: "Verde", hex: "#3FA64B" },
  { id: "green-light", name: "Verde claro", hex: "#9ED36A" },
  { id: "lime", name: "Verde limão", hex: "#D6E62A" },
  { id: "brown-dark", name: "Marrom escuro", hex: "#5A3A22" },
  { id: "brown", name: "Marrom", hex: "#8B5A2B" },
  { id: "tan", name: "Bege", hex: "#D9B48F" },
  { id: "peach", name: "Pele", hex: "#F2C29B" },
  { id: "gray-dark", name: "Cinza escuro", hex: "#4A4A4A" },
  { id: "gray", name: "Cinza", hex: "#9B9B9B" },
  { id: "gray-light", name: "Cinza claro", hex: "#D6D6D6" },
  { id: "black", name: "Preto", hex: "#1A1A1A" },
];

export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return [r, g, b];
}
