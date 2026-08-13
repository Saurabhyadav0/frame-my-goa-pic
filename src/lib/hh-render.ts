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

// Crop just the big "HACKER [गोवा] HOUSE" lockup out of the wordmark banner
// (excludes the "2:47 PM STUDIO" / "CHECK HYPE · APPLY" corner labels), sized
// to a target width and centered at (cx, topY).
function drawWordmarkCrop(
  ctx: CanvasRenderingContext2D,
  wordmark: HTMLImageElement,
  cx: number,
  topY: number,
  dw: number,
) {
  const sx = 0;
  const sy = wordmark.height * 0.24;
  const sw = wordmark.width;
  const sh = wordmark.height * 0.62;
  const dh = dw * (sh / sw);
  ctx.drawImage(wordmark, sx, sy, sw, sh, cx - dw / 2, topY, dw, dh);
  return dh;
}

// Blank "add your photo" placeholder — shown in the frame before any photo is
// uploaded, so the full card/PFP template is visible from the first paint.
function drawPhotoPlaceholder(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x, y, w, h);
  const cx = x + w / 2;
  const cy = y + h / 2;
  ctx.fillStyle = "rgba(6,42,24,0.14)";
  ctx.beginPath();
  ctx.arc(cx, cy - h * 0.09, w * 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx, cy + h * 0.26, w * 0.3, h * 0.18, 0, Math.PI, 0, true);
  ctx.fill();
}

