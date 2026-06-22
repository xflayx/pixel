import { BEAD_PALETTE, hexToRgb, type BeadColor } from "./palettes";

export type Cell = { color: BeadColor | null };
export type Grid = Cell[][];

// ---- Conversão de cor para o espaço Lab (mais fiel à percepção humana que RGB) ----

function srgbToLinear(c: number) {
  const cs = c / 255;
  return cs <= 0.04045 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
}

function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  const rl = srgbToLinear(r);
  const gl = srgbToLinear(g);
  const bl = srgbToLinear(b);

  const x = rl * 0.4124 + gl * 0.3576 + bl * 0.1805;
  const y = rl * 0.2126 + gl * 0.7152 + bl * 0.0722;
  const z = rl * 0.0193 + gl * 0.1192 + bl * 0.9505;

  const xn = 0.95047, yn = 1.0, zn = 1.08883;
  const fx = labF(x / xn);
  const fy = labF(y / yn);
  const fz = labF(z / zn);

  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

function labF(t: number) {
  const delta = 6 / 29;
  return t > Math.pow(delta, 3) ? Math.pow(t, 1 / 3) : t / (3 * delta * delta) + 4 / 29;
}

const PALETTE_LAB = BEAD_PALETTE.map((c) => {
  const [r, g, b] = hexToRgb(c.hex);
  return { color: c, lab: rgbToLab(r, g, b) };
});

export function nearestBeadColor(r: number, g: number, b: number): BeadColor {
  const lab = rgbToLab(r, g, b);
  let best = PALETTE_LAB[0];
  let bestDist = Infinity;
  for (const entry of PALETTE_LAB) {
    const dl = lab[0] - entry.lab[0];
    const da = lab[1] - entry.lab[1];
    const db = lab[2] - entry.lab[2];
    const dist = dl * dl + da * da + db * db;
    if (dist < bestDist) {
      bestDist = dist;
      best = entry;
    }
  }
  return best.color;
}

// ---- Pixelização ----

export type PixelateOptions = {
  columns: number;
  alphaThreshold: number; // 0-255, abaixo disso a célula é considerada "vazia"
};

export function pixelateImage(
  img: HTMLImageElement,
  opts: PixelateOptions
): { grid: Grid; rows: number; columns: number } {
  const { columns, alphaThreshold } = opts;
  const rows = Math.max(1, Math.round((columns * img.height) / img.width));

  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const cellW = img.width / columns;
  const cellH = img.height / rows;

  const grid: Grid = [];

  for (let row = 0; row < rows; row++) {
    const rowCells: Cell[] = [];
    for (let col = 0; col < columns; col++) {
      const x0 = Math.floor(col * cellW);
      const x1 = Math.floor((col + 1) * cellW);
      const y0 = Math.floor(row * cellH);
      const y1 = Math.floor((row + 1) * cellH);

      // Em vez de tirar a média de cor da célula (que mistura pixels de
      // contorno/antialiasing com a cor de fundo e gera tons de cinza
      // indesejados), votamos pela cor predominante (moda) entre os pixels
      // visíveis da célula. Isso preserva áreas chapadas (ex: o branco do
      // olho) mesmo quando há pixels de borda mais escuros misturados.
      let totalPixels = 0;
      let opaquePixels = 0;
      const votes = new Map<string, { color: BeadColor; weight: number }>();

      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          totalPixels++;
          const idx = (y * canvas.width + x) * 4;
          const a = data[idx + 3];
          if (a < alphaThreshold) continue;

          opaquePixels++;
          const match = nearestBeadColor(data[idx], data[idx + 1], data[idx + 2]);
          const weight = a / 255;
          const existing = votes.get(match.id);
          if (existing) {
            existing.weight += weight;
          } else {
            votes.set(match.id, { color: match, weight });
          }
        }
      }

      // Célula é considerada vazia se a maior parte dela for transparente.
      if (totalPixels === 0 || opaquePixels / totalPixels < 0.35) {
        rowCells.push({ color: null });
        continue;
      }

      let winner: BeadColor | null = null;
      let bestWeight = -1;
      for (const { color, weight } of votes.values()) {
        if (weight > bestWeight) {
          bestWeight = weight;
          winner = color;
        }
      }

      rowCells.push({ color: winner });
    }
    grid.push(rowCells);
  }

  return { grid, rows, columns };
}

export function countBeads(grid: Grid): Map<string, { color: BeadColor; count: number }> {
  const counts = new Map<string, { color: BeadColor; count: number }>();
  for (const row of grid) {
    for (const cell of row) {
      if (!cell.color) continue;
      const existing = counts.get(cell.color.id);
      if (existing) {
        existing.count++;
      } else {
        counts.set(cell.color.id, { color: cell.color, count: 1 });
      }
    }
  }
  return counts;
}
