"use client";

import { useCallback, useRef, useState } from "react";
import styles from "./page.module.css";
import { pixelateImage, countBeads, type Grid } from "@/lib/pixelate";
import { BRANDS, PALETTES, type BrandId } from "@/lib/palettes";

const BOARD_PRESETS = [
  { label: "Placa pequena (14×14)", value: 14 },
  { label: "Placa média (20×20)", value: 20 },
  { label: "Placa padrão (29×29)", value: 29 },
  { label: "Placa grande (40×40)", value: 40 },
];

export default function Home() {
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [brand, setBrand] = useState<BrandId>("hama");
  const [columns, setColumns] = useState(29);
  const [alphaThreshold, setAlphaThreshold] = useState(40);
  const [dragOver, setDragOver] = useState(false);
  const [grid, setGrid] = useState<Grid | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback((file: File) => {
    if (!file.type.includes("png") && !file.type.includes("webp") && !file.type.includes("gif")) {
      // Ainda deixamos passar outros formatos, mas avisamos que o ideal é PNG com transparência.
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setImageEl(img);
      setFileName(file.name);
    };
    img.src = url;
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) loadFile(file);
    },
    [loadFile]
  );

  const renderGrid = useCallback((g: Grid, cols: number) => {
    const rows = g.length;
    const cellSize = 18;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = cols * cellSize;
    canvas.height = rows * cellSize;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#efe7d8";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = g[r][c];
        const cx = c * cellSize + cellSize / 2;
        const cy = r * cellSize + cellSize / 2;

        // furo do pegboard
        ctx.beginPath();
        ctx.fillStyle = "#d9cdb4";
        ctx.arc(cx, cy, cellSize * 0.16, 0, Math.PI * 2);
        ctx.fill();

        if (!cell.color) continue;

        const radius = cellSize * 0.42;
        const gradient = ctx.createRadialGradient(
          cx - radius * 0.3,
          cy - radius * 0.3,
          radius * 0.1,
          cx,
          cy,
          radius
        );
        gradient.addColorStop(0, lighten(cell.color.hex, 0.25));
        gradient.addColorStop(1, cell.color.hex);

        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(0,0,0,0.18)";
        ctx.stroke();
      }
    }
  }, []);

  const handleGenerate = useCallback(() => {
    if (!imageEl) return;
    const palette = PALETTES[brand];
    const result = pixelateImage(imageEl, { columns, alphaThreshold, palette });
    setGrid(result.grid);
    renderGrid(result.grid, result.columns);
  }, [imageEl, columns, alphaThreshold, brand, renderGrid]);

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "molde-de-contas.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, []);

  const counts = grid ? countBeads(grid) : null;
  const totalBeads = counts ? Array.from(counts.values()).reduce((acc, v) => acc + v.count, 0) : 0;
  const sortedCounts = counts
    ? Array.from(counts.values()).sort((a, b) => b.count - a.count)
    : [];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.wordmark}>
          conta<span>·</span>a<span>·</span>conta
        </div>
        <div className={styles.eyebrow}>molde de pixel para hama beads</div>
      </header>

      <section className={styles.hero}>
        <h1>Transforme uma imagem em molde de contas.</h1>
        <p>
          Suba uma imagem com fundo transparente, escolha o tamanho da placa e receba
          o molde pixelado pronto, com a contagem exata de quantas contas de cada cor
          você precisa comprar.
        </p>
      </section>

      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.brandRow}>
            <span className={styles.brandLabel}>Marca das contas</span>
            <div className={styles.brandOptions}>
              {BRANDS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  className={`${styles.brandBtn} ${brand === b.id ? styles.brandBtnActive : ""}`}
                  onClick={() => {
                    setBrand(b.id);
                    setGrid(null);
                  }}
                >
                  <span>{b.label}</span>
                  <small>{b.description}</small>
                </button>
              ))}
            </div>
          </div>

          <div
            className={`${styles.dropzone} ${dragOver ? styles.dragOver : ""}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/webp,image/gif"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) loadFile(file);
              }}
            />
            <div className={styles.dropzoneLabel}>
              {fileName ? `Imagem carregada: ${fileName}` : "Clique ou arraste sua imagem aqui"}
            </div>
            <div className={styles.dropzoneHint}>
              PNG com fundo transparente funciona melhor — pixels transparentes ficam
              sem conta no molde
            </div>
          </div>

          <div className={styles.controlsRow}>
            <div className={styles.controlGroup}>
              <label>
                Largura da placa <strong>{columns} contas</strong>
              </label>
              <input
                type="range"
                min={8}
                max={60}
                value={columns}
                onChange={(e) => setColumns(Number(e.target.value))}
              />
              <select
                style={{ marginTop: 8, width: "100%", fontFamily: "var(--font-mono)", fontSize: 12 }}
                onChange={(e) => setColumns(Number(e.target.value))}
                value={BOARD_PRESETS.some((p) => p.value === columns) ? columns : ""}
              >
                <option value="" disabled>
                  ou escolha um tamanho comum
                </option>
                {BOARD_PRESETS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.controlGroup}>
              <label>
                Sensibilidade do fundo <strong>{alphaThreshold}</strong>
              </label>
              <input
                type="range"
                min={0}
                max={200}
                value={alphaThreshold}
                onChange={(e) => setAlphaThreshold(Number(e.target.value))}
              />
              <div className={styles.dropzoneHint}>
                Aumente se ainda sobrar fundo no molde
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={!imageEl}
              onClick={handleGenerate}
            >
              Gerar molde
            </button>
            <button className={styles.btn} disabled={!grid} onClick={handleDownload}>
              Baixar imagem do molde
            </button>
          </div>

          <div className={styles.canvasWrap}>
            {grid ? (
              <canvas ref={canvasRef} />
            ) : (
              <div className={styles.placeholder}>
                seu molde aparece aqui depois que você gerar
              </div>
            )}
          </div>
        </div>

        <aside className={`${styles.card} ${styles.sidebar}`}>
          <h2>Lista de contas</h2>
          {grid ? (
            <div className={styles.totalBadge}>
              total <span>{totalBeads}</span> contas
            </div>
          ) : (
            <p className={styles.dropzoneHint} style={{ marginTop: 10 }}>
              gere um molde para ver a lista de cores e quantidades
            </p>
          )}
          {sortedCounts.length > 0 && (
            <ul className={styles.colorList}>
              {sortedCounts.map(({ color, count }) => (
                <li key={color.id} className={styles.colorRow}>
                  <span className={styles.swatch} style={{ background: color.hex }} />
                  <span className={styles.colorName}>
                    {color.name}
                    <div className={styles.colorHex}>
                      {color.code} · {color.hex}
                    </div>
                  </span>
                  <span className={styles.colorCount}>{count}×</span>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </main>

      <footer className={styles.footer}>
        As cores mostradas são uma aproximação de catálogos comuns de hama/pearl
        beads — confira as cores exatas com o fornecedor antes de comprar o material.
      </footer>
    </div>
  );
}

function lighten(hex: string, amount: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  const lr = Math.round(r + (255 - r) * amount);
  const lg = Math.round(g + (255 - g) * amount);
  const lb = Math.round(b + (255 - b) * amount);
  return `rgb(${lr}, ${lg}, ${lb})`;
}
