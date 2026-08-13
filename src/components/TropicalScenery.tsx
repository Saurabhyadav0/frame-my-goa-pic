// Decorative cartoon beach scenery for the page chrome — intentionally a different
// visual language from the flyer-silhouette palms drawn onto the generated card/PFP.
export function TropicalScenery() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="hh-blob-a absolute -left-32 -top-24 h-96 w-96 rounded-full bg-secondary/25 blur-3xl" />
      <div className="hh-blob-b absolute -right-24 top-1/3 h-[28rem] w-[28rem] rounded-full bg-accent/20 blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />

      {/* sunrise, top right */}
      <svg
        className="hh-sun absolute -right-10 -top-16 h-56 w-56 opacity-90 sm:h-72 sm:w-72"
        viewBox="0 0 200 200"
      >
        <circle cx="100" cy="100" r="70" fill="var(--color-accent)" />
        <circle cx="100" cy="100" r="70" fill="none" stroke="var(--color-secondary)" strokeWidth="4" opacity="0.5" />
      </svg>

      {/* palm tree, bottom left, swaying */}
      <svg
        className="hh-palm-left absolute -bottom-6 left-2 h-52 w-40 overflow-visible sm:h-72 sm:w-56"
        viewBox="0 0 120 160"
        fill="none"
      >
        <path d="M60 155 C55 110 65 70 62 20" stroke="var(--color-primary)" strokeWidth="9" strokeLinecap="round" />
        <g className="hh-frond" style={{ transformOrigin: "62px 20px" }}>
          <path d="M62 20 C40 5 15 8 2 25 C25 20 45 22 62 20Z" fill="var(--color-primary)" />
          <path d="M62 20 C48 -5 20 -10 3 2 C25 3 48 12 62 20Z" fill="var(--color-primary)" />
          <path d="M62 20 C75 -2 100 -6 115 8 C92 5 72 12 62 20Z" fill="var(--color-primary)" />
          <path d="M62 20 C80 3 108 8 118 25 C95 15 75 18 62 20Z" fill="var(--color-primary)" />
          <path d="M62 20 C58 -8 60 -25 70 -35 C68 -15 65 0 62 20Z" fill="var(--color-primary)" />
        </g>
        <circle cx="58" cy="34" r="6" fill="var(--color-secondary)" />
        <circle cx="70" cy="38" r="5.5" fill="var(--color-secondary)" />
      </svg>

      {/* palm tree, bottom right, swaying (offset timing) */}
      <svg
        className="hh-palm-right absolute -bottom-8 right-3 h-44 w-36 overflow-visible sm:h-64 sm:w-52"
        viewBox="0 0 120 160"
        fill="none"
      >
        <path d="M60 155 C65 112 52 75 58 22" stroke="var(--color-primary)" strokeWidth="8" strokeLinecap="round" />
        <g className="hh-frond" style={{ transformOrigin: "58px 22px", animationDelay: "-1.4s" }}>
          <path d="M58 22 C36 8 12 12 0 28 C22 22 42 24 58 22Z" fill="var(--color-primary)" />
          <path d="M58 22 C44 -3 18 -8 2 4 C22 5 44 14 58 22Z" fill="var(--color-primary)" />
          <path d="M58 22 C72 1 96 -3 110 10 C88 8 68 15 58 22Z" fill="var(--color-primary)" />
          <path d="M58 22 C76 6 102 10 112 27 C90 17 70 20 58 22Z" fill="var(--color-primary)" />
        </g>
        <circle cx="55" cy="36" r="5.5" fill="var(--color-secondary)" />
        <circle cx="66" cy="40" r="5" fill="var(--color-secondary)" />
      </svg>

      {/* horizon waves — static, full-bleed so the shoreline never shows a seam */}
      <svg
        className="absolute inset-x-0 bottom-0 h-28 w-full opacity-25 sm:h-36"
        viewBox="0 0 400 60"
        preserveAspectRatio="none"
      >
        <path
          d="M0 34 Q 25 14 50 34 T 100 34 T 150 34 T 200 34 T 250 34 T 300 34 T 350 34 T 400 34 V60 H0 Z"
          fill="var(--color-primary)"
        />
      </svg>
      <svg
        className="absolute inset-x-0 bottom-0 h-20 w-full opacity-40 sm:h-28"
        viewBox="0 0 400 60"
        preserveAspectRatio="none"
      >
        <path
          d="M0 40 Q 20 24 40 40 T 80 40 T 120 40 T 160 40 T 200 40 T 240 40 T 280 40 T 320 40 T 360 40 T 400 40 V60 H0 Z"
          fill="var(--color-primary)"
        />
      </svg>
    </div>
  );
}
