import logoAsset from "@/assets/hh-logo.png.asset.json";
import bgAsset from "@/assets/hh-bg.png.asset.json";

const GREEN = "#0d5c34";
const YELLOW = "#f5d919";
const PINK = "#ec1a71";
const CREAM = "#f7f3e6";

const cache = new Map<string, Promise<HTMLImageElement>>();

export function loadImage(src: string): Promise<HTMLImageElement> {
  if (!cache.has(src)) {
    cache.set(
      src,
      new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      }),
    );
  }
  return cache.get(src)!;
}

export const preloadBrandArt = () =>
  Promise.all([loadImage(logoAsset.url), loadImage(bgAsset.url)]);

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  focusY = 0.42,
) {
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) * focusY, dw, dh);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function grain(ctx: CanvasRenderingContext2D, w: number, h: number, amount = 0.05) {
  ctx.save();
  ctx.globalAlpha = amount;
  for (let i = 0; i < (w * h) / 900; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    ctx.fillStyle = Math.random() > 0.5 ? "#ffffff" : "#000000";
    ctx.fillRect(x, y, 2, 2);
  }
  ctx.restore();
}

function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  font: (size: number) => string,
  maxWidth: number,
  startSize: number,
  minSize = 20,
) {
  let size = startSize;
  ctx.font = font(size);
  while (ctx.measureText(text).width > maxWidth && size > minSize) {
    size -= 2;
    ctx.font = font(size);
  }
  return size;
}

function italic(ctx: CanvasRenderingContext2D, draw: () => void, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.transform(1, 0, -0.16, 1, 0, 0);
  ctx.translate(-x, -y);
  draw();
  ctx.restore();
}

export type CardInput = {
  photo: HTMLImageElement;
  name: string;
  role: string;
  stack: string[];
  builderTitle: string;
};

export async function renderCard(input: CardInput): Promise<HTMLCanvasElement> {
  const [logo, beach] = await preloadBrandArt();
  const W = 1080;
  const H = 1620;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = GREEN;
  ctx.fillRect(0, 0, W, H);

  // Header wordmark banner
  const headerH = Math.round((W / logo.width) * logo.height);
  ctx.drawImage(logo, 0, 0, W, headerH);

  // thin yellow rule
  ctx.fillStyle = YELLOW;
  ctx.fillRect(56, headerH + 10, W - 112, 4);

  // Beach illustration band (bottom)
  const beachH = 420;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, H - beachH, W, beachH);
  ctx.clip();
  drawCover(ctx, beach, 0, H - beachH, W, beachH, 0.72);
  ctx.restore();

  // --- Pink "BUILDER ID CARD" tag
  const tagY = 400;
  ctx.save();
  ctx.translate(70, tagY);
  ctx.rotate(-0.025);
  ctx.fillStyle = PINK;
  roundRect(ctx, 0, 0, 430, 68, 10);
  ctx.fill();
  ctx.fillStyle = CREAM;
  ctx.font = "700 34px 'Archivo Black', Impact, sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText("BUILDER ID CARD", 26, 37);
  ctx.restore();

  // --- Photo frame
  const pw = 430;
  const ph = 470;
  const px = (W - pw) / 2;
  const py = 500;
  ctx.save();
  ctx.translate(px + pw / 2, py + ph / 2);
  ctx.rotate(-0.018);
  ctx.translate(-(px + pw / 2), -(py + ph / 2));
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 14;
  ctx.fillStyle = YELLOW;
  roundRect(ctx, px, py, pw, ph, 18);
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.save();
  roundRect(ctx, px + 14, py + 14, pw - 28, ph - 28, 10);
  ctx.clip();
  drawCover(ctx, input.photo, px + 14, py + 14, pw - 28, ph - 28, 0.35);
  ctx.restore();
  ctx.restore();

  // star accent
  ctx.fillStyle = PINK;
  ctx.font = "700 76px 'Archivo Black', sans-serif";
  ctx.fillText("✦", px + pw - 34, py + 26);

  // --- Name
  let y = 1058;
  const nameText = (input.name || "Your Name").toUpperCase();
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = YELLOW;
  const nameSize = fitText(
    ctx,
    nameText,
    (s) => `700 ${s}px 'Archivo Black', Impact, sans-serif`,
    W - 180,
    104,
    44,
  );
  ctx.font = `700 ${nameSize}px 'Archivo Black', Impact, sans-serif`;
  ctx.textAlign = "center";
  italic(ctx, () => ctx.fillText(nameText, W / 2, y), W / 2, y);

  // --- Role
  y = 1092;
  ctx.fillStyle = PINK;
  ctx.font = "700 26px 'JetBrains Mono', monospace";
  ctx.fillText("YOUR STACK / ROLE", W / 2, y);
  y = 1139;
  ctx.fillStyle = CREAM;
  const roleText = (input.role || "Builder").toUpperCase();
  const roleSize = fitText(
    ctx,
    roleText,
    (s) => `700 ${s}px 'Archivo Black', sans-serif`,
    W - 200,
    44,
    22,
  );
  ctx.font = `700 ${roleSize}px 'Archivo Black', sans-serif`;
  ctx.fillText(roleText, W / 2, y);

  // --- Stack chips
  y = 1166;
  const chips = input.stack.slice(0, 6);
  if (chips.length) {
    ctx.font = "700 24px 'JetBrains Mono', monospace";
    const padX = 20;
    const widths = chips.map((c) => ctx.measureText(c.toUpperCase()).width + padX * 2);
    const gap = 14;
    const total = widths.reduce((a, b) => a + b, 0) + gap * (chips.length - 1);
    let cx = (W - total) / 2;
    chips.forEach((c, i) => {
      const cw = widths[i] ?? 100;
      ctx.strokeStyle = YELLOW;
      ctx.lineWidth = 2;
      roundRect(ctx, cx, y, cw, 46, 23);
      ctx.stroke();
      ctx.fillStyle = YELLOW;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(c.toUpperCase(), cx + cw / 2, y + 24);
      ctx.textBaseline = "alphabetic";
      cx += cw + gap;
    });
    y += 46;
  }

  // --- Builder title pink band (overlaps beach)
  const bandY = 1266;
  ctx.save();
  ctx.translate(W / 2, bandY + 84);
  ctx.rotate(-0.03);
  ctx.fillStyle = PINK;
  roundRect(ctx, -(W - 150) / 2, -84, W - 150, 168, 24);
  ctx.fill();
  ctx.textAlign = "center";
  ctx.fillStyle = YELLOW;
  ctx.font = "700 28px 'JetBrains Mono', monospace";
  ctx.fillText("BUILDER TITLE", 0, -32);
  ctx.fillStyle = CREAM;
  const t = input.builderTitle.toUpperCase();
  const words = t.split(" ");
  const line1 = words.slice(0, Math.ceil(words.length / 2)).join(" ") || " ";
  const line2 = words.slice(Math.ceil(words.length / 2)).join(" ") || " ";
  const ts = Math.min(
    fitText(ctx, line1, (s) => `700 ${s}px 'Archivo Black', sans-serif`, W - 240, 58, 24),
    fitText(ctx, line2, (s) => `700 ${s}px 'Archivo Black', sans-serif`, W - 240, 58, 24),
  );
  ctx.font = `700 ${ts}px 'Archivo Black', sans-serif`;
  italic(ctx, () => ctx.fillText(line1, 0, 14), 0, 14);
  italic(ctx, () => ctx.fillText(line2, 0, 14 + ts + 8), 0, 14 + ts + 8);
  ctx.restore();

  // --- Footer
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(6,42,24,0.85)";
  ctx.fillRect(0, H - 118, W, 118);
  ctx.fillStyle = YELLOW;
  ctx.font = "700 30px 'Archivo Black', sans-serif";
  ctx.fillText("BUILD. CODE. REPEAT.", 56, H - 66);
  ctx.fillStyle = CREAM;
  ctx.font = "italic 26px 'JetBrains Mono', monospace";
  ctx.fillText("Hack by the beach. Change the world.", 56, H - 28);

  // seal
  ctx.save();
  ctx.translate(W - 108, H - 62);
  ctx.strokeStyle = YELLOW;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 60, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = YELLOW;
  ctx.textAlign = "center";
  ctx.font = "700 18px 'JetBrains Mono', monospace";
  ctx.fillText("HACKER", 0, -16);
  ctx.fillText("HOUSE", 0, 4);
  ctx.fillStyle = PINK;
  ctx.fillText("GOA 26", 0, 30);
  ctx.restore();

  grain(ctx, W, H, 0.045);
  return canvas;
}

