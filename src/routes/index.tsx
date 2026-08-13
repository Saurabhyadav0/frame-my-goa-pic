import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { canvasToBlob, loadImage, preloadBrandArt, renderCard, renderPfp } from "@/lib/hh-render";
import { CAPTION, titleFor } from "@/lib/hh-brand";

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
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

const STACKS = ["React", "Node.js", "Python", "SQL", "AWS", "Go", "Rust", "Solidity", "Figma", "AI"];

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
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [stack, setStack] = useState<string[]>(["React", "Node.js"]);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const blobRef = useRef<Blob | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const builderTitle = titleFor(`${name}|${role}|${stack.join(",")}`);

  useEffect(() => {
    preloadBrandArt().catch(() => {});
  }, []);

  const generate = useCallback(async () => {
    if (!photo) return;
    setBusy(true);
    try {
      await (document as any).fonts?.ready;
      const canvas =
        format === "card"
          ? await renderCard({ photo, name, role, stack, builderTitle })
          : await renderPfp(photo);
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
  }, [photo, name, role, stack, builderTitle, format]);

  useEffect(() => {
    const t = setTimeout(generate, 120);
    return () => clearTimeout(t);
  }, [generate]);

  async function onFile(file?: File | null) {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      setPhoto(await fileToImage(file));
    } catch {
      setError("That file couldn't be read. Try a JPG or PNG.");
    } finally {
      setBusy(false);
    }
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
    const text = CAPTION(name, builderTitle);
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

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-5 pb-24 pt-8">
        <header className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs tracking-widest text-primary">
          <span>2:47 PM STUDIO</span>
          <span>GOA, INDIA · 28–31 OCT 2026</span>
        </header>

        <h1 className="mt-6 font-display text-5xl leading-[0.9] tracking-tight text-primary sm:text-7xl">
          FRAME IN GOA
        </h1>
        <p className="mt-3 max-w-xl text-sm text-foreground/80 sm:text-base">
          Drop a photo, get your Hacker House Goa 2026 graphic. No login, no wait.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)]">
          {/* controls */}
          <section className="space-y-5">
            <div className="inline-flex rounded-full border-2 border-primary p-1">
              {(["card", "pfp"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`rounded-full px-4 py-2 font-mono text-xs tracking-widest transition ${
                    format === f ? "bg-accent text-accent-foreground" : "text-primary"
                  }`}
                >
                  {f === "card" ? "BUILDER ID CARD" : "PFP FRAME"}
                </button>
              ))}
            </div>

            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                onFile(e.dataTransfer.files?.[0]);
              }}
              className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/60 bg-card px-6 py-10 text-center transition hover:border-accent"
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*,.heic,.heif"
                className="hidden"
                onChange={(e) => onFile(e.target.files?.[0])}
              />
              <span className="font-display text-2xl text-primary">
                {photo ? "SWAP PHOTO" : "UPLOAD YOUR PHOTO"}
              </span>
              <span className="mt-1 font-mono text-[11px] tracking-widest text-foreground/60">
                JPG · PNG · HEIC — any crop works
              </span>
            </label>

            {format === "card" && (
              <div className="space-y-4">
                <Field label="NAME">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Arjun Shetty"
                    className="w-full rounded-xl border-2 border-primary/40 bg-card px-4 py-3 outline-none focus:border-accent"
                  />
                </Field>
                <Field label="STACK / ROLE">
                  <input
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Full Stack Developer"
                    className="w-full rounded-xl border-2 border-primary/40 bg-card px-4 py-3 outline-none focus:border-accent"
                  />
                </Field>
                <Field label="TECH">
                  <div className="flex flex-wrap gap-2">
                    {STACKS.map((s) => {
                      const on = stack.includes(s);
                      return (
                        <button
                          key={s}
                          onClick={() =>
                            setStack((prev) =>
                              on ? prev.filter((x) => x !== s) : [...prev, s].slice(0, 5),
                            )
                          }
                          className={`rounded-full border-2 px-3 py-1.5 font-mono text-xs tracking-wide transition ${
                            on
                              ? "border-accent bg-accent text-accent-foreground"
                              : "border-primary/40 text-foreground/70"
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </Field>
                <p className="font-mono text-xs tracking-widest text-secondary">
                  BUILDER TITLE → {builderTitle.toUpperCase()}
                </p>
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}
          </section>

          {/* preview */}
          <section className="space-y-4">
            <div className="rounded-2xl border-2 border-primary/50 bg-card p-3">
              {preview ? (
                <img
                  src={preview}
                  alt="Your Hacker House Goa 2026 graphic"
                  className="w-full rounded-xl"
                />
              ) : (
                <div className="flex aspect-[2/3] items-center justify-center rounded-xl bg-primary/10 text-center font-mono text-xs tracking-widest text-foreground/50">
                  YOUR GRAPHIC APPEARS HERE
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                disabled={!preview || busy}
                onClick={download}
                className="flex-1 rounded-xl bg-primary px-5 py-4 font-display text-lg text-primary-foreground disabled:opacity-40"
              >
                {busy ? "RENDERING…" : "DOWNLOAD PNG"}
              </button>
              <button
                disabled={!preview || busy}
                onClick={share}
                className="flex-1 rounded-xl bg-secondary px-5 py-4 font-display text-lg text-secondary-foreground disabled:opacity-40"
              >
                SHARE TO X
              </button>
            </div>
            <p className="font-mono text-[11px] leading-relaxed tracking-wide text-foreground/60">
              Sharing on desktop downloads the PNG and opens X with your caption + #FrameInGoa —
              just drag the image in.
            </p>
          </section>
        </div>
      </div>
    </main>
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
