const GREEN = "#0d5c34";
const GREEN_DEEP = "#062a18";
const GREEN_DEEPER = "#04150d";
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

// Official brand art — served from /public/assets, bundled with the app (not a
// third-party CDN), so it works the same in dev and on the deployed site.
const WORDMARK_URL = "/assets/hh-wordmark-banner.jpeg";
const BEACH_SCENE_URL = "/assets/hh-beach-scene.jpeg";

export const preloadBrandArt = () =>
  Promise.all([loadImage(WORDMARK_URL), loadImage(BEACH_SCENE_URL)]);

export type Crop = { zoom: number; offsetX: number; offsetY: number };
export const DEFAULT_CROP: Crop = { zoom: 1, offsetX: 0, offsetY: 0 };

// Cover-fit an image into a box, then apply the same zoom/pan transform the
// interactive PhotoCropper preview uses, so what the user frames is what renders.
function drawCoverCropped(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  crop: Crop = DEFAULT_CROP,
) {
  const { zoom, offsetX, offsetY } = crop;
  const baseScale = Math.max(w / img.width, h / img.height);
  const scale = baseScale * zoom;
  const dw = img.width * scale;
  const dh = img.height * scale;
  const slackX = Math.max(0, dw - w);
  const slackY = Math.max(0, dh - h);
  const drawX = x + (w - dw) / 2 + offsetX * (slackX / 2);
  const drawY = y + (h - dh) / 2 + offsetY * (slackY / 2);
  ctx.drawImage(img, drawX, drawY, dw, dh);
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

// Dark outline behind a fill so text stays legible over the busy beach photo
// (a plain fill can visually vanish against light sand / matching hues).
function outlinedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fillColor: string,
  outlineColor: string,
  outlineWidth: number,
) {
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;
  ctx.lineWidth = outlineWidth;
  ctx.strokeStyle = outlineColor;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fillColor;
  ctx.fillText(text, x, y);
}

function italic(ctx: CanvasRenderingContext2D, draw: () => void, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.transform(1, 0, -0.16, 1, 0, 0);
  ctx.translate(-x, -y);
  draw();
  ctx.restore();
}

// Cartoon coconut palm silhouette: tapered curved trunk + a radial fan of
// drooping fronds (varied length/curve, spanning almost a full crown) + coconuts.
function drawPalmTree(
  ctx: CanvasRenderingContext2D,
  baseX: number,
  baseY: number,
  scale: number,
  flip: 1 | -1,
  color: string,
) {
  ctx.save();
  ctx.translate(baseX, baseY);
  ctx.scale(scale * flip, scale);

  const trunkH = 280;
  const lean = 40;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-10, 2);
  ctx.quadraticCurveTo(-3 + lean * 0.5, -trunkH * 0.55, lean - 4, -trunkH);
  ctx.quadraticCurveTo(lean, -trunkH - 4, lean + 4, -trunkH);
  ctx.quadraticCurveTo(6 + lean * 0.5, -trunkH * 0.55, 10, 2);
  ctx.closePath();
  ctx.fill();

  const topX = lean;
  const topY = -trunkH;

  const fronds: [number, number, number][] = [
    [-160, 92, 16],
    [-128, 112, 6],
    [-95, 122, -8],
    [-58, 116, -20],
    [-20, 100, -26],
    [18, 84, -22],
    [55, 70, -10],
    [90, 60, 14],
  ];
  for (const [angleDeg, len, curve] of fronds) {
    ctx.save();
    ctx.translate(topX, topY);
    ctx.rotate((angleDeg * Math.PI) / 180);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(len * 0.4, -curve, len, curve * 0.55);
    ctx.quadraticCurveTo(len * 0.45, curve * 0.9 + 6, 0, 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(topX - 7, topY + 16, 7.5, 0, Math.PI * 2);
  ctx.arc(topX + 5, topY + 20, 7.5, 0, Math.PI * 2);
  ctx.arc(topX - 1, topY + 28, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Full-bleed cover-fit of the official beach-scene illustration behind the card.
function drawBeachBackdrop(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  W: number,
  H: number,
) {
  ctx.fillStyle = GREEN_DEEP;
  ctx.fillRect(0, 0, W, H);
  const scale = Math.max(W / img.width, H / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
}

// Official wordmark banner drawn edge-to-edge at the top, scaled to its own
// aspect ratio (undistorted) — replaces the hand-drawn wordmark recreation.
function drawWordmark(ctx: CanvasRenderingContext2D, wordmark: HTMLImageElement, W: number): number {
  const headerH = Math.round(W * (wordmark.height / wordmark.width));
  ctx.drawImage(wordmark, 0, 0, W, headerH);
  return headerH;
}

export type CardInput = {
  photo: HTMLImageElement;
  name: string;
  role: string;
  builderTitle: string;
  crop?: Crop;
};

export async function renderCard(input: CardInput): Promise<HTMLCanvasElement> {
  const [wordmark, beach] = await preloadBrandArt();
  const W = 1080;
  const H = 1620;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  drawBeachBackdrop(ctx, beach, W, H);

  const headerH = drawWordmark(ctx, wordmark, W);

  // thin yellow rule
  ctx.fillStyle = YELLOW;
  ctx.fillRect(56, headerH + 10, W - 112, 4);

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
  drawCoverCropped(ctx, input.photo, px + 14, py + 14, pw - 28, ph - 28, input.crop);
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
  italic(
    ctx,
    () => outlinedText(ctx, nameText, W / 2, y, YELLOW, GREEN_DEEPER, nameSize * 0.09),
    W / 2,
    y,
  );

  // --- Role
  y = 1130;
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
  outlinedText(ctx, roleText, W / 2, y, CREAM, GREEN_DEEPER, roleSize * 0.12);

  // --- Builder title pink band
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

export async function renderPfp(
  photo: HTMLImageElement,
  crop: Crop = DEFAULT_CROP,
): Promise<HTMLCanvasElement> {
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
  drawCoverCropped(ctx, photo, 44, 44, S - 88, S - 88, crop);

  // vignette so bottom lockup reads
  const g = ctx.createLinearGradient(0, S * 0.5, 0, S);
  g.addColorStop(0, "rgba(6,42,24,0)");
  g.addColorStop(1, "rgba(6,42,24,0.94)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);

  // palm silhouettes tucked into the vignette, positioned to stay inside the
  // circular clip (near the edges the clip cuts off well above the canvas base)
  drawPalmTree(ctx, S * 0.22, S * 0.88, 0.4, 1, "rgba(13,92,52,0.85)");
  drawPalmTree(ctx, S * 0.78, S * 0.86, 0.36, -1, "rgba(13,92,52,0.85)");
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

  // wordmark, clipped to the circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, S / 2 - 44, 0, Math.PI * 2);
  ctx.clip();
  ctx.textAlign = "center";
  ctx.fillStyle = CREAM;
  ctx.font = "700 54px 'Archivo Black', Impact, sans-serif";
  ctx.fillText("HACKER HOUSE", S / 2, S - 224);
  ctx.fillStyle = YELLOW;
  ctx.font = "700 30px 'Archivo Black', Impact, sans-serif";
  ctx.fillText("GOA 2026", S / 2, S - 182);
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
