import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  canvasToBlob,
  loadImage,
  preloadBrandArt,
  renderCard,
  renderPfp,
  type Crop,
  DEFAULT_CROP,
  type PfpVariant,
  PFP_VARIANTS,
} from "@/lib/hh-render";
import { CAPTION, titleFor } from "@/lib/hh-brand";
import { PhotoCropper } from "@/components/PhotoCropper";
import { TropicalScenery } from "@/components/TropicalScenery";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Frame in Goa — Hacker House Goa 2026 Builder ID" },
      {
        name: "description",
        content:
          "Upload a photo and instantly get a branded Hacker House Goa 2026 Builder ID card or X profile frame. Download and share in one pass.",
      },
      { property: "og:title", content: "Frame in Goa — Hacker House Goa 2026" },
      {
        property: "og:description",
        content: "Make your Hacker House Goa 2026 Builder ID card or PFP frame in seconds.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { property: "og:image", content: "/og-frame-in-goa.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "/og-frame-in-goa.png" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

const THEME_SWATCH: Record<PfpVariant, string> = {
  sunset: "border-yellow-400 bg-gradient-to-br from-green-700 to-orange-400",
  olive: "border-[#c9a227] bg-gradient-to-br from-[#f7f3e6] to-[#7a8c4a]",
  sunburst: "border-pink-500 bg-gradient-to-br from-yellow-300 to-green-800",
  mono: "border-[#f7f3e6] bg-[#04150d]",
};

const MARQUEE_ITEMS = [
  "FRAME IN GOA",
  "BUILD. CODE. REPEAT.",
  "#FrameInGoa",
  "GOA · 28–31 OCT 2026",
  "NO LOGIN · NO WAIT",
];

async function fileToImage(file: File) {
  let blob: Blob = file;
  const isHeic = /heic|heif/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
  if (isHeic) {
    const heic2any = (await import("heic2any")).default;
    blob = (await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 })) as Blob;
  }
  const url = URL.createObjectURL(blob);
  const img = await loadImage(url);
  return img;
}

