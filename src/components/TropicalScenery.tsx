// Small 4-point sparkle glyph, twinkling with a staggered delay.
const SPARKLES: { top: string; left: string; size: number; delay: string; color: string }[] = [
  { top: "9%", left: "18%", size: 16, delay: "0s", color: "var(--color-accent)" },
  { top: "16%", left: "63%", size: 11, delay: "0.7s", color: "var(--color-secondary)" },
  { top: "6%", left: "42%", size: 9, delay: "1.4s", color: "var(--color-primary)" },
  { top: "34%", left: "8%", size: 13, delay: "1.1s", color: "var(--color-secondary)" },
  { top: "46%", left: "92%", size: 15, delay: "0.3s", color: "var(--color-accent)" },
  { top: "58%", left: "35%", size: 10, delay: "1.7s", color: "var(--color-primary)" },
  { top: "68%", left: "78%", size: 12, delay: "0.5s", color: "var(--color-secondary)" },
  { top: "80%", left: "12%", size: 14, delay: "1s", color: "var(--color-accent)" },
  { top: "27%", left: "88%", size: 9, delay: "2s", color: "var(--color-primary)" },
  { top: "90%", left: "60%", size: 11, delay: "0.9s", color: "var(--color-secondary)" },
];

function Sparkle({
  top,
  left,
  size,
  delay,
  color,
}: {
  top: string;
  left: string;
  size: number;
  delay: string;
  color: string;
}) {
  return (
    <svg
      className="hh-sparkle absolute"
      style={{ top, left, width: size, height: size, animationDelay: delay, color }}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 0 L14.2 9.8 L24 12 L14.2 14.2 L12 24 L9.8 14.2 L0 12 L9.8 9.8 Z" />
    </svg>
  );
}

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

      {SPARKLES.map((s, i) => (
        <Sparkle key={i} {...s} />
      ))}

      {/* sunrise, top right — glossy gradient + glow halo + highlight + rays */}
      <div className="absolute -right-16 -top-20 h-64 w-64 sm:h-80 sm:w-80">
        <div className="hh-sun-halo absolute inset-0 rounded-full bg-accent/50 blur-3xl" />
        <svg className="hh-sun-rays absolute inset-0 h-full w-full opacity-70" viewBox="0 0 200 200">
          {Array.from({ length: 12 }).map((_, i) => (
            <rect
              key={i}
              x="98.5"
              y="6"
              width="3"
              height="20"
              rx="1.5"
              fill="var(--color-accent)"
              transform={`rotate(${i * 30} 100 100)`}
            />
          ))}
        </svg>
        <svg className="hh-sun relative h-full w-full" viewBox="0 0 200 200">
          <defs>
            <radialGradient id="hhSunGrad" cx="38%" cy="32%" r="75%">
              <stop offset="0%" stopColor="#fffbe0" />
              <stop offset="45%" stopColor="var(--color-accent)" />
              <stop offset="100%" stopColor="#e2b400" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="70" fill="url(#hhSunGrad)" />
          <circle
            cx="100"
            cy="100"
            r="70"
            fill="none"
            stroke="var(--color-secondary)"
            strokeWidth="4"
            opacity="0.5"
          />
          <ellipse
            cx="76"
            cy="70"
            rx="28"
            ry="15"
            fill="#ffffff"
            opacity="0.4"
            transform="rotate(-25 76 70)"
          />
        </svg>
      </div>

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