export async function renderPfp(photo: HTMLImageElement): Promise<HTMLCanvasElement> {
  const [logo] = await preloadBrandArt();
  const S = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = GREEN;
  ctx.fillRect(0, 0, S, S);
  ctx.save();
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, S / 2 - 44, 0, Math.PI * 2);
  ctx.clip();
  drawCover(ctx, photo, 44, 44, S - 88, S - 88, 0.35);

  // vignette so bottom lockup reads
  const g = ctx.createLinearGradient(0, S * 0.5, 0, S);
  g.addColorStop(0, "rgba(6,42,24,0)");
  g.addColorStop(1, "rgba(6,42,24,0.94)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  ctx.restore();

  // rings
  ctx.lineWidth = 46;
  ctx.strokeStyle = GREEN;
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, S / 2 - 21, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 8;
  ctx.strokeStyle = YELLOW;
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, S / 2 - 48, 0, Math.PI * 2);
  ctx.stroke();


  // wordmark strip at bottom
  const stripW = 560;
  const stripH = Math.round((stripW / logo.width) * logo.height);
  ctx.save();
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, S / 2 - 44, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(logo, (S - stripW) / 2, S - stripH - 130, stripW, stripH);
  ctx.restore();

  // pink ribbon
  ctx.save();
  ctx.translate(S / 2, S - 128);
  ctx.rotate(-0.03);
  ctx.fillStyle = PINK;
  roundRect(ctx, -240, -34, 480, 68, 34);
  ctx.fill();
  ctx.fillStyle = YELLOW;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "700 32px 'JetBrains Mono', monospace";
  ctx.fillText("GOA · 28–31 OCT 2026", 0, 2);
  ctx.restore();

  grain(ctx, S, S, 0.04);
  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((res) => canvas.toBlob((b) => res(b!), "image/png", 0.95));
}