function Index() {
  const [format, setFormat] = useState<"card" | "pfp">("card");
  const [pfpVariant, setPfpVariant] = useState<PfpVariant>("sunset");
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState<Crop>(DEFAULT_CROP);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [titleNonce, setTitleNonce] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const blobRef = useRef<Blob | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const builderTitle = titleFor(`${name}|${role}|${titleNonce}`);

  useEffect(() => {
    preloadBrandArt().catch(() => {});
  }, []);

  const generate = useCallback(async () => {
    setBusy(true);
    try {
      await (document as any).fonts?.ready;
      const canvas =
        format === "card"
          ? await renderCard({ photo, name, role, builderTitle, crop })
          : await renderPfp(photo, crop, pfpVariant);
      const blob = await canvasToBlob(canvas);
      blobRef.current = blob;
      setPreview((old) => {
        if (old) URL.revokeObjectURL(old);
        return URL.createObjectURL(blob);
      });
    } catch {
      setError("Couldn't render that image. Try another photo.");
    } finally {
      setBusy(false);
    }
  }, [photo, name, role, builderTitle, format, crop, pfpVariant]);

  useEffect(() => {
    const t = setTimeout(generate, 90);
    return () => clearTimeout(t);
  }, [generate]);

  async function onFile(file?: File | null) {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const img = await fileToImage(file);
      setPhoto(img);
      setCrop(DEFAULT_CROP);
    } catch {
      setError("That file couldn't be read. Try a JPG or PNG.");
    } finally {
      setUploading(false);
    }
  }

  function switchFormat(f: "card" | "pfp") {
    setFormat(f);
    setCrop(DEFAULT_CROP);
  }

  function download() {
    if (!blobRef.current) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blobRef.current);
    a.download = format === "card" ? "hh-goa-2026-builder-id.png" : "hh-goa-2026-pfp.png";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function share() {
    if (!blobRef.current) return;
    const file = new File([blobRef.current], "hh-goa-2026.png", { type: "image/png" });
    const text = CAPTION;
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    if (nav.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text });
        return;
      } catch {
        /* fall through to X intent */
      }
    }
    download();
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener",
    );
  }

  async function copyCaption() {
    try {
      await navigator.clipboard.writeText(CAPTION);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  const ready = !!preview && !busy;

  return (
    <main className="relative min-h-screen overflow-x-clip bg-background text-foreground">
      <TropicalScenery />

      {/* marquee */}
      <div className="w-full -rotate-1 border-y-2 border-primary bg-primary py-2 text-primary-foreground">
        <div className="hh-marquee-track flex w-max gap-8 whitespace-nowrap font-mono text-xs tracking-widest">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="flex items-center gap-8">
              {item} <span className="text-accent">✦</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 pb-32 pt-6 sm:pb-24">
        <header className="flex flex-wrap items-center justify-between gap-3 pt-4 font-mono text-[11px] tracking-widest text-primary">
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-secondary" />
            HACKER HOUSE GOA 2026
          </span>
          <span className="rounded-full border-2 border-primary px-3 py-1">
            OPEN SEASON · 28–31 OCT 2026
          </span>
        </header>

        <h1 className="mt-6 select-none font-display text-6xl leading-[0.88] tracking-tight text-primary [text-shadow:6px_6px_0_var(--color-secondary)] sm:text-8xl">
          FRAME IN GOA
        </h1>
        <p className="mt-5 max-w-xl text-sm text-foreground/80 sm:text-base">
          Drop a photo, drag it into place, get your Hacker House Goa 2026 graphic. No login, no
          crop app, no wait.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 font-mono text-[10px] tracking-widest text-secondary">
          <span className="rounded-full bg-secondary/10 px-3 py-1">01 SNAP</span>
          <span className="rounded-full bg-secondary/10 px-3 py-1">02 DETAILS</span>
          <span className="rounded-full bg-secondary/10 px-3 py-1">03 SHIP IT</span>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:items-start">
          {/* controls */}
          <section className="space-y-8">
            {/* step 1 */}
            <StepCard n="01" title="SNAP YOUR PHOTO">
              <div className="inline-flex rounded-full border-2 border-primary p-1">
                {(["card", "pfp"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => switchFormat(f)}
                    className={`rounded-full px-4 py-2 font-mono text-xs tracking-widest transition ${
                      format === f
                        ? "bg-accent text-accent-foreground"
                        : "text-primary hover:bg-primary/10"
                    }`}
                  >
                    {f === "card" ? "BUILDER ID CARD" : "PFP FRAME"}
                  </button>
                ))}
              </div>

              <div className="mt-4">
                {photo ? (
                  <div className="hh-pop-in space-y-3">
                    <PhotoCropper
                      image={photo}
                      crop={crop}
                      onChange={setCrop}
                      aspect={format === "card" ? 402 / 442 : 1}
                      rounded={format === "card" ? "card" : "circle"}
                    />
                    <button
                      onClick={() => inputRef.current?.click()}
                      className="font-mono text-[11px] tracking-widest text-secondary underline decoration-dotted underline-offset-4"
                    >
                      SWAP PHOTO
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="photo-upload"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      onFile(e.dataTransfer.files?.[0]);
                    }}
                    className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/60 bg-card px-6 py-12 text-center transition hover:border-accent hover:bg-accent/5"
                  >
                    <span className="font-display text-2xl text-primary">
                      {uploading ? "READING…" : "UPLOAD YOUR PHOTO"}
                    </span>
                    <span className="mt-1 font-mono text-[11px] tracking-widest text-foreground/60">
                      JPG · PNG · HEIC — any crop works, drag to reframe after
                    </span>
                  </label>
                )}
                <input
                  ref={inputRef}
                  id="photo-upload"
                  type="file"
                  accept="image/*,.heic,.heif"
                  className="hidden"
                  onChange={(e) => onFile(e.target.files?.[0])}
                />
              </div>
            </StepCard>

            {/* step 2 */}
            {format === "card" && (
              <StepCard n="02" title="ADD YOUR DETAILS">
                <div className="space-y-4">
                  <Field label="NAME">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Arjun Shetty"
                      maxLength={48}
                      className="w-full rounded-xl border-2 border-primary/40 bg-card px-4 py-3 outline-none focus:border-accent"
                    />
                  </Field>
                  <Field label="STACK / ROLE">
                    <input
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="Full Stack Developer"
                      maxLength={40}
                      className="w-full rounded-xl border-2 border-primary/40 bg-card px-4 py-3 outline-none focus:border-accent"
                    />
                  </Field>
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-secondary/10 px-4 py-3">
                    <p className="font-mono text-xs tracking-widest text-secondary">
                      TITLE → <span className="text-primary">{builderTitle.toUpperCase()}</span>
                    </p>
                    <button
                      onClick={() => setTitleNonce((n) => n + 1)}
                      title="Shuffle builder title"
                      className="shrink-0 rounded-full border-2 border-secondary px-3 py-1 font-mono text-[10px] tracking-widest text-secondary transition hover:bg-secondary hover:text-secondary-foreground"
                    >
                      🎲 SHUFFLE
                    </button>
                  </div>
                </div>
              </StepCard>
            )}

            {format === "pfp" && (
              <StepCard n="02" title="PICK A THEME">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {PFP_VARIANTS.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setPfpVariant(v.id)}
                      className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition ${
                        pfpVariant === v.id
                          ? "border-accent bg-accent/10"
                          : "border-primary/30 hover:border-primary/60"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`h-10 w-10 rounded-full border-2 ${THEME_SWATCH[v.id]}`}
                      />
                      <span className="font-mono text-[10px] tracking-widest text-primary">
                        {v.label.toUpperCase()}
                      </span>
                    </button>
                  ))}
                </div>
              </StepCard>
            )}

            {error && (
              <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </p>
            )}
          </section>

          {/* preview */}
          <section className="space-y-4 lg:sticky lg:top-6">
            <StepCard n="03" title="SHIP IT">
              <div
                className={`overflow-hidden rounded-2xl border-2 border-primary/50 bg-card p-3 shadow-[8px_8px_0_0_var(--color-accent)] transition-transform ${
                  ready ? "rotate-0" : ""
                }`}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Your Hacker House Goa 2026 graphic"
                    className="w-full rounded-xl"
                  />
                ) : (
                  <div className="flex aspect-[2/3] items-center justify-center rounded-xl bg-primary/10 text-center font-mono text-xs tracking-widest text-foreground/50">
                    {photo ? "RENDERING…" : "YOUR GRAPHIC APPEARS HERE"}
                  </div>
                )}
              </div>

              <div className="mt-4 hidden flex-wrap gap-3 sm:flex">
                <button
                  disabled={!preview || !photo || busy}
                  onClick={download}
                  className="flex-1 rounded-xl bg-primary px-5 py-4 font-display text-lg text-primary-foreground transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-40"
                >
                  {busy ? "RENDERING…" : "DOWNLOAD PNG"}
                </button>
                <button
                  disabled={!preview || !photo || busy}
                  onClick={share}
                  className="flex-1 rounded-xl bg-secondary px-5 py-4 font-display text-lg text-secondary-foreground transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-40"
                >
                  SHARE TO X
                </button>
              </div>
              <button
                disabled={!preview || !photo || busy}
                onClick={copyCaption}
                className="mt-3 hidden w-full rounded-xl border-2 border-primary/40 px-4 py-2 font-mono text-[11px] tracking-widest text-primary transition hover:border-accent disabled:opacity-40 sm:block"
              >
                {copied ? "CAPTION COPIED ✓" : "COPY CAPTION + #FrameInGoa"}
              </button>
              <p className="mt-3 font-mono text-[11px] leading-relaxed tracking-wide text-foreground/60">
                Sharing on mobile attaches the image directly. On desktop it downloads the PNG and
                opens X with your caption — just drag the image in.
              </p>
            </StepCard>
          </section>
        </div>
      </div>

      {/* mobile sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t-2 border-primary bg-card/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:hidden">
        <div className="flex gap-3">
          <button
            disabled={!preview || !photo || busy}
            onClick={download}
            className="flex-1 rounded-xl bg-primary px-4 py-3 font-display text-base text-primary-foreground disabled:opacity-40"
          >
            {busy ? "…" : "DOWNLOAD"}
          </button>
          <button
            disabled={!preview || !photo || busy}
            onClick={share}
            className="flex-1 rounded-xl bg-secondary px-4 py-3 font-display text-base text-secondary-foreground disabled:opacity-40"
          >
            SHARE TO X
          </button>
        </div>
      </div>

      <footer className="mx-auto max-w-6xl px-5 pb-8 pt-4 font-mono text-[11px] tracking-widest text-foreground/50">
        2:47 PM STUDIO × HACKER HOUSE GOA 2026 — Build. Code. Repeat.
      </footer>
    </main>
  );
}

function StepCard({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border-2 border-primary/30 bg-card/60 p-5 backdrop-blur-sm">
      <div className="mb-4 flex items-center gap-3">
        <span className="font-display text-sm text-secondary">{n}</span>
        <h2 className="font-display text-xl tracking-tight text-primary">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="font-mono text-[11px] tracking-widest text-secondary">{label}</span>
      {children}
    </label>
  );
}