export type CardInput = {
  photo: HTMLImageElement | null;
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
  if (input.photo) {
    drawCoverCropped(ctx, input.photo, px + 14, py + 14, pw - 28, ph - 28, input.crop);
  } else {
    drawPhotoPlaceholder(ctx, px + 14, py + 14, pw - 28, ph - 28);
  }
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

export type PfpVariant = "sunset" | "olive" | "sunburst" | "mono";

export const PFP_VARIANTS: { id: PfpVariant; label: string }[] = [
  { id: "sunset", label: "Sunset" },
  { id: "olive", label: "Olive Wreath" },
  { id: "sunburst", label: "Sunburst" },
  { id: "mono", label: "Mono" },
];

// Laurel/olive wreath: two mirrored fans of leaf blades arcing from the
// bottom of the circle up toward the sides, like a classic badge emblem.
function drawLaurelWreath(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  const leaves = 10;
  for (const side of [1, -1] as const) {
    for (let i = 0; i < leaves; i++) {
      const t = i / (leaves - 1);
      const angleDeg = 92 - side * t * 150;
      const angle = (angleDeg * Math.PI) / 180;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      const scale = 1 - t * 0.35;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle + side * 1.0);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(0, 0, 30 * scale, 12 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

// Bold radiating sunburst rays, alternating two tones, ringing the circle.
function drawSunburstRing(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  colorA: string,
  colorB: string,
) {
  const rays = 28;
  for (let i = 0; i < rays; i++) {
    const a0 = (i / rays) * Math.PI * 2;
    const a1 = ((i + 0.62) / rays) * Math.PI * 2;
    ctx.fillStyle = i % 2 === 0 ? colorA : colorB;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a0) * rInner, cy + Math.sin(a0) * rInner);
    ctx.lineTo(cx + Math.cos(a0) * rOuter, cy + Math.sin(a0) * rOuter);
    ctx.lineTo(cx + Math.cos(a1) * rOuter, cy + Math.sin(a1) * rOuter);
    ctx.lineTo(cx + Math.cos(a1) * rInner, cy + Math.sin(a1) * rInner);
    ctx.closePath();
    ctx.fill();
  }
}

export async function renderPfp(
  photo: HTMLImageElement | null,
  crop: Crop = DEFAULT_CROP,
  variant: PfpVariant = "sunset",
): Promise<HTMLCanvasElement> {
  const [wordmark, beach] = await preloadBrandArt();
  const S = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d")!;
  const cx = S / 2;
  const cy = S / 2;
  const photoR = S / 2 - 44;

  // --- background, per theme
  if (variant === "sunset") {
    drawBeachBackdrop(ctx, beach, S, S);
  } else if (variant === "olive") {
    const g = ctx.createLinearGradient(0, 0, 0, S);
    g.addColorStop(0, "#f7f3e6");
    g.addColorStop(1, "#eadfc2");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
  } else if (variant === "sunburst") {
    ctx.fillStyle = GREEN_DEEP;
    ctx.fillRect(0, 0, S, S);
    drawSunburstRing(ctx, cx, cy, photoR - 4, S * 0.72, YELLOW, PINK);
  } else {
    ctx.fillStyle = GREEN_DEEPER;
    ctx.fillRect(0, 0, S, S);
  }

  // --- photo, clipped to the circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, photoR, 0, Math.PI * 2);
  ctx.clip();
  if (photo) {
    drawCoverCropped(ctx, photo, 44, 44, S - 88, S - 88, crop);
  } else {
    drawPhotoPlaceholder(ctx, 44, 44, S - 88, S - 88);
  }

  if (!photo) {
    // keep the placeholder clean and legible — skip the darkening overlays below
  } else if (variant === "sunset") {
    const g = ctx.createLinearGradient(0, S * 0.5, 0, S);
    g.addColorStop(0, "rgba(6,42,24,0)");
    g.addColorStop(1, "rgba(6,42,24,0.94)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
    drawPalmTree(ctx, S * 0.22, S * 0.88, 0.4, 1, "rgba(13,92,52,0.85)");
    drawPalmTree(ctx, S * 0.78, S * 0.86, 0.36, -1, "rgba(13,92,52,0.85)");
  } else if (variant === "mono" || variant === "sunburst") {
    const g = ctx.createLinearGradient(0, S * 0.55, 0, S);
    g.addColorStop(0, "rgba(4,21,13,0)");
    g.addColorStop(1, "rgba(4,21,13,0.92)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
  }
  ctx.restore();

  // --- ring + decoration, per theme
  if (variant === "sunset") {
    ctx.lineWidth = 46;
    ctx.strokeStyle = GREEN;
    ctx.beginPath();
    ctx.arc(cx, cy, S / 2 - 21, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 8;
    ctx.strokeStyle = YELLOW;
    ctx.beginPath();
    ctx.arc(cx, cy, photoR - 4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, photoR, 0, Math.PI * 2);
    ctx.clip();
    drawWordmarkCrop(ctx, wordmark, cx, S - 280, 460);
    ctx.restore();

    ctx.save();
    ctx.translate(cx, S - 128);
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
  } else if (variant === "olive") {
    drawLaurelWreath(ctx, cx, cy, photoR + 26, "#7a8c4a");
    drawLaurelWreath(ctx, cx, cy, photoR + 14, "#5c6e35");
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#c9a227";
    ctx.beginPath();
    ctx.arc(cx, cy, photoR, 0, Math.PI * 2);
    ctx.stroke();

    ctx.save();
    ctx.translate(cx, cy - photoR - 4);
    ctx.fillStyle = PINK;
    roundRect(ctx, -84, -26, 168, 52, 26);
    ctx.fill();
    ctx.strokeStyle = CREAM;
    ctx.lineWidth = 4;
    roundRect(ctx, -84, -26, 168, 52, 26);
    ctx.stroke();
    ctx.fillStyle = CREAM;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "700 26px 'Archivo Black', Impact, sans-serif";
    ctx.fillText("GOA", 0, 3);
    ctx.restore();

    ctx.fillStyle = "#5c4a1f";
    ctx.textAlign = "center";
    ctx.font = "700 22px 'JetBrains Mono', monospace";
    ctx.fillText("HACKER HOUSE · 28–31 OCT 2026", cx, cy + photoR + 62);
  } else if (variant === "sunburst") {
    ctx.lineWidth = 10;
    ctx.strokeStyle = CREAM;
    ctx.beginPath();
    ctx.arc(cx, cy, photoR, 0, Math.PI * 2);
    ctx.stroke();

    ctx.save();
    ctx.translate(cx, S - 118);
    ctx.rotate(0.03);
    ctx.fillStyle = PINK;
    roundRect(ctx, -230, -32, 460, 64, 32);
    ctx.fill();
    ctx.fillStyle = YELLOW;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "700 28px 'Archivo Black', Impact, sans-serif";
    ctx.fillText("HACKER HOUSE GOA", 0, 2);
    ctx.restore();
  } else {
    ctx.lineWidth = 5;
    ctx.strokeStyle = CREAM;
    ctx.beginPath();
    ctx.arc(cx, cy, photoR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "rgba(247,243,230,0.5)";
    ctx.beginPath();
    ctx.arc(cx, cy, photoR + 14, 0, Math.PI * 2);
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.fillStyle = CREAM;
    ctx.font = "700 30px 'JetBrains Mono', monospace";
    ctx.fillText("HACKER HOUSE", cx, S - 172);
    ctx.fillStyle = YELLOW;
    ctx.font = "700 22px 'JetBrains Mono', monospace";
    ctx.fillText("GOA · 28–31 OCT 2026", cx, S - 132);
  }

  grain(ctx, S, S, 0.04);
  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((res) => canvas.toBlob((b) => res(b!), "image/png", 0.95));
}
